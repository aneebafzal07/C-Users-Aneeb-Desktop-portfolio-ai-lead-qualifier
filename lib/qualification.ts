import type {
  BudgetRange,
  BusinessType,
  ChatMessage,
  CurrentStatus,
  LeadEvaluation,
  QualificationFields,
  TimelineRange,
} from "@/lib/types";

export function countUserMessages(messages: ChatMessage[]) {
  return messages.filter((message) => message.role === "user").length;
}

export function buildCompletionReply(evaluation: LeadEvaluation) {
  const missingSummary =
    evaluation.missingFields.length > 0
      ? ` I have enough to score the lead now, though ${evaluation.missingFields
          .map(formatMissingField)
          .join(" and ")} is still estimated from context.`
      : "";

  return `Thanks, I have enough information to qualify this lead.${missingSummary} Review the lead score, qualification progress, and rationale in the panel.`;
}

export function parseQualification(
  content: string | null | undefined,
  messages: ChatMessage[]
): QualificationFields {
  const inferred = inferQualificationFromMessages(messages);
  if (!content) return inferred;

  try {
    const parsed = extractJsonObject(content);
    const normalized = normalizeQualification(parsed);

    return {
      businessType: pickValue(normalized.businessType, inferred.businessType),
      budget: pickValue(normalized.budget, inferred.budget),
      timeline: pickValue(normalized.timeline, inferred.timeline),
      currentStatus: pickValue(normalized.currentStatus, inferred.currentStatus),
      projectScope: normalized.projectScope || inferred.projectScope,
      requirementsClarity: pickValue(
        normalized.requirementsClarity,
        inferred.requirementsClarity
      ),
      hasExistingBusiness:
        normalized.hasExistingBusiness ?? inferred.hasExistingBusiness,
    };
  } catch {
    return inferred;
  }
}

function formatMissingField(field: string) {
  switch (field) {
    case "businessType":
      return "business type";
    case "currentStatus":
      return "current status";
    default:
      return field;
  }
}

function extractJsonObject(content: string) {
  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonCandidate = fencedMatch?.[1] ?? content;
  const objectMatch = jsonCandidate.match(/\{[\s\S]*\}/);
  const raw = objectMatch?.[0] ?? jsonCandidate;

  return JSON.parse(raw) as Partial<QualificationFields>;
}

function normalizeQualification(
  parsed: Partial<QualificationFields>
): QualificationFields {
  return {
    businessType: normalizeBusinessType(parsed.businessType),
    budget: normalizeBudget(parsed.budget),
    timeline: normalizeTimeline(parsed.timeline),
    currentStatus: normalizeCurrentStatus(parsed.currentStatus),
    projectScope:
      typeof parsed.projectScope === "string" ? parsed.projectScope.trim() : "",
    requirementsClarity: normalizeRequirementsClarity(
      parsed.requirementsClarity
    ),
    hasExistingBusiness: normalizeBoolean(parsed.hasExistingBusiness),
  };
}

function inferQualificationFromMessages(
  messages: ChatMessage[]
): QualificationFields {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
  const combined = userMessages.join(" ").toLowerCase();

  return {
    businessType: inferBusinessType(combined),
    budget: inferBudget(messages),
    timeline: inferTimeline(messages),
    currentStatus: inferCurrentStatus(combined),
    projectScope: inferProjectScope(userMessages),
    requirementsClarity:
      userMessages.length >= 3 ? "Clear" : userMessages.length > 0 ? "Unclear" : "Unknown",
    hasExistingBusiness: inferExistingBusiness(combined),
  };
}

function inferBusinessType(content: string): BusinessType {
  if (content.includes("saas")) return "SaaS";
  if (content.includes("agency")) return "Agency";
  if (content.includes("startup")) return "Startup";
  if (
    content.includes("e-commerce") ||
    content.includes("ecommerce") ||
    content.includes("online store")
  ) {
    return "E-commerce";
  }
  if (
    content.includes("restaurant") ||
    content.includes("clinic") ||
    content.includes("salon") ||
    content.includes("gym") ||
    content.includes("law firm") ||
    content.includes("real estate")
  ) {
    return "Local business";
  }
  if (
    content.includes("web development") ||
    content.includes("development") ||
    content.includes("software")
  ) {
    return "Other";
  }

  return "Unknown";
}

function inferBudget(messages: ChatMessage[]): BudgetRange {
  const userMessages = getUserMessages(messages);
  const budgetAnswer = findAnswerByAssistantPrompt(messages, [
    "budget",
    "price range",
    "investment",
    "how much",
  ]);

  const prioritizedMessages = [budgetAnswer, ...userMessages].filter(
    (message): message is string => Boolean(message)
  );

  for (const message of prioritizedMessages) {
    const normalized = normalizeBudget(message);
    if (normalized !== "Unknown") {
      return normalized;
    }

    const numericBudget = extractBudgetAmount(message);
    if (numericBudget !== null) {
      return bucketBudget(numericBudget);
    }
  }

  return "Unknown";
}

function inferTimeline(messages: ChatMessage[]): TimelineRange {
  const userMessages = getUserMessages(messages);
  const timelineAnswer = findAnswerByAssistantPrompt(messages, [
    "when are you looking to start",
    "timeline",
    "when do you want to start",
    "when are you planning",
  ]);

  const prioritizedMessages = [timelineAnswer, ...userMessages].filter(
    (message): message is string => Boolean(message)
  );

  for (const message of prioritizedMessages) {
    const normalized = normalizeTimeline(message);
    if (normalized !== "Unknown") {
      return normalized;
    }
  }

  return "Unknown";
}

function inferCurrentStatus(content: string): CurrentStatus {
  if (content.includes("redesign")) return "Needs redesign";
  if (content.includes("old website")) return "Old website";
  if (
    content.includes("launching") ||
    content.includes("growing") ||
    content.includes("scaling")
  ) {
    return "Scaling business";
  }
  if (
    content.includes("need a website") ||
    content.includes("build a website") ||
    content.includes("no website")
  ) {
    return "No website";
  }

  return "Unknown";
}

function inferProjectScope(userMessages: string[]) {
  return userMessages.slice(0, 3).join(" ").trim();
}

function inferExistingBusiness(content: string) {
  if (
    content.includes("my business") ||
    content.includes("our business") ||
    content.includes("current site") ||
    content.includes("redesign")
  ) {
    return true;
  }
  if (content.includes("launching")) return false;
  return null;
}

function extractBudgetAmount(content: string) {
  if (!looksLikeBudget(content)) {
    return null;
  }

  const match = content.match(
    /(?:\$|usd\s*)?(\d+(?:\.\d+)?)\s*(k|m|grand|thousand)?/i
  );
  if (!match) return null;

  const value = Number(match[1]);
  if (Number.isNaN(value)) return null;

  const suffix = match[2]?.toLowerCase();
  if (suffix === "k" || suffix === "grand" || suffix === "thousand") {
    return value * 1000;
  }
  if (suffix === "m") {
    return value * 1000000;
  }

  return value;
}

function normalizeBusinessType(value: unknown): BusinessType {
  const raw = toLowerString(value);
  if (!raw) return "Unknown";
  if (raw.includes("saas")) return "SaaS";
  if (raw.includes("agency")) return "Agency";
  if (raw.includes("startup")) return "Startup";
  if (raw.includes("e-commerce") || raw.includes("ecommerce")) return "E-commerce";
  if (raw.includes("local")) return "Local business";
  if (raw.includes("other")) return "Other";
  return "Unknown";
}

function normalizeBudget(value: unknown): BudgetRange {
  const raw = toLowerString(value);
  if (!raw) return "Unknown";
  if (raw.includes("unknown")) return "Unknown";
  if (!looksLikeBudget(raw)) return "Unknown";
  if (
    raw.includes("<$500") ||
    raw.includes("under $500") ||
    raw.includes("less than $500")
  ) {
    return "<$500";
  }
  if (
    raw.includes("$500-$2k") ||
    raw.includes("500-2") ||
    raw.includes("500 to 2")
  ) {
    return "$500-$2K";
  }
  if (
    raw.includes("$2k-$10k") ||
    raw.includes("2k-10k") ||
    raw.includes("2k to 10k") ||
    raw.includes("2000-10000")
  ) {
    return "$2K-$10K";
  }
  if (raw.includes("$10k+") || raw.includes("10k+")) return "$10K+";

  const inferred = extractBudgetAmount(raw);
  if (inferred === null) return "Unknown";
  return bucketBudget(inferred);
}

function normalizeTimeline(value: unknown): TimelineRange {
  const raw = toLowerString(value);
  if (!raw) return "Unknown";
  if (
    raw.includes("3 months") ||
    raw.includes("3+ months") ||
    raw.includes("few months") ||
    raw.includes("quarter") ||
    raw.includes("long term") ||
    raw.includes("long-term")
  ) {
    return "Long-term (3+ months)";
  }
  if (
    raw.includes("urgent") ||
    raw.includes("1-2 week") ||
    raw.includes("one week") ||
    raw.includes("two weeks") ||
    raw.includes("in a week") ||
    raw.includes("next week") ||
    raw.includes("asap") ||
    raw.includes("immediately")
  ) {
    return "Urgent (1-2 weeks)";
  }
  if (
    raw.includes("medium") ||
    raw.includes("1 month") ||
    raw.includes("one month") ||
    raw.includes("in a month") ||
    raw.includes("4 weeks")
  ) {
    return "Medium (1 month)";
  }
  return "Unknown";
}

function normalizeCurrentStatus(value: unknown): CurrentStatus {
  const raw = toLowerString(value);
  if (!raw) return "Unknown";
  if (raw.includes("redesign")) return "Needs redesign";
  if (raw.includes("old website")) return "Old website";
  if (raw.includes("scaling")) return "Scaling business";
  if (raw.includes("no website")) return "No website";
  return "Unknown";
}

function normalizeRequirementsClarity(value: unknown) {
  const raw = toLowerString(value);
  if (!raw) return "Unknown";
  if (raw.includes("clear")) return "Clear";
  if (raw.includes("unclear") || raw.includes("vague")) return "Unclear";
  return "Unknown";
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  const raw = toLowerString(value);
  if (!raw) return null;
  if (raw === "true" || raw === "yes") return true;
  if (raw === "false" || raw === "no") return false;
  return null;
}

function toLowerString(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function pickValue<T extends string>(primary: T, fallback: T) {
  return primary === "Unknown" ? fallback : primary;
}

function getUserMessages(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function findAnswerByAssistantPrompt(
  messages: ChatMessage[],
  promptSnippets: string[]
) {
  for (let index = 0; index < messages.length - 1; index += 1) {
    const current = messages[index];
    const next = messages[index + 1];

    if (
      current.role === "assistant" &&
      next.role === "user" &&
      promptSnippets.some((snippet) =>
        current.content.toLowerCase().includes(snippet)
      )
    ) {
      return next.content.trim();
    }
  }

  return null;
}

function looksLikeBudget(content: string) {
  const raw = content.toLowerCase();

  return (
    raw.includes("$") ||
    raw.includes("usd") ||
    raw.includes("budget") ||
    raw.includes("price") ||
    raw.includes("cost") ||
    raw.includes("k") ||
    raw.includes("grand") ||
    raw.includes("thousand")
  );
}

function bucketBudget(amount: number): BudgetRange {
  if (amount < 500) return "<$500";
  if (amount < 2000) return "$500-$2K";
  if (amount < 10000) return "$2K-$10K";
  return "$10K+";
}
