import "server-only";

import { apolloRequest } from "./client";
import { getApolloConfig } from "./config";
import type {
  ApolloProbeResponse,
  ApolloUpstreamStatus,
} from "./contracts";

interface ApolloContactsSearchResponse {
  contacts?: unknown[];
  pagination?: unknown;
}

function mapUpstreamStatus(
  code: string,
): ApolloUpstreamStatus {
  switch (code) {
    case "APOLLO_AUTHENTICATION_ERROR":
      return "AUTHENTICATION_REJECTED";

    case "APOLLO_AUTHORIZATION_ERROR":
      return "PERMISSION_DENIED";

    case "APOLLO_RATE_LIMITED":
      return "RATE_LIMITED";

    case "APOLLO_TIMEOUT":
      return "TIMEOUT";

    case "APOLLO_NETWORK_ERROR":
      return "NETWORK_ERROR";

    case "APOLLO_INVALID_RESPONSE":
      return "INVALID_RESPONSE";

    default:
      return "UPSTREAM_ERROR";
  }
}

export async function runApolloConnectivityProbe(): Promise<
  ApolloProbeResponse
> {
  const config = getApolloConfig();

  const timestamp = new Date().toISOString();

  if (!config.configured || !config.enabled) {
    return {
      service: "apollo",
      probe: "contacts-search-minimal",
      endpoint: "/api/v1/contacts/search",
      configured: config.configured,
      enabled: config.enabled,
      ready: false,
      upstreamVerified: false,
      upstreamStatus: "NOT_READY",
      httpStatus: 503,
      retryable: false,
      secretExposed: false,
      timestamp,
    };
  }

  const result =
    await apolloRequest<ApolloContactsSearchResponse>(
      "/api/v1/contacts/search",
      {
        method: "POST",
        body: {
          page: 1,
          per_page: 1,
        },
      },
    );

  if (result.ok) {
    return {
      service: "apollo",
      probe: "contacts-search-minimal",
      endpoint: "/api/v1/contacts/search",
      configured: true,
      enabled: true,
      ready: true,
      upstreamVerified: true,
      upstreamStatus: "VERIFIED",
      httpStatus: result.status,
      retryable: false,
      requestId: result.requestId,
      secretExposed: false,
      timestamp,
    };
  }

  return {
    service: "apollo",
    probe: "contacts-search-minimal",
    endpoint: "/api/v1/contacts/search",
    configured: true,
    enabled: true,
    ready: true,
    upstreamVerified: false,
    upstreamStatus: mapUpstreamStatus(
      result.error.code,
    ),
    httpStatus: result.status,
    retryable: result.error.retryable,
    requestId: result.error.requestId,
    secretExposed: false,
    timestamp,
  };
}
