import { getRecentLeads } from "@/lib/leads";

export default async function DashboardPage() {
  const leads = await getRecentLeads();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#090311,#14061f)] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-200/70">
              Leads Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold">Qualified Leads</h1>
            <p className="mt-2 text-sm text-fuchsia-100/70">
              Review saved leads, handoff readiness, and export them for your sales team.
            </p>
          </div>
          <a
            href="/api/leads/export"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/15"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.24em] text-fuchsia-100/50">
            <span>Lead</span>
            <span>Business</span>
            <span>Budget / Timeline</span>
            <span>Score</span>
            <span>Handoff</span>
          </div>

          {leads.length === 0 ? (
            <div className="px-5 py-10 text-sm text-fuchsia-100/70">
              No saved leads yet. Complete a qualification flow to populate the dashboard.
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-5 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">
                      {lead.name || "Unnamed lead"}
                    </p>
                    <p className="mt-1 text-fuchsia-100/70">
                      {lead.email || "No email captured"}
                    </p>
                    <p className="mt-2 text-xs text-fuchsia-100/45">
                      {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p>{lead.evaluation.businessType}</p>
                    <p className="mt-2 text-fuchsia-100/70">
                      {lead.evaluation.currentStatus}
                    </p>
                  </div>
                  <div>
                    <p>{lead.evaluation.budget}</p>
                    <p className="mt-2 text-fuchsia-100/70">
                      {lead.evaluation.timeline}
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">
                      {lead.evaluation.score.toFixed(1)}
                    </p>
                    <p className="mt-1 text-fuchsia-100/70">
                      {lead.evaluation.leadType}
                    </p>
                  </div>
                  <div>
                    <p
                      className={
                        lead.evaluation.readyForHandoff
                          ? "text-emerald-200"
                          : "text-amber-200"
                      }
                    >
                      {lead.evaluation.readyForHandoff ? "Ready" : "Not ready"}
                    </p>
                    <p className="mt-2 text-fuchsia-100/70">
                      {lead.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
