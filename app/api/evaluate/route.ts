import { buildEvaluationSummary } from "@/lib/lead-summary";
import { logEvent } from "@/lib/logger";
import { openai, defaultEvalModel } from "@/lib/openai";
import { EVALUATION_PROMPT } from "@/lib/prompts";
import { parseQualification } from "@/lib/qualification";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateLeadScore } from "@/lib/scoring";
import type { ChatMessage, EvaluateLeadResponse } from "@/lib/types";
import { NextResponse } from "next/server";

type EvaluateRequest = {
  conversation: ChatMessage[];
};

export async function POST(req: Request) {
  const clientKey = req.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = checkRateLimit(`evaluate:${clientKey}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many evaluation requests. Please try again soon." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as EvaluateRequest;

    if (!body.conversation?.length) {
      return NextResponse.json(
        { error: "Conversation is required." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: defaultEvalModel,
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: EVALUATION_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(body.conversation),
        },
      ],
    });

    const extracted = parseQualification(
      completion.choices[0]?.message?.content,
      body.conversation
    );
    const evaluation = calculateLeadScore(extracted);

    const response: EvaluateLeadResponse = {
      score: evaluation.score,
      type: evaluation.leadType,
      summary: buildEvaluationSummary(extracted, evaluation),
      recommendation: evaluation.recommendation,
      extracted,
      evaluation,
    };

    return NextResponse.json(response);
  } catch (error) {
    logEvent("error", "Evaluate route failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Unable to evaluate the lead right now." },
      { status: 500 }
    );
  }
}
