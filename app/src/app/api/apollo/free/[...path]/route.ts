import { NextRequest, NextResponse } from "next/server";

import { apolloRequest, getApolloClientState } from "@/lib/apollo/client";
import type { ApolloRequestOptions } from "@/lib/apollo/contracts";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

type JsonRecord = Record<string, unknown>;

type VerifiedRoute = {
  browserPath: string;
  upstreamPath: string;
  upstreamMethod: "GET" | "POST";
};

const verifiedRoutes: Record<string, VerifiedRoute> = {
  "contacts/search": {
    browserPath: "/api/apollo/free/contacts/search",
    upstreamPath: "/api/v1/contacts/search",
    upstreamMethod: "POST",
  },
  "accounts/search": {
    browserPath: "/api/apollo/free/accounts/search",
    upstreamPath: "/api/v1/accounts/search",
    upstreamMethod: "POST",
  },
  "users/search": {
    browserPath: "/api/apollo/free/users/search",
    upstreamPath: "/api/v1/users/search",
    upstreamMethod: "GET",
  },
  "usage/api": {
    browserPath: "/api/apollo/free/usage/api",
    upstreamPath: "/api/v1/usage_stats/api_usage_stats",
    upstreamMethod: "POST",
  },
  "usage/credits": {
    browserPath: "/api/apollo/free/usage/credits",
    upstreamPath: "/api/v1/usage_stats/credit_usage_stats",
    upstreamMethod: "POST",
  },
};

function positiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function text(value: unknown, maxLength = 200): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

async function readBody(request: NextRequest): Promise<JsonRecord> {
  if (request.method === "GET") return {};
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as JsonRecord)
      : {};
  } catch {
    return {};
  }
}

function responseHeaders(route: VerifiedRoute, upstreamStatus?: number): HeadersInit {
  return {
    "X-VBridge-Apollo-Upstream": route.upstreamPath,
    "X-VBridge-Apollo-Upstream-Method": route.upstreamMethod,
    "X-VBridge-Apollo-Upstream-Status": upstreamStatus ? String(upstreamStatus) : "NOT_CALLED",
    "X-VBridge-Apollo-Plan": "FREE_VERIFIED",
    "X-VBridge-Apollo-Server-Side": "true",
    "X-VBridge-Secret-Exposed": "false",
  };
}

async function execute(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const routeKey = path.join("/");
  const route = verifiedRoutes[routeKey];

  if (!route) {
    return NextResponse.json(
      {
        ok: false,
        code: "APOLLO_FREE_ROUTE_NOT_FOUND",
        message: "This Apollo operation is not in the verified Free-plan route list.",
      },
      { status: 404 },
    );
  }

  const state = getApolloClientState();
  if (!state.ready) {
    return NextResponse.json(
      {
        ok: false,
        code: state.configured ? "APOLLO_DISABLED" : "APOLLO_NOT_CONFIGURED",
        message: state.configured
          ? "Apollo integration is configured but disabled."
          : "Apollo API key is not configured on the server.",
        secretExposed: false,
      },
      { status: 503, headers: responseHeaders(route) },
    );
  }

  const body = await readBody(request);
  const page = positiveInt(
    request.nextUrl.searchParams.get("page") ?? body.page,
    1,
    500,
  );
  const perPage = positiveInt(
    request.nextUrl.searchParams.get("per_page") ?? body.perPage ?? body.per_page,
    10,
    100,
  );

  let options: ApolloRequestOptions;

  switch (routeKey) {
    case "contacts/search":
      options = {
        method: "POST",
        body: {
          q_keywords: text(body.keywords ?? body.q_keywords),
          page,
          per_page: perPage,
        },
      };
      break;

    case "accounts/search":
      options = {
        method: "POST",
        body: {
          q_organization_name: text(body.organizationName ?? body.q_organization_name),
          page,
          per_page: perPage,
        },
      };
      break;

    case "users/search":
      options = {
        method: "GET",
        query: { page, per_page: perPage },
      };
      break;

    case "usage/api":
    case "usage/credits":
      options = { method: "POST" };
      break;

    default:
      return NextResponse.json({ ok: false }, { status: 404 });
  }

  const result = await apolloRequest<unknown>(route.upstreamPath, options);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        browserEndpoint: route.browserPath,
        apolloEndpoint: route.upstreamPath,
        apolloMethod: route.upstreamMethod,
        serverSide: true,
        error: result.error,
        secretExposed: false,
      },
      { status: result.status, headers: responseHeaders(route, result.status) },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      browserEndpoint: route.browserPath,
      apolloEndpoint: route.upstreamPath,
      apolloMethod: route.upstreamMethod,
      apolloHttpStatus: result.status,
      serverSide: true,
      plan: "FREE",
      verifiedFreePlan: true,
      creditMode: "ZERO_CREDIT_ENDPOINT",
      requestId: result.requestId,
      data: result.data,
      secretExposed: false,
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: responseHeaders(route, result.status) },
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  return execute(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return execute(request, context);
}
