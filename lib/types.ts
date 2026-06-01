export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type LeadContact = {
  name?: string;
  email?: string;
};

export type BusinessType =
  | "E-commerce"
  | "SaaS"
  | "Local business"
  | "Agency"
  | "Startup"
  | "Other"
  | "Unknown";

export type BudgetRange =
  | "<$500"
  | "$500-$2K"
  | "$2K-$10K"
  | "$10K+"
  | "Unknown";

export type TimelineRange =
  | "Urgent (1-2 weeks)"
  | "Medium (1 month)"
  | "Long-term (3+ months)"
  | "Unknown";

export type CurrentStatus =
  | "No website"
  | "Old website"
  | "Needs redesign"
  | "Scaling business"
  | "Unknown";

export type LeadType = "Cold Lead" | "Warm Lead" | "Hot Lead";

export type QualificationFields = {
  businessType: BusinessType;
  budget: BudgetRange;
  timeline: TimelineRange;
  currentStatus: CurrentStatus;
  projectScope: string;
  requirementsClarity: "Clear" | "Unclear" | "Unknown";
  hasExistingBusiness: boolean | null;
};

export type LeadEvaluation = QualificationFields & {
  score: number;
  leadType: LeadType;
  recommendation: string;
  reasoning: string[];
  missingFields: string[];
  readyForHandoff: boolean;
};

export type SavedLead = LeadContact & {
  id: string;
  conversationId: string;
  conversationHash: string;
  summary: string;
  transcript: ChatMessage[];
  evaluation: LeadEvaluation;
  createdAt: string;
};

export type ChatApiRequest = LeadContact & {
  message: string;
  conversation_id: string;
  conversation?: ChatMessage[];
};

export type ChatApiResponse = {
  reply: string;
  conversation_id: string;
  conversation: ChatMessage[];
  evaluation: LeadEvaluation;
  conversationComplete: boolean;
  awaitingEmail?: boolean;
  leadSaveStatus?:
    | "not-complete"
    | "saved"
    | "missing-supabase-config"
    | "database-error";
  leadSaveError?: string;
};

export type EvaluateLeadResponse = {
  score: number;
  type: LeadType;
  summary: string;
  recommendation: string;
  extracted: QualificationFields;
  evaluation: LeadEvaluation;
};
