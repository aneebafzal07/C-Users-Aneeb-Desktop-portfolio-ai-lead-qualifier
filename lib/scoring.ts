import type { LeadEvaluation, LeadType, QualificationFields } from "@/lib/types";

export function calculateLeadScore(data: QualificationFields): LeadEvaluation {
  let score = 0;
  const reasoning: string[] = [];

  if (data.budget === "$2K-$10K" || data.budget === "$10K+") {
    score += 3;
    reasoning.push("Strong budget range for a custom build.");
  }

  if (data.timeline === "Urgent (1-2 weeks)") {
    score += 2;
    reasoning.push("Urgent timeline suggests high purchase intent.");
  }

  if (
    data.currentStatus === "Old website" ||
    data.currentStatus === "Needs redesign" ||
    data.currentStatus === "Scaling business"
  ) {
    score += 2;
    reasoning.push("Existing business momentum makes this lead more qualified.");
  }

  if (data.requirementsClarity === "Clear") {
    score += 2;
    reasoning.push("Requirements are clear enough for a confident sales follow-up.");
  }

  if (data.requirementsClarity === "Unclear") {
    score -= 2;
    reasoning.push("Some answers are still vague, which lowers short-term conversion confidence.");
  }

  if (data.hasExistingBusiness) {
    score += 1;
    reasoning.push("The lead appears to already have an operating business.");
  }

  score = Math.min(10, Math.max(0, score));

  const missingFields = getMissingFields(data);
  const leadType = getLeadType(score);

  if (reasoning.length === 0) {
    reasoning.push("The conversation is still early, so this score is provisional.");
  }

  return {
    ...data,
    score,
    leadType,
    recommendation: getRecommendation(leadType, missingFields.length),
    reasoning,
    missingFields,
    readyForHandoff: missingFields.length === 0 && score >= 6,
  };
}

function getMissingFields(data: QualificationFields) {
  const missing: string[] = [];

  if (data.businessType === "Unknown") missing.push("businessType");
  if (data.budget === "Unknown") missing.push("budget");
  if (data.timeline === "Unknown") missing.push("timeline");
  if (data.currentStatus === "Unknown") missing.push("currentStatus");

  return missing;
}

function getLeadType(score: number): LeadType {
  if (score >= 7) return "Hot Lead";
  if (score >= 4) return "Warm Lead";
  return "Cold Lead";
}

function getRecommendation(leadType: LeadType, missingFieldCount: number) {
  if (leadType === "Hot Lead" && missingFieldCount === 0) {
    return "Contact ASAP. This lead shows budget, intent, and enough clarity for a sales handoff.";
  }

  if (leadType === "Warm Lead") {
    return "Schedule a follow-up within 24 hours and clarify any missing commercial details.";
  }

  if (missingFieldCount > 0) {
    return "Keep qualifying. Capture the missing fields before handing this lead to sales.";
  }

  return "Nurture with a lighter-touch follow-up and validate urgency before spending sales time.";
}
