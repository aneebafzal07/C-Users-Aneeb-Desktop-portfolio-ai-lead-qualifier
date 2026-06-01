import { createHash } from "node:crypto";
import { buildLeadSummary } from "@/lib/lead-summary";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ChatMessage, LeadContact, LeadEvaluation, SavedLead } from "@/lib/types";

type SaveLeadInput = LeadContact & {
  conversationId: string;
  messages: ChatMessage[];
  evaluation: LeadEvaluation;
  conversationComplete: boolean;
};

export async function saveLead({
  conversationId,
  name,
  email,
  messages,
  evaluation,
  conversationComplete,
}: SaveLeadInput) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { saved: false, reason: "missing-supabase-config" as const };
  }

  const conversationHash = createHash("sha256")
    .update(JSON.stringify(messages))
    .digest("hex");

  const payload = {
    conversation_id: conversationId,
    conversation_hash: conversationHash,
    name: name || null,
    email: email || null,
    summary: buildLeadSummary(evaluation),
    business_type: evaluation.businessType,
    budget_range: evaluation.budget,
    timeline_range: evaluation.timeline,
    current_status: evaluation.currentStatus,
    project_scope: evaluation.projectScope || null,
    requirements_clarity: evaluation.requirementsClarity,
    has_existing_business: evaluation.hasExistingBusiness,
    score: evaluation.score,
    lead_type: evaluation.leadType,
    recommendation: evaluation.recommendation,
    reasoning: evaluation.reasoning,
    missing_fields: evaluation.missingFields,
    ready_for_handoff: evaluation.readyForHandoff,
    conversation_complete: conversationComplete,
    transcript: messages,
  };

  const { error } = await supabase
    .from("leads")
    .upsert(payload, { onConflict: "conversation_hash" });

  if (error) {
    return {
      saved: false,
      reason: "database-error" as const,
      error: error.message,
    };
  }

  return { saved: true as const };
}

export async function getRecentLeads(limit = 50): Promise<SavedLead[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(mapRowToLead);
}

export function convertLeadsToCsv(leads: SavedLead[]) {
  const header = [
    "created_at",
    "name",
    "email",
    "conversation_id",
    "lead_type",
    "score",
    "business_type",
    "budget",
    "timeline",
    "current_status",
    "summary",
    "recommendation",
  ];

  const rows = leads.map((lead) => [
    lead.createdAt,
    lead.name || "",
    lead.email || "",
    lead.conversationId,
    lead.evaluation.leadType,
    lead.evaluation.score.toFixed(1),
    lead.evaluation.businessType,
    lead.evaluation.budget,
    lead.evaluation.timeline,
    lead.evaluation.currentStatus,
    lead.summary,
    lead.evaluation.recommendation,
  ]);

  return [header, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
        .join(",")
    )
    .join("\n");
}

function mapRowToLead(row: Record<string, unknown>): SavedLead {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    conversationHash: String(row.conversation_hash),
    name: typeof row.name === "string" ? row.name : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    summary: String(row.summary ?? ""),
    transcript: Array.isArray(row.transcript)
      ? (row.transcript as ChatMessage[])
      : [],
    createdAt: String(row.created_at ?? ""),
    evaluation: {
      businessType: String(row.business_type) as LeadEvaluation["businessType"],
      budget: String(row.budget_range) as LeadEvaluation["budget"],
      timeline: String(row.timeline_range) as LeadEvaluation["timeline"],
      currentStatus: String(row.current_status) as LeadEvaluation["currentStatus"],
      projectScope: String(row.project_scope ?? ""),
      requirementsClarity: String(
        row.requirements_clarity
      ) as LeadEvaluation["requirementsClarity"],
      hasExistingBusiness:
        typeof row.has_existing_business === "boolean"
          ? row.has_existing_business
          : null,
      score: Number(row.score ?? 0),
      leadType: String(row.lead_type) as LeadEvaluation["leadType"],
      recommendation: String(row.recommendation ?? ""),
      reasoning: Array.isArray(row.reasoning) ? (row.reasoning as string[]) : [],
      missingFields: Array.isArray(row.missing_fields)
        ? (row.missing_fields as string[])
        : [],
      readyForHandoff: Boolean(row.ready_for_handoff),
    },
  };
}
