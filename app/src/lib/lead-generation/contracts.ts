import type {
  StakeholderType,
  VBridgePersona,
} from "@/types/persona";

export type LeadPlanStatus =
  | "PLANNED"
  | "NOT_APPLICABLE";

export type LeadPlanConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type ApolloExecutionMode =
  | "PLANNER_ONLY"
  | "LIVE";

export interface LeadSearchTarget {
  industries: string[];
  locations: string[];
  jobTitles: string[];
  seniorities: string[];
  companyKeywords: string[];
  exclusions: string[];
}

export interface LeadSearchRationale {
  summary: string;
  signals: string[];
}

export interface LeadSearchPlan {
  planId: string;
  personaId: string;
  stakeholderType: StakeholderType;
  organizationName: string;
  status: LeadPlanStatus;
  confidence: LeadPlanConfidence;
  executionMode: ApolloExecutionMode;
  target: LeadSearchTarget;
  resultLimit: number;
  rationale: LeadSearchRationale;
  generatedAt: string;
}

export interface LeadSearchPlanResponse {
  count: number;
  executionMode: ApolloExecutionMode;
  apolloCalled: false;
  plans: LeadSearchPlan[];
}

export interface PersonaPlannerInput {
  persona: VBridgePersona;
}
