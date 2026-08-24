import { NextRequest, NextResponse } from "next/server";

import { apolloRequest, getApolloClientState } from "@/lib/apollo/client";
import type { ApolloRequestOptions } from "@/lib/apollo/contracts";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

type JsonRecord = Record<string, unknown>;

type ApolloProxyRoute = {
  browserPath: string;
  upstreamPath: string;
  upstreamMethod: "GET" | "POST";
  planStatus: "FREE_VERIFIED" | "ZERO_CREDIT_ACCESS_UNVERIFIED";
};

const verifiedRoutes: Record<string, ApolloProxyRoute> = {
  "contacts/search": {
    browserPath: "/api/apollo/free/contacts/search",
    upstreamPath: "/api/v1/contacts/search",
    upstreamMethod: "POST",
    planStatus: "FREE_VERIFIED",
  },
  "accounts/search": {
    browserPath: "/api/apollo/free/accounts/search",
    upstreamPath: "/api/v1/accounts/search",
    upstreamMethod: "POST",
    planStatus: "FREE_VERIFIED",
  },
  "users/search": {
    browserPath: "/api/apollo/free/users/search",
    upstreamPath: "/api/v1/users/search",
    upstreamMethod: "GET",
    planStatus: "FREE_VERIFIED",
  },
  "usage/api": {
    browserPath: "/api/apollo/free/usage/api",
    upstreamPath: "/api/v1/usage_stats/api_usage_stats",
    upstreamMethod: "POST",
    planStatus: "FREE_VERIFIED",
  },
  "usage/credits": {
    browserPath: "/api/apollo/free/usage/credits",
    upstreamPath: "/api/v1/usage_stats/credit_usage_stats",
    upstreamMethod: "POST",
    planStatus: "FREE_VERIFIED",
  },
  "deals/create": {
    browserPath: "/api/apollo/free/deals/create",
    upstreamPath: "/api/v1/opportunities",
    upstreamMethod: "POST",
    planStatus: "ZERO_CREDIT_ACCESS_UNVERIFIED",
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

function validDate(value: unknown): string | undefined {
  const normalized = text(value, 10);
  if (!normalized) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : undefined;
}

function validApolloId(value: unknown): string | undefined {
  const normalized = text(value, 80);
  if (!normalized) return undefined;
  return /^[A-Za-z0-9_-]+$/.test(normalized) ? normalized : undefined;
}

function uniqueDealName(baseName: string): string {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  const suffix = `${stamp}-${random}`;
  const maxBaseLength = Math.max(1, 180 - suffix.length - 3);
  return `${baseName.slice(0, maxBaseLength)} - ${suffix}`;
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

function responseHeaders(route: ApolloProxyRoute, upstreamStatus?: number): HeadersInit {
  return {
    "X-VBridge-Apollo-Upstream": route.upstreamPath,
    "X-VBridge-Apollo-Upstream-Method": route.upstreamMethod,
    "X-VBridge-Apollo-Upstream-Status": upstreamStatus ? String(upstreamStatus) : "NOT_CALLED",
    "X-VBridge-Apollo-Plan": route.planStatus,
    "X-VBridge-Apollo-Server-Side": "true",
    "X-VBridge-Secret-Exposed": "false",
  };
}

function dealViewRoute(dealId: string): ApolloProxyRoute {
  return {
    browserPath: `/api/apollo/free/deals/view/${dealId}`,
    upstreamPath: `/api/v1/opportunities/${dealId}`,
    upstreamMethod: "GET",
    planStatus: "ZERO_CREDIT_ACCESS_UNVERIFIED",
  };
}

async function execute(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const routeKey = path.join("/");

  let route = verifiedRoutes[routeKey];
  let dealId: string | undefined;

  if (!route && path.length === 3 && path[0] === "deals" && path[1] === "view") {
    dealId = validApolloId(path[2]);
    if (dealId) route = dealViewRoute(dealId);
  }

  if (!route) {
    return NextResponse.json(
      {
        ok: false,
        code: "APOLLO_FREE_ROUTE_NOT_FOUND",
        message: "This Apollo operation is not available through the V-Bridge lab route list.",
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
  let createdDealName: string | undefined;

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

    case "deals/create": {
      const baseName = text(body.name, 150);
      if (!baseName) {
        return NextResponse.json(
          {
            ok: false,
            code: "DEAL_NAME_REQUIRED",
            message: "Deal name is required.",
          },
          { status: 400, headers: responseHeaders(route) },
        );
      }

      const closedDateRaw = text(body.closedDate ?? body.closed_date, 20);
      const closedDate = validDate(closedDateRaw);
      if (closedDateRaw && !closedDate) {
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_CLOSED_DATE",
            message: "Closed date must use YYYY-MM-DD format.",
          },
          { status: 400, headers: responseHeaders(route) },
        );
      }

      const accountIdRaw = text(body.accountId ?? body.account_id, 100);
      const accountId = validApolloId(accountIdRaw);
      if (accountIdRaw && !accountId) {
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_ACCOUNT_ID",
            message: "Account ID contains unsupported characters.",
          },
          { status: 400, headers: responseHeaders(route) },
        );
      }

      const amountRaw = body.amount;
      const amount = amountRaw === undefined || amountRaw === null || amountRaw === ""
        ? undefined
        : String(amountRaw).trim();

      if (amount && !/^\d+(?:\.\d{1,2})?$/.test(amount)) {
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_DEAL_AMOUNT",
            message: "Amount must be a plain number without commas or currency symbols.",
          },
          { status: 400, headers: responseHeaders(route) },
        );
      }

      createdDealName = uniqueDealName(baseName);
      options = {
        method: "POST",
        body: {
          name: createdDealName,
          ...(amount !== undefined ? { amount } : {}),
          ...(closedDate ? { closed_date: closedDate } : {}),
          ...(accountId ? { account_id: accountId } : {}),
        },
      };
      break;
    }

    default:
      if (dealId) {
        options = { method: "GET" };
        break;
      }
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
        planAccessVerified: route.planStatus === "FREE_VERIFIED",
        zeroCreditEndpoint: true,
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
      planAccessVerified: true,
      zeroCreditEndpoint: true,
      creditMode: "ZERO_CREDIT_ENDPOINT",
      ...(createdDealName ? { createdDealName } : {}),
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
