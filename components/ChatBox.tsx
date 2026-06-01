"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useState } from "react";
import HowItWorksModal from "@/components/HowItWorksModal";
import MessageBubble from "@/components/MessageBubble";
import { calculateLeadScore } from "@/lib/scoring";
import type { ChatApiResponse, ChatMessage, LeadEvaluation } from "@/lib/types";
import { isValidEmail } from "@/lib/validation";

const STARTER_MESSAGE = "What are you looking to build for your business?";

const INITIAL_EVALUATION: LeadEvaluation = calculateLeadScore({
  businessType: "Unknown",
  budget: "Unknown",
  timeline: "Unknown",
  currentStatus: "Unknown",
  projectScope: "",
  requirementsClarity: "Unknown",
  hasExistingBusiness: null,
});

const QUICK_REPLIES = [
  "I need a website for my business",
  "We want to redesign our current site",
  "I'm launching a SaaS product soon",
];

export default function ChatBox() {
  const [conversationId, setConversationId] = useState(
    () => globalThis.crypto?.randomUUID?.() ?? `lead-${Date.now()}`,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: STARTER_MESSAGE,
    },
  ]);
  const [evaluation, setEvaluation] =
    useState<LeadEvaluation>(INITIAL_EVALUATION);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [error, setError] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const message = input.trim();
    if (!message || loading || conversationComplete) return;

    if (
      awaitingEmail &&
      message.toLowerCase() !== "skip" &&
      !isValidEmail(message)
    ) {
      setError("Please enter a valid email address or type skip.");
      return;
    }

    await sendMessage(message);
  }

  async function sendMessage(message: string) {
    setError("");

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: message },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          conversation: messages,
        }),
      });

      const data = (await response.json()) as Partial<ChatApiResponse> & {
        error?: string;
        detail?: string;
      };

      if (
        !response.ok ||
        !data.reply ||
        !data.evaluation ||
        !data.conversation
      ) {
        throw new Error(
          data.detail || data.error || "Unable to continue the chat.",
        );
      }

      setConversationId(data.conversation_id ?? conversationId);
      setMessages(data.conversation);
      setEvaluation(data.evaluation);
      setConversationComplete(Boolean(data.conversationComplete));
      setAwaitingEmail(Boolean(data.awaitingEmail));

      if (
        data.conversationComplete &&
        data.leadSaveStatus &&
        data.leadSaveStatus !== "saved"
      ) {
        setError(
          data.leadSaveStatus === "missing-supabase-config"
            ? "Lead qualified, but Supabase credentials are missing or the dev server needs a restart."
            : data.leadSaveError ||
                "Lead qualified, but saving to Supabase failed.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while messaging the AI.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <>
      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-1 px-4 py-4 md:px-6 xl:px-10">
        <section className="relative grid min-h-0 w-full flex-1 overflow-hidden rounded-[34px] border border-white/15 bg-[linear-gradient(180deg,rgba(21,7,34,0.96),rgba(13,5,24,0.94))] shadow-[0_40px_140px_rgba(10,2,20,0.72)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(232,121,249,0.7),transparent)]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <aside className="relative flex flex-col justify-between border-b border-white/10 p-6 md:p-8 xl:border-b-0 xl:border-r">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-fuchsia-200/80">
                Qualia
              </p>
              <div className="mt-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-300/25 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),rgba(147,51,234,0.34)_45%,rgba(76,18,125,0.92))] shadow-[0_0_24px_rgba(192,132,252,0.18)]">
                  <Image
                    src="/qualia-mark-v2.svg"
                    alt="Qualia logo"
                    width={42}
                    height={42}
                    unoptimized
                    className="h-10 w-10"
                  />
                </div>
                <h1 className="mt-6 text-3xl font-semibold text-white">
                  Welcome back
                </h1>
                <p className="mt-3 max-w-xs text-sm leading-6 text-fuchsia-100/70">
                  Capture buying intent, stop the chat at the right moment, and
                  let the scorecard close the loop.
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.26em] text-fuchsia-100/45">
                  Your AI qualifier
                </p>
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(true)}
                  className="group w-full rounded-2xl border border-fuchsia-200/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(217,70,239,0.08),rgba(168,85,247,0.1))] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-fuchsia-200/28 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(217,70,239,0.14),rgba(168,85,247,0.16))]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mt-2 text-sm font-medium text-fuchsia-50">
                         How I work?
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-200/16 bg-white/8 text-fuchsia-50 transition group-hover:translate-x-0.5 group-hover:shadow-[0_0_24px_rgba(217,70,239,0.24)]">
                      ?
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-10 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-fuchsia-100/55">
                Session Status
              </p>
              <p className="mt-3 text-sm text-white">
                {conversationComplete
                  ? "Qualification complete"
                  : loading
                    ? "Analyzing the latest answer"
                    : "Waiting for the next lead signal"}
              </p>
            </div>
          </aside>

          <div className="relative flex min-h-[50vh] min-w-0 flex-col px-4 py-4 md:px-6 md:py-6">
            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-white/15 bg-[linear-gradient(180deg,rgba(187,91,255,0.34),rgba(101,18,179,0.9)_65%,rgba(55,5,107,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_30px_80px_rgba(76,14,128,0.45)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.65),transparent_22%),radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(126,34,206,0.72),transparent_36%)]" />

              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="px-6 pt-6 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.35),rgba(216,180,254,0.18)_35%,rgba(147,51,234,0.6)_72%,rgba(107,33,168,0.85))] shadow-[0_0_60px_rgba(243,232,255,0.28)]">
                    <div className="h-4 w-4 rounded-full bg-pink-200 shadow-[0_0_20px_rgba(244,114,182,0.8)]" />
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold text-white">
                    What can I help you qualify?
                  </h2>
                  <p className="mt-2 text-sm text-fuchsia-100/75">
                    Short questions, clean stopping point, instant scoring.
                  </p>
                </div>

                <div className="relative z-10 px-6 pt-4">
                  <CompactLeadStrip evaluation={evaluation} />
                </div>

                <div className="relative z-10 mt-4 flex-1 space-y-4 overflow-y-auto px-6 py-4 pb-6">
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={`${message.role}-${index}`}
                      message={message}
                    />
                  ))}

                  {loading ? (
                    <div className="flex justify-start">
                      <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-fuchsia-50 backdrop-blur">
                        <span className="inline-flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.2s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.1s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {conversationComplete ? (
                    <div className="rounded-[24px] border border-emerald-200/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(52,211,153,0.1))] px-4 py-3 text-sm text-emerald-50">
                      Qualification complete. Review the score, progress, and
                      rationale in the panel.
                    </div>
                  ) : null}
                </div>

                <div className="sticky bottom-0 z-20 mx-4 mb-4 rounded-[24px] border border-white/20 bg-[rgba(42,12,74,0.95)] p-4 backdrop-blur md:mx-6 md:mb-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => void sendMessage(reply)}
                          disabled={loading || conversationComplete}
                          className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs text-fuchsia-50 transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>

                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={conversationComplete}
                      placeholder={
                        conversationComplete
                          ? "Qualification complete"
                          : awaitingEmail
                            ? "Share your email or type skip"
                            : "Ask anything..."
                      }
                      className="w-full border-0 bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-fuchsia-100/45 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {awaitingEmail ? (
                        <p className="text-xs text-fuchsia-100/70">
                          You can share a valid email for follow-up or type
                          `skip` to continue without one.
                        </p>
                      ) : (
                        <a
                          href="/dashboard"
                          className="text-xs text-fuchsia-100/70 transition hover:text-white"
                        >
                          View saved leads
                        </a>
                      )}
                      <button
                        type="submit"
                        disabled={
                          loading || !input.trim() || conversationComplete
                        }
                        className="rounded-full bg-[linear-gradient(135deg,#d946ef,#a855f7)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(217,70,239,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {awaitingEmail ? "Continue" : "Send"}
                      </button>
                    </div>

                    {error ? (
                      <p className="text-sm text-rose-200">{error}</p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function CompactLeadStrip({ evaluation }: { evaluation: LeadEvaluation }) {
  const items = [
    { label: "State", value: evaluation.leadType },
    { label: "Score", value: `${evaluation.score.toFixed(1)}/10` },
    { label: "Business", value: evaluation.businessType },
    { label: "Budget", value: evaluation.budget },
    { label: "Timeline", value: evaluation.timeline },
    { label: "Status", value: evaluation.currentStatus },
    { label: "Progress", value: `${4 - evaluation.missingFields.length}/4` },
    {
      label: "Handoff",
      value: evaluation.readyForHandoff ? "Ready" : "Not ready",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/15 bg-white/8 px-3 py-2"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-100/55">
            {item.label}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-fuchsia-50">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
