import "server-only";

import { apolloRequest } from "@/lib/apollo/client";
import type { VBridgePersona } from "@/types/persona";

import {
  planLeadSearch,
} from "./persona-planner";

import {
  APOLLO_PEOPLE_SEARCH_ENDPOINT,
  mapPlanToApolloDryRun,
} from "./apollo-mapper";

const CONTROLLED_PERSONA_ID = "MSME-001";
const CONTROLLED_PER_PAGE = 3;

interface ApolloOrganizationShape {
  id?: unknown;
  name?: unknown;
}

interface ApolloPersonShape {
  id?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  name?: unknown;
  title?: unknown;
  city?: unknown;
  state?: unknown;
  country?: unknown;
  organization_name?: unknown;
  organization?: ApolloOrganizationShape | null;
}

interface ApolloPeopleSearchShape {
  people?: unknown;
  pagination?: unknown;
}

export interface SafeLeadResult {
  apolloPersonId: string | null;
  name: string | null;
  title: string | null;
  organizationName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface ControlledLiveSearchResult {
  service: "apollo";
  capability: "AI_LEAD_GENERATION";
  executionMode: "LIVE_CONTROLLED";
  personaId: string;
  organizationName: string;
  endpoint: string;
  requestedPerPage: number;
  resultCount: number;
  upstreamVerified: true;
  apolloCalled: true;
  secretExposed: false;
  rawUpstreamReturned: false;
  leads: SafeLeadResult[];
}

function safeString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function buildName(
  person: ApolloPersonShape,
): string | null {
  const directName =
    safeString(person.name);

  if (directName) {
    return directName;
  }

  const parts = [
    safeString(person.first_name),
    safeString(person.last_name),
  ].filter(
    (value): value is string =>
      value !== null,
  );

  return parts.length > 0
    ? parts.join(" ")
    : null;
}

function buildOrganizationName(
  person: ApolloPersonShape,
): string | null {
  return (
    safeString(
      person.organization?.name,
    ) ??
    safeString(
      person.organization_name,
    )
  );
}

function normalizePerson(
  value: unknown,
): SafeLeadResult | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  const person =
    value as ApolloPersonShape;

  return {
    apolloPersonId:
      safeString(person.id),
    name:
      buildName(person),
    title:
      safeString(person.title),
    organizationName:
      buildOrganizationName(person),
    city:
      safeString(person.city),
    state:
      safeString(person.state),
    country:
      safeString(person.country),
  };
}

function extractPeople(
  payload: ApolloPeopleSearchShape,
): unknown[] {
  return Array.isArray(payload.people)
    ? payload.people
    : [];
}

export async function executeControlledLiveSearch(
  persona: VBridgePersona,
): Promise<ControlledLiveSearchResult> {
  if (
    persona.id !== CONTROLLED_PERSONA_ID
  ) {
    throw new Error(
      `Controlled live search is restricted to ${CONTROLLED_PERSONA_ID}.`,
    );
  }

  const plan =
    planLeadSearch(persona);

  const dryRun =
    mapPlanToApolloDryRun(plan);

  const requestBody = {
    ...dryRun.requestBody,
    page: 1,
    per_page: CONTROLLED_PER_PAGE,
  };

  const upstream =
    await apolloRequest<ApolloPeopleSearchShape>(
      APOLLO_PEOPLE_SEARCH_ENDPOINT,
      {
        method: "POST",
        body: requestBody,
      },
    );

  const leads =
    extractPeople(upstream)
      .map(normalizePerson)
      .filter(
        (
          lead,
        ): lead is SafeLeadResult =>
          lead !== null,
      )
      .slice(
        0,
        CONTROLLED_PER_PAGE,
      );

  return {
    service: "apollo",
    capability:
      "AI_LEAD_GENERATION",
    executionMode:
      "LIVE_CONTROLLED",
    personaId:
      persona.id,
    organizationName:
      persona.profile.organizationName,
    endpoint:
      APOLLO_PEOPLE_SEARCH_ENDPOINT,
    requestedPerPage:
      CONTROLLED_PER_PAGE,
    resultCount:
      leads.length,
    upstreamVerified: true,
    apolloCalled: true,
    secretExposed: false,
    rawUpstreamReturned: false,
    leads,
  };
}
