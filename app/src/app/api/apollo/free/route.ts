import { NextRequest, NextResponse } from "next/server";

import {
  apolloRequest,
  getApolloClientState,
} from "@/lib/apollo/client";
import type { ApolloRequestOptions } from "@/lib/apollo/contracts";

type FreeOperation =
  | "people-search"
  | "contacts-search"
  | "accounts-search"
  | "users"
  | "api-usage"
  | "credit-usage";

interface FreeApolloRequest {
  operation?: FreeOperation;
  payload?: Record<string, unknown>;
}

const allowedOperations = new Set<FreeOperation>([
  "people-search",
  "contacts-search",
  "accounts-search",
  "users",
  "api-usage",
  "credit-usage",
]);

const verifiedFreePlanOperations = new Set<FreeOperation>([
  "contacts-search",
  "accounts-search",
  "users",
  "api-usage",
  "credit-usage",
]);

function text(value: unknown, maxLength = 200): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function positiveInt(
  value: unknown,
  fallback: number,
  max: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function buildRequest(
  operation: Exclude<FreeOperation, "people-search">,
  payload: Record<string, unknown>,
): { path: string; options: ApolloRequestOptions } {
  switch (operation) {
    case "contacts-search":
      return {
        path: "/api/v1/contacts/search",
        options: {
          method: "POST",
          body: {
            q_keywords: text(payload.keywords),
            page: positiveInt(payload.page, 1, 500),
            per_page: positiveInt(payload.perPage, 10, 100),
          },
        },
      };

    case "accounts-search":
      return {
        path: "/api/v1/accounts/search",
        options: {
          method: "POST",
          body: {
            q_organization_name: text(payload.organizationName),
            page: positiveInt(payload.page, 1, 500),
            per_page: positiveInt(payload.perPage, 10, 100),
          },
        },
      };

    case "users":
      return {
        path: "/api/v1/users/search",
        options: {
          method: "GET",
          query: {
            page: positiveInt(payload.page, 1, 500),
            per_page: positiveInt(payload.perPage, 10, 100),
          },
        },
      };

    case "api-usage":
      return {
        path: "/api/v1/usage_stats/api_usage_stats",
        options: { method: "POST", body: {} },
      };

    case "credit-usage":
      return {
        path: "/api/v1/usage_stats/credit_usage_stats",
        options: { method: "POST", body: {} },
      };
  }
}

export async function POST(request: NextRequest) {
  const state = getApolloClientState();

  if (!state.ready) {
    return NextResponse.json(
      {
        ok: false,
        code: state.configured
          ? "APOLLO_DISABLED"
          : "APOLLO_NOT_CONFIGURED",
        message: state.configured
          ? "Apollo integration is configured but disabled."
          : "Apollo API key is not configured on the server.",
        secretExposed: false,
      },
      { status: 503 },
    );
  }

  let input: FreeApolloRequest;
  try {
    input = (await request.json()) as FreeApolloRequest;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!input.operation || !allowedOperations.has(input.operation)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unsupported Apollo free API operation.",
      },
      { status: 400 },
    );
  }

  if (!verifiedFreePlanOperations.has(input.operation)) {
    return NextResponse.json(
      {
        ok: false,
        operation: input.operation,
        code: "APOLLO_PLAN_BLOCKED",
        message:
          "This Apollo endpoint is not included in the currently verified Free plan. V-Bridge blocks the request before contacting Apollo.",
        plan: "FREE",
        verifiedFreePlan: false,
        secretExposed: false,
      },
      { status: 403 },
    );
  }

  const operation = input.operation as Exclude<FreeOperation, "people-search">;
  const payload = input.payload ?? {};
  const upstream = buildRequest(operation, payload);
  const result = await apolloRequest<unknown>(
    upstream.path,
    upstream.options,
  );

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        operation,
        error: result.error,
        plan: "FREE",
        verifiedFreePlan: true,
        secretExposed: false,
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    operation,
    plan: "FREE",
    verifiedFreePlan: true,
    creditMode: "ZERO_CREDIT_ENDPOINT",
    status: result.status,
    requestId: result.requestId,
    data: result.data,
    secretExposed: false,
    timestamp: new Date().toISOString(),
  });
}
