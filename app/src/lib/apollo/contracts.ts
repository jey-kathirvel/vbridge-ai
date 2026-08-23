export type ApolloHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type ApolloQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export type ApolloIntegrationErrorCode =
  | "APOLLO_DISABLED"
  | "APOLLO_NOT_CONFIGURED"
  | "APOLLO_INVALID_CONFIGURATION"
  | "APOLLO_TIMEOUT"
  | "APOLLO_NETWORK_ERROR"
  | "APOLLO_AUTHENTICATION_ERROR"
  | "APOLLO_AUTHORIZATION_ERROR"
  | "APOLLO_RATE_LIMITED"
  | "APOLLO_UPSTREAM_ERROR"
  | "APOLLO_INVALID_RESPONSE"
  | "APOLLO_UNKNOWN_ERROR";

export interface ApolloRequestOptions {
  method?: ApolloHttpMethod;
  query?: Record<string, ApolloQueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApolloSuccess<T> {
  ok: true;
  status: number;
  data: T;
  requestId?: string;
}

export interface ApolloFailure {
  ok: false;
  status: number;
  error: {
    code: ApolloIntegrationErrorCode;
    message: string;
    retryable: boolean;
    upstreamStatus?: number;
    requestId?: string;
  };
}

export type ApolloResult<T> =
  | ApolloSuccess<T>
  | ApolloFailure;

export interface ApolloHealthResponse {
  service: "apollo";
  configured: boolean;
  enabled: boolean;
  ready: boolean;
  baseUrlConfigured: boolean;
  timeoutMs: number;
  mode: "foundation" | "live";
  secretExposed: false;
  timestamp: string;
}

export type ApolloUpstreamStatus =
  | "VERIFIED"
  | "AUTHENTICATION_REJECTED"
  | "PERMISSION_DENIED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE"
  | "NOT_READY";

export interface ApolloProbeResponse {
  service: "apollo";
  probe: "contacts-search-minimal";
  endpoint: "/api/v1/contacts/search";
  configured: boolean;
  enabled: boolean;
  ready: boolean;
  upstreamVerified: boolean;
  upstreamStatus: ApolloUpstreamStatus;
  httpStatus: number;
  retryable: boolean;
  requestId?: string;
  secretExposed: false;
  timestamp: string;
}
