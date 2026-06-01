import type { LeadEvaluation } from "@/lib/types";

type LeadScoreCardProps = {
  evaluation: LeadEvaluation;
  conversationComplete: boolean;
};

const toneClasses: Record<LeadEvaluation["leadType"], string> = {
  "Cold Lead": "border-slate-200/20 bg-slate-100/10 text-slate-100",
  "Warm Lead": "border-amber-200/20 bg-amber-100/10 text-amber-100",
  "Hot Lead": "border-emerald-200/20 bg-emerald-100/10 text-emerald-100",
};

export default function LeadScoreCard({
  evaluation,
  conversationComplete,
}: LeadScoreCardProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(66,20,110,0.88),rgba(31,9,53,0.94))] p-5 shadow-[0_24px_80px_rgba(23,4,38,0.45)] backdrop-blur">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/45">
            Qualification state
          </p>
          <p className="mt-1 text-sm text-white">
            {conversationComplete ? "Final result" : "Live evaluation"}
          </p>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-sm ${
            conversationComplete
              ? "border-emerald-300/25 bg-emerald-200/10 text-emerald-100"
              : "border-fuchsia-200/20 bg-fuchsia-100/10 text-fuchsia-50"
          }`}
        >
          {conversationComplete ? "Completed" : "In progress"}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-100/55">
            Lead Score
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-semibold text-white">
              {evaluation.score.toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-fuchsia-100/55">/ 10</span>
          </div>
        </div>

        <div className={`rounded-full border px-3 py-1 text-sm ${toneClasses[evaluation.leadType]}`}>
          {evaluation.leadType}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoTile label="Business" value={evaluation.businessType} />
        <InfoTile label="Budget" value={evaluation.budget} />
        <InfoTile label="Timeline" value={evaluation.timeline} />
        <InfoTile label="Status" value={evaluation.currentStatus} />
      </div>

      <div className="mt-5 rounded-2xl border border-fuchsia-200/10 bg-[linear-gradient(135deg,rgba(244,114,182,0.1),rgba(168,85,247,0.08))] p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/55">
          Recommendation
        </p>
        <p className="mt-2 text-sm leading-6 text-fuchsia-50/90">
          {evaluation.recommendation}
        </p>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-100/45">
        {label}
      </p>
      <p className="mt-2 text-sm text-fuchsia-50">{value}</p>
    </div>
  );
}
