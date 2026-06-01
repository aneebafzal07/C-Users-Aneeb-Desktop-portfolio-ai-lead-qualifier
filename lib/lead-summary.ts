import type { LeadEvaluation, QualificationFields } from "@/lib/types";

export function buildLeadSummary(evaluation: LeadEvaluation) {
  const parts = [
    `Business type: ${evaluation.businessType}`,
    `Budget: ${evaluation.budget}`,
    `Timeline: ${evaluation.timeline}`,
    `Status: ${evaluation.currentStatus}`,
  ];

  return parts.join(" | ");
}

export function buildEvaluationSummary(
  extracted: QualificationFields,
  evaluation: LeadEvaluation
) {
  return [
    `Lead score: ${evaluation.score.toFixed(1)} / 10`,
    `Priority: ${evaluation.leadType}`,
    `Summary: ${buildLeadSummary(evaluation)}`,
    `Recommendation: ${evaluation.recommendation}`,
    `Project scope: ${extracted.projectScope || "Not clearly captured yet."}`,
  ].join("\n");
}
