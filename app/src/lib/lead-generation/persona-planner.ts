import "server-only";

import type {
  StakeholderType,
  VBridgePersona,
} from "@/types/persona";

import type {
  LeadPlanConfidence,
  LeadSearchPlan,
  LeadSearchTarget,
} from "./contracts";

interface StakeholderStrategy {
  jobTitles: string[];
  seniorities: string[];
  companyKeywords: string[];
  exclusions: string[];
  resultLimit: number;
}

const strategies: Record<
  StakeholderType,
  StakeholderStrategy
> = {
  BUSINESS_USER: {
    jobTitles: [
      "Founder",
      "Chief Executive Officer",
      "Managing Director",
      "Head of Partnerships",
      "Business Development Director",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
    ],
    companyKeywords: [
      "business services",
      "strategic partnerships",
      "distribution",
      "international trade",
    ],
    exclusions: [
      "student",
      "intern",
      "freelancer",
    ],
    resultLimit: 20,
  },

  MSME: {
    jobTitles: [
      "Founder",
      "Managing Director",
      "Procurement Director",
      "Head of Distribution",
      "International Sales Director",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
    ],
    companyKeywords: [
      "distribution",
      "wholesale",
      "import export",
      "supply chain",
      "retail",
    ],
    exclusions: [
      "student",
      "intern",
      "individual contributor",
    ],
    resultLimit: 25,
  },

  STARTUP: {
    jobTitles: [
      "Founder",
      "Co-Founder",
      "Chief Executive Officer",
      "Chief Innovation Officer",
      "Head of Partnerships",
      "Venture Partner",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
      "partner",
    ],
    companyKeywords: [
      "venture capital",
      "innovation",
      "technology",
      "strategic partnerships",
      "startup ecosystem",
    ],
    exclusions: [
      "student",
      "intern",
    ],
    resultLimit: 25,
  },

  INVESTOR: {
    jobTitles: [
      "Founder",
      "Chief Executive Officer",
      "Chief Financial Officer",
      "Investment Director",
      "Head of Strategy",
      "Managing Director",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
    ],
    companyKeywords: [
      "growth company",
      "technology company",
      "scalable business",
      "emerging markets",
      "innovation",
    ],
    exclusions: [
      "student",
      "intern",
      "consultant",
    ],
    resultLimit: 30,
  },

  PARTNER: {
    jobTitles: [
      "Founder",
      "Chief Executive Officer",
      "Managing Director",
      "Head of Partnerships",
      "Alliance Director",
      "Business Development Director",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
      "partner",
    ],
    companyKeywords: [
      "strategic partnerships",
      "alliances",
      "distribution",
      "market expansion",
      "business services",
    ],
    exclusions: [
      "student",
      "intern",
    ],
    resultLimit: 25,
  },

  MENTOR: {
    jobTitles: [
      "Founder",
      "Co-Founder",
      "Chief Executive Officer",
      "Managing Director",
      "Advisor",
      "Venture Partner",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "partner",
      "director",
    ],
    companyKeywords: [
      "startup ecosystem",
      "entrepreneurship",
      "venture capital",
      "innovation",
      "business advisory",
    ],
    exclusions: [
      "student",
      "intern",
      "entry level",
    ],
    resultLimit: 20,
  },

  SERVICE_PROVIDER: {
    jobTitles: [
      "Founder",
      "Chief Executive Officer",
      "Chief Operating Officer",
      "Head of Procurement",
      "Head of Partnerships",
      "Business Development Director",
    ],
    seniorities: [
      "owner",
      "founder",
      "c_suite",
      "vp",
      "director",
    ],
    companyKeywords: [
      "professional services",
      "business services",
      "technology services",
      "consulting",
      "outsourcing",
    ],
    exclusions: [
      "student",
      "intern",
    ],
    resultLimit: 25,
  },
};

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

function buildLocations(
  persona: VBridgePersona,
): string[] {
  const location = persona.profile.location;

  return unique([
    location.city,
    location.stateOrRegion,
    location.country,
  ]);
}

function buildIndustries(
  persona: VBridgePersona,
): string[] {
  return unique([
    persona.profile.industry,
    persona.profile.subIndustry,
  ]);
}

function buildCompanyKeywords(
  persona: VBridgePersona,
  strategy: StakeholderStrategy,
): string[] {
  return unique([
    persona.profile.industry,
    persona.profile.subIndustry,
    ...strategy.companyKeywords,
  ]);
}

function determineConfidence(
  target: LeadSearchTarget,
): LeadPlanConfidence {
  const signalCount =
    target.industries.length +
    target.locations.length +
    target.jobTitles.length +
    target.companyKeywords.length;

  if (signalCount >= 12) {
    return "HIGH";
  }

  if (signalCount >= 7) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildSummary(
  persona: VBridgePersona,
): string {
  switch (persona.stakeholderType) {
    case "BUSINESS_USER":
      return "Target senior business decision-makers and partnership leaders aligned with the persona industry and market.";

    case "MSME":
      return "Target distributors, buyers, procurement leaders and expansion partners relevant to MSME growth.";

    case "STARTUP":
      return "Target founders, innovation leaders, strategic partners and investor-side decision-makers relevant to startup growth.";

    case "INVESTOR":
      return "Target senior leaders at potentially scalable and investment-relevant organizations.";

    case "PARTNER":
      return "Target alliance, partnership and market-expansion decision-makers.";

    case "MENTOR":
      return "Target experienced founders, executives, advisors and ecosystem leaders.";

    case "SERVICE_PROVIDER":
      return "Target senior buyers and partnership leaders with potential demand for business or technology services.";
  }
}

function buildSignals(
  persona: VBridgePersona,
  target: LeadSearchTarget,
): string[] {
  return [
    `Stakeholder type: ${persona.stakeholderType}`,
    `Industry signal: ${persona.profile.industry}`,
    `Sub-industry signal: ${persona.profile.subIndustry}`,
    `Geography signal: ${target.locations.join(", ")}`,
    `Target seniority count: ${target.seniorities.length}`,
    `Target title count: ${target.jobTitles.length}`,
  ];
}

function buildPlanId(
  persona: VBridgePersona,
): string {
  return `LEAD-PLAN-${persona.id}`;
}

export function planLeadSearch(
  persona: VBridgePersona,
): LeadSearchPlan {
  const strategy =
    strategies[persona.stakeholderType];

  const target: LeadSearchTarget = {
    industries: buildIndustries(persona),
    locations: buildLocations(persona),
    jobTitles: unique(strategy.jobTitles),
    seniorities: unique(strategy.seniorities),
    companyKeywords: buildCompanyKeywords(
      persona,
      strategy,
    ),
    exclusions: unique(strategy.exclusions),
  };

  return {
    planId: buildPlanId(persona),
    personaId: persona.id,
    stakeholderType:
      persona.stakeholderType,
    organizationName:
      persona.profile.organizationName,
    status: "PLANNED",
    confidence:
      determineConfidence(target),
    executionMode: "PLANNER_ONLY",
    target,
    resultLimit: strategy.resultLimit,
    rationale: {
      summary: buildSummary(persona),
      signals: buildSignals(
        persona,
        target,
      ),
    },
    generatedAt:
      new Date().toISOString(),
  };
}

export function planLeadSearches(
  personas: VBridgePersona[],
): LeadSearchPlan[] {
  return personas.map(planLeadSearch);
}
