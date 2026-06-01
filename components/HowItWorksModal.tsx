"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type HowItWorksModalProps = {
  open: boolean;
  onClose: () => void;
};

const steps = [
  {
    id: "context",
    eyebrow: "Step 1",
    title: "Capture business context",
    summary:
      "The AI opens with high-signal discovery prompts so every conversation starts with commercial context, not fluff.",
    points: [
      "Identifies what the lead wants to build and which business they are in.",
      "Pulls out project scope and how clearly the lead understands the ask.",
      "Builds a structured profile in real time while the chat still feels natural.",
    ],
    calloutTitle: "What the AI is listening for",
    calloutBody:
      "Business type, project scope, and whether the lead already has momentum give the sales team useful context before budget even appears.",
  },
  {
    id: "budget",
    eyebrow: "Step 2",
    title: "Detect budget and urgency",
    summary:
      "The flow steers toward money and timing early enough to qualify, but softly enough to keep the lead engaged.",
    points: [
      "Surfaces budget fit across low, mid, and high-intent ranges.",
      "Spots urgency signals like immediate launches or redesign pressure.",
      "Tracks current status, such as no site, an outdated site, or a scaling business.",
    ],
    calloutTitle: "Why these questions matter",
    calloutBody:
      "Budget and timeline are some of the fastest indicators of purchase intent, so the AI prioritizes them before deciding whether to keep probing or hand off.",
  },
  {
    id: "scoring",
    eyebrow: "Step 3",
    title: "AI lead scoring",
    summary:
      "As answers come in, the system updates the score, lead type, and rationale so the team can trust how the model reached its recommendation.",
    points: [
      "Each answer updates the scorecard instantly with visible reasoning.",
      "Missing details keep the lead in a live evaluation state until enough is known.",
      "The panel explains why a lead is hot, warm, or cold instead of hiding the logic.",
    ],
    calloutTitle: "How scoring works",
    calloutBody:
      "Budget: +3, Urgent timeline: +2, Existing business momentum: +2, Clear requirements: +2, Operating business: +1, Unclear requirements: -2.",
  },
  {
    id: "handoff",
    eyebrow: "Step 4",
    title: "Sales-ready handoff",
    summary:
      "Once the score is strong and the core fields are complete, the product shifts from qualification mode to action mode.",
    points: [
      "Only marks a lead as handoff-ready when the core commercial fields are captured.",
      "Pairs the final score with a recommendation for sales follow-up.",
      "Keeps the transcript and rationale attached so reps get context, not just a number.",
    ],
    calloutTitle: "Handoff rule",
    calloutBody:
      "A lead becomes sales-ready when all required fields are captured and the score reaches at least 6 out of 10.",
  },
] as const;

const exampleMoments = [
  {
    label: "Sample lead",
    value: "A SaaS founder needs a website redesign before a product launch.",
  },
  {
    label: "Score change",
    value:
      "Budget $10K+ (+3), urgent launch in 1-2 weeks (+2), scaling business (+2), clear goals (+2), existing business (+1) = 10/10.",
  },
  {
    label: "Why AI asked follow-ups",
    value:
      "It asked about budget, launch timing, and current website status because those answers are the strongest predictors of sales readiness in the current model.",
  },
];

export default function HowItWorksModal({
  open,
  onClose,
}: HowItWorksModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [showExample, setShowExample] = useState(false);

  function closeModal() {
    setActiveStep(0);
    setShowExample(false);
    onClose();
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveStep(0);
        setShowExample(false);
        onClose();
      }

      if (event.key === "ArrowRight") {
        setActiveStep((current) => Math.min(current + 1, steps.length - 1));
      }

      if (event.key === "ArrowLeft") {
        setActiveStep((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const step = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="absolute inset-0 bg-[rgba(6,2,14,0.74)] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-it-works-title"
            className="relative z-10 flex max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(180deg,rgba(33,12,56,0.86),rgba(14,5,27,0.94))] shadow-[0_40px_140px_rgba(8,1,18,0.72)]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(244,114,182,0.7),transparent)]" />
            <div className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="flex min-h-0 w-full flex-col lg:flex-row">
              <aside className="border-b border-white/10 bg-white/[0.03] p-5 lg:min-h-0 lg:w-[290px] lg:border-b-0 lg:border-r lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/55">
                      Walkthrough
                    </p>
                    <h2
                      id="how-it-works-title"
                      className="mt-3 text-2xl font-semibold text-white"
                    >
                      How the AI qualifies leads, step by step
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-fuchsia-100/72">
                      A transparent look at how the AI qualifies, scores, and
                      hands off leads.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="group relative inline-flex h-6 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-fuchsia-400/40 hover:bg-fuchsia-500/15 hover:shadow-[0_0_25px_rgba(217,70,239,0.45)] active:scale-95"
                    aria-label="Close how this works modal"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* X Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="relative z-10 h-5 w-5 text-fuchsia-50 transition-transform duration-300 group-hover:rotate-90"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#d946ef,#8b5cf6,#f472b6)]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-fuchsia-100/50">
                    Step {activeStep + 1} of {steps.length}
                  </p>
                </div>

                <nav className="mt-6 space-y-3" aria-label="Walkthrough steps">
                  {steps.map((item, index) => {
                    const isActive = index === activeStep;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-fuchsia-300/35 bg-[linear-gradient(135deg,rgba(244,114,182,0.18),rgba(168,85,247,0.18))] text-white shadow-[0_0_32px_rgba(217,70,239,0.24)]"
                            : "border-white/10 bg-white/[0.04] text-fuchsia-50/80 hover:bg-white/[0.07]"
                        }`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium ${
                              isActive
                                ? "border-fuchsia-200/45 bg-fuchsia-200/18 shadow-[0_0_22px_rgba(217,70,239,0.35)]"
                                : "border-white/12 bg-white/5"
                            }`}
                          >
                            0{index + 1}
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/45">
                              {item.eyebrow}
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
                  <div className="flex gap-2">
                    {steps.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        aria-label={`Go to ${item.title}`}
                        className={`h-2.5 rounded-full transition ${
                          index === activeStep
                            ? "w-10 bg-[linear-gradient(90deg,#f472b6,#a855f7)] shadow-[0_0_18px_rgba(217,70,239,0.45)]"
                            : "w-2.5 bg-white/20 hover:bg-white/35"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExample((current) => !current)}
                    className="rounded-full border border-fuchsia-200/20 bg-white/8 px-4 py-2 text-xs font-medium text-fuchsia-50 transition hover:bg-white/14"
                  >
                    {showExample
                      ? "Hide example qualification"
                      : "See an example qualification"}
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/55">
                          {step.eyebrow}
                        </p>
                        <h3 className="mt-3 text-3xl font-semibold text-white">
                          {step.title}
                        </h3>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-fuchsia-50/84">
                          {step.summary}
                        </p>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
                        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-100/45">
                            What happens here
                          </p>
                          <div className="mt-4 space-y-3">
                            {step.points.map((point) => (
                              <div
                                key={point}
                                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-fuchsia-50/88"
                              >
                                {point}
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="rounded-[28px] border border-fuchsia-200/10 bg-[linear-gradient(180deg,rgba(95,26,146,0.26),rgba(255,255,255,0.04))] p-5">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-100/45">
                            {step.calloutTitle}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-fuchsia-50/86">
                            {step.calloutBody}
                          </p>

                          {step.id === "scoring" ? (
                            <div className="mt-5 grid gap-2">
                              {[
                                ["Budget", "+3"],
                                ["Urgent timeline", "+2"],
                                ["Clear business momentum", "+2"],
                                ["Clear requirements", "+2"],
                                ["Decision-ready operating business", "+1"],
                                ["Unclear answers", "-2"],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm"
                                >
                                  <span className="text-fuchsia-50/88">
                                    {label}
                                  </span>
                                  <span className="text-white">{value}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      </div>

                      <AnimatePresence>
                        {showExample ? (
                          <motion.section
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="rounded-[28px] border border-cyan-200/12 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.1),rgba(255,255,255,0.04))] p-5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/60">
                                  Example qualification
                                </p>
                                <h4 className="mt-2 text-xl font-semibold text-white">
                                  Why this lead would score high
                                </h4>
                              </div>
                              <div className="rounded-full border border-emerald-200/20 bg-emerald-100/10 px-3 py-1 text-sm text-emerald-100">
                                Example score: 10/10
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-3">
                              {exampleMoments.map((item) => (
                                <div
                                  key={item.label}
                                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                                >
                                  <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/45">
                                    {item.label}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-fuchsia-50/88">
                                    {item.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.section>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-fuchsia-100/68">
                      Keyboard support: use left and right arrow keys to move
                      between steps, or press Esc to close.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStep((current) => Math.max(current - 1, 0))
                        }
                        disabled={activeStep === 0}
                        className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-fuchsia-50 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStep((current) =>
                            Math.min(current + 1, steps.length - 1),
                          )
                        }
                        disabled={activeStep === steps.length - 1}
                        className="rounded-full bg-[linear-gradient(135deg,#d946ef,#8b5cf6)] px-5 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(168,85,247,0.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
