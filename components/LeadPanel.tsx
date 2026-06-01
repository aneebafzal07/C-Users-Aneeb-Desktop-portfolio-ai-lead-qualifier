import LeadScoreCard from "@/components/LeadScoreCard";
import type { LeadEvaluation } from "@/lib/types";

type LeadPanelProps = {
  evaluation: LeadEvaluation;
  conversationComplete: boolean;
};

const fieldLabels: Record<string, string> = {
  businessType: "Business type",
  budget: "Budget",
  timeline: "Timeline",
  currentStatus: "Current status",
};

export default function LeadPanel({
  evaluation,
  conversationComplete,
}: LeadPanelProps) {
  const completion = Math.round(
    ((4 - evaluation.missingFields.length) / 4) * 100
  );
  const capturedFields = 4 - evaluation.missingFields.length;

  return (
    <aside className="flex h-full w-full flex-col space-y-4 xl:min-h-0">
      <LeadScoreCard
        evaluation={evaluation}
        conversationComplete={conversationComplete}
      />

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,11,57,0.82),rgba(24,8,40,0.78))] p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-100/55">
              Qualification Progress
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {completion}%
            </p>
          </div>
          <div className="h-14 w-14 rounded-full border border-white/10 bg-white/5 p-1">
            <div className="flex h-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#581c87,#d946ef)] text-xs font-medium text-white">
              {capturedFields}/4
            </div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c026d3,#f472b6)]"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/45">
            Panel status
          </p>
          <p className="mt-2 text-sm text-fuchsia-50/90">
            {conversationComplete
              ? "Qualification finished. Final lead score and handoff guidance are ready."
              : "This panel updates live as the conversation captures more commercial details."}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {Object.entries(fieldLabels).map(([key, label]) => {
            const missing = evaluation.missingFields.includes(key);

            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <span className="text-fuchsia-50/90">{label}</span>
                <span className={missing ? "text-amber-200" : "text-emerald-200"}>
                  {missing ? "Pending" : "Captured"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,11,57,0.82),rgba(24,8,40,0.78))] p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-100/55">
          Lead Summary
        </p>
        <div className="mt-4 grid gap-3">
          <SummaryRow label="Project scope" value={evaluation.projectScope || "Not captured yet"} />
          <SummaryRow
            label="Requirements"
            value={evaluation.requirementsClarity}
          />
          <SummaryRow
            label="Existing business"
            value={
              evaluation.hasExistingBusiness === null
                ? "Unknown"
                : evaluation.hasExistingBusiness
                  ? "Yes"
                  : "No"
            }
          />
          <SummaryRow
            label="Sales handoff"
            value={evaluation.readyForHandoff ? "Ready" : "Not ready yet"}
            tone={evaluation.readyForHandoff ? "good" : "neutral"}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,11,57,0.82),rgba(24,8,40,0.78))] p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-100/55">
          Why This Score
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-fuchsia-50/90">
          {evaluation.reasoning.map((reason) => (
            <li key={reason} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              {reason}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-200"
      : tone === "neutral"
        ? "text-fuchsia-50/90"
        : "text-fuchsia-50";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-100/45">
        {label}
      </p>
      <p className={`mt-2 text-sm leading-6 ${toneClass}`}>{value}</p>
    </div>
  );
}
