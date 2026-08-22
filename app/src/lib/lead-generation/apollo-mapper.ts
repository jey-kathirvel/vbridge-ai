import "server-only";

import type {
  LeadSearchPlan,
} from "./contracts";

export const APOLLO_PEOPLE_SEARCH_ENDPOINT =
  "/api/v1/mixed_people/api_search" as const;

export const APOLLO_PEOPLE_SEARCH_METHOD =
  "POST" as const;

export interface ApolloPeopleSearchBody {
  "person_titles[]": string[];
  include_similar_titles: boolean;
  "person_locations[]": string[];
  "person_seniorities[]": string[];
  "organization_locations[]": string[];
  q_keywords: string;
  page: number;
  per_page: number;
}

export interface VBridgeUnmappedSignals {
  industries: string[];
  companyKeywords: string[];
  exclusions: string[];
  confidence: LeadSearchPlan["confidence"];
  rationale: LeadSearchPlan["rationale"];
}

export interface ApolloLeadDryRun {
  dryRunId: string;
  planId: string;
  personaId: string;
  organizationName: string;
  stakeholderType:
    LeadSearchPlan["stakeholderType"];
  executionMode: "DRY_RUN";
  apolloCalled: false;
  endpoint:
    typeof APOLLO_PEOPLE_SEARCH_ENDPOINT;
  method:
    typeof APOLLO_PEOPLE_SEARCH_METHOD;
  requestBody: ApolloPeopleSearchBody;
  mappedFields: string[];
  unmappedSignals: VBridgeUnmappedSignals;
  generatedAt: string;
}

const allowedSeniorities = new Set([
  "owner",
  "founder",
  "c_suite",
  "partner",
  "vp",
  "head",
  "director",
  "manager",
  "senior",
  "entry",
  "intern",
]);

function unique(
  values: string[],
): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeSeniorities(
  values: string[],
): string[] {
  return unique(values).filter(
    (value) =>
      allowedSeniorities.has(value),
  );
}

function buildKeywords(
  plan: LeadSearchPlan,
): string {
  return unique([
    ...plan.target.industries,
    ...plan.target.companyKeywords,
  ])
    .slice(0, 8)
    .join(" ");
}

function clampPerPage(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.max(
    1,
    Math.min(
      100,
      Math.trunc(value),
    ),
  );
}

export function mapPlanToApolloDryRun(
  plan: LeadSearchPlan,
): ApolloLeadDryRun {
  const locations = unique(
    plan.target.locations,
  );

  const requestBody: ApolloPeopleSearchBody = {
    "person_titles[]": unique(
      plan.target.jobTitles,
    ),
    include_similar_titles: true,
    "person_locations[]": locations,
    "person_seniorities[]":
      normalizeSeniorities(
        plan.target.seniorities,
      ),
    "organization_locations[]":
      locations,
    q_keywords: buildKeywords(plan),
    page: 1,
    per_page: clampPerPage(
      plan.resultLimit,
    ),
  };

  return {
    dryRunId:
      `APOLLO-DRY-RUN-${plan.personaId}`,
    planId: plan.planId,
    personaId: plan.personaId,
    organizationName:
      plan.organizationName,
    stakeholderType:
      plan.stakeholderType,
    executionMode: "DRY_RUN",
    apolloCalled: false,
    endpoint:
      APOLLO_PEOPLE_SEARCH_ENDPOINT,
    method:
      APOLLO_PEOPLE_SEARCH_METHOD,
    requestBody,
    mappedFields: [
      "person_titles[]",
      "include_similar_titles",
      "person_locations[]",
      "person_seniorities[]",
      "organization_locations[]",
      "q_keywords",
      "page",
      "per_page",
    ],
    unmappedSignals: {
      industries:
        plan.target.industries,
      companyKeywords:
        plan.target.companyKeywords,
      exclusions:
        plan.target.exclusions,
      confidence:
        plan.confidence,
      rationale:
        plan.rationale,
    },
    generatedAt:
      new Date().toISOString(),
  };
}

export function mapPlansToApolloDryRuns(
  plans: LeadSearchPlan[],
): ApolloLeadDryRun[] {
  return plans.map(
    mapPlanToApolloDryRun,
  );
}
