export type StakeholderType =
  | "BUSINESS_USER"
  | "MSME"
  | "STARTUP"
  | "INVESTOR"
  | "PARTNER"
  | "MENTOR"
  | "SERVICE_PROVIDER";

export interface VBridgePersona {
  id: string;
  stakeholderType: StakeholderType;
  profile: {
    displayName: string;
    organizationName: string;
    location: {
      city: string;
      stateOrRegion: string;
      country: string;
    };
    industry: string;
    subIndustry: string;
    website?: string;
  };
  business: {
    stage: string;
    employeeCount: number;
    annualRevenueInr?: number;
    foundedYear?: number;
    productsOrServices: string[];
    currentMarkets: string[];
    targetMarkets: string[];
  };
  goals: {
    primaryGoal: string;
    secondaryGoals: string[];
    targetStakeholders: string[];
  };
  aiResearch: {
    matchmaking: {
      enabled: boolean;
      desiredMatches: string[];
    };
    investmentReadiness: {
      enabled: boolean;
      fundingRequiredInr?: number;
      pitchDeckAvailable?: boolean;
      financialModelStatus?: string;
      dataRoomStatus?: string;
      tractionSummary?: string;
    };
    leadGeneration: {
      enabled: boolean;
      targetCountries: string[];
      targetIndustries: string[];
      targetTitles: string[];
    };
    eventsAndNews: {
      enabled: boolean;
      topics: string[];
      trackedMarkets: string[];
    };
  };
  metadata: {
    synthetic: true;
    source: "V-BRIDGE_AI_LAB";
    version: string;
  };
}
