export const apolloCapabilityMap = {
  matchmaking: {
    label: "AI Matchmaking",
    owner: "V-BRIDGE",
    apolloRole:
      "Organization and people discovery data source",
    vbridgeRole:
      "Persona mapping, compatibility scoring, ranking and explanations",
    status: "FOUNDATION_READY",
  },

  investmentReadiness: {
    label: "AI Investment Readiness",
    owner: "V-BRIDGE",
    apolloRole:
      "Organization intelligence and enrichment data source where supported",
    vbridgeRole:
      "Readiness framework, evidence weighting, gap analysis and scoring",
    status: "FOUNDATION_READY",
  },

  leadGeneration: {
    label: "AI Lead Generation",
    owner: "V-BRIDGE",
    apolloRole:
      "People and organization search plus enrichment where permitted",
    vbridgeRole:
      "Persona-driven targeting, query orchestration, ranking and result presentation",
    status: "FOUNDATION_READY",
  },

  eventsAndNews: {
    label: "AI Events & News",
    owner: "V-BRIDGE",
    apolloRole:
      "Only documented Apollo signals that are available to the configured plan and API key",
    vbridgeRole:
      "Signal interpretation, relevance scoring and workflow presentation",
    status: "CAPABILITY_VALIDATION_REQUIRED",
  },
} as const;

export type ApolloCapabilityKey =
  keyof typeof apolloCapabilityMap;
