import { convertLeadsToCsv, getRecentLeads } from "@/lib/leads";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientKey = req.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = checkRateLimit(`export:${clientKey}`, 10, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many export requests. Please try again later." },
      { status: 429 }
    );
  }

  const leads = await getRecentLeads(500);
  const csv = convertLeadsToCsv(leads);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=qualified-leads.csv",
    },
  });
}
