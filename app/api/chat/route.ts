import { getConversation, upsertConversation } from "@/lib/conversation-store";
import { saveLead } from "@/lib/leads";
import { logEvent } from "@/lib/logger";
import { notifySalesTeam } from "@/lib/notifications";
import { openai, defaultChatModel, defaultEvalModel } from "@/lib/openai";
import { EVALUATION_PROMPT, SYSTEM_PROMPT } from "@/lib/prompts";
import {
  buildCompletionReply,
  countUserMessages,
  parseQualification,
} from "@/lib/qualification";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateLeadScore } from "@/lib/scoring";
import { isValidEmail } from "@/lib/validation";
import type {
  ChatApiRequest,
  ChatApiResponse,
  ChatMessage,
} from "@/lib/types";
import { NextResponse } from "next/server";

type LegacyChatRequest = {
  messages?: ChatMessage[];
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  const clientKey = req.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = checkRateLimit(`chat:${clientKey}`, 30, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down for a moment." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as ChatApiRequest & LegacyChatRequest;
    const normalized = normalizeChatRequest(body);

    if (!normalized.message || !normalized.conversationId) {
      return NextResponse.json(
        { error: "message and conversation_id are required." },
        { status: 400 }
      );
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: normalized.message,
    };
    const conversationBeforeAssistant = [
      ...normalized.messages,
      userMessage,
    ];

    const [chatCompletion, evaluationCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: defaultChatModel,
        max_tokens: 220,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversationBeforeAssistant,
        ],
      }),
      openai.chat.completions.create({
        model: defaultEvalModel,
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EVALUATION_PROMPT },
          { role: "user", content: JSON.stringify(conversationBeforeAssistant) },
        ],
      }),
    ]);

    const extracted = parseQualification(
      chatContent(evaluationCompletion.choices[0]?.message?.content),
      conversationBeforeAssistant
    );
    const evaluation = calculateLeadScore(extracted);
    const qualificationComplete =
      evaluation.missingFields.length === 0 ||
      countUserMessages(conversationBeforeAssistant) >= 6;

    const capturedEmail =
      normalized.email ?? extractEmail(normalized.message) ?? undefined;
    const awaitingEmail = Boolean(normalized.awaitingEmail);

    let reply = chatContent(chatCompletion.choices[0]?.message?.content)
      || "Great. What type of business do you run?";
    let conversationComplete = false;
    let nextAwaitingEmail = false;

    if (awaitingEmail) {
      if (isSkipMessage(normalized.message)) {
        reply = buildCompletionReply(evaluation);
        conversationComplete = true;
      } else if (capturedEmail && isValidEmail(capturedEmail)) {
        reply = `Thanks. I’ve saved your email and I’ll pass this lead along. ${buildCompletionReply(evaluation)}`;
        conversationComplete = true;
      } else {
        reply =
          "Thanks. If you’d like, share a valid email for follow-up, or just reply `skip` and I’ll continue without it.";
        nextAwaitingEmail = true;
      }
    } else if (qualificationComplete) {
      if (capturedEmail && !isValidEmail(capturedEmail)) {
        reply =
          "That email doesn’t look valid yet. Please send a valid email, or reply `skip` if you’d rather not share one.";
        nextAwaitingEmail = true;
      } else if (!capturedEmail) {
        reply =
          "You’re all set. If you’d like a follow-up, share your email now. You can also reply `skip` and I’ll continue without it.";
        nextAwaitingEmail = true;
      } else {
        reply = buildCompletionReply(evaluation);
        conversationComplete = true;
      }
    }

    const conversation = [
      ...conversationBeforeAssistant,
      { role: "assistant", content: reply } satisfies ChatMessage,
    ];

    upsertConversation(normalized.conversationId, conversation, {
      name: normalized.name,
      email: capturedEmail,
      awaitingEmail: nextAwaitingEmail,
    });

    let leadSaveStatus: ChatApiResponse["leadSaveStatus"] = "not-complete";
    let leadSaveError: string | undefined;

    if (conversationComplete) {
      const saveResult = await saveLead({
        conversationId: normalized.conversationId,
        name: normalized.name,
        email: capturedEmail,
        messages: conversation,
        evaluation,
        conversationComplete,
      });

      leadSaveStatus = saveResult.reason ?? "saved";

      if ("error" in saveResult) {
        leadSaveError = saveResult.error;
        logEvent("error", "Lead save failed", {
          conversationId: normalized.conversationId,
          error: saveResult.error,
        });
      } else if (saveResult.saved && evaluation.leadType === "Hot Lead" && capturedEmail) {
        await notifySalesTeam({
          conversationId: normalized.conversationId,
          name: normalized.name,
          email: capturedEmail,
          evaluation,
        });
      }
    }

    const response: ChatApiResponse = {
      reply,
      conversation_id: normalized.conversationId,
      conversation,
      evaluation,
      conversationComplete,
      awaitingEmail: nextAwaitingEmail,
      leadSaveStatus,
      leadSaveError,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    logEvent("error", "Chat route failed", {
      error: message,
    });

    return NextResponse.json(
      {
        error: "Unable to process the lead conversation right now.",
        detail:
          process.env.NODE_ENV === "production" ? undefined : message,
      },
      { status: 500 }
    );
  }
}

function normalizeChatRequest(body: ChatApiRequest & LegacyChatRequest) {
  if (typeof body.message === "string" && typeof body.conversation_id === "string") {
    const storedConversation = getConversation(body.conversation_id.trim());

    return {
      message: body.message.trim(),
      conversationId: body.conversation_id.trim(),
      name: cleanOptional(body.name),
      email: cleanOptional(body.email),
      awaitingEmail: storedConversation?.awaitingEmail ?? false,
      messages:
        normalizeConversation(body.conversation).length > 0
          ? normalizeConversation(body.conversation)
          : storedConversation?.messages ?? [],
    };
  }

  const messages = normalizeConversation(body.messages);
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const priorMessages =
    lastUserMessage
      ? messages.slice(0, messages.lastIndexOf(lastUserMessage))
      : messages;

  return {
    message: lastUserMessage?.content.trim() ?? "",
    conversationId: crypto.randomUUID(),
    name: undefined,
    email: undefined,
    awaitingEmail: false,
    messages: priorMessages,
  };
}

function normalizeConversation(messages: ChatMessage[] | undefined) {
  if (!messages?.length) return [];

  return messages.filter(
    (message): message is ChatMessage =>
      Boolean(message)
      && (message.role === "assistant" || message.role === "user")
      && typeof message.content === "string"
      && message.content.trim().length > 0
  );
}

function cleanOptional(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function chatContent(content: string | null | undefined) {
  return content?.trim() ?? "";
}

function extractEmail(message: string) {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0];
}

function isSkipMessage(message: string) {
  const value = message.trim().toLowerCase();
  return value === "skip" || value === "no" || value === "no thanks";
}
