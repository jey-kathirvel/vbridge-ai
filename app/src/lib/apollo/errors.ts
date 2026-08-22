import type {
  ApolloFailure,
  ApolloIntegrationErrorCode,
} from "./contracts";

function classifyStatus(
  status: number,
): {
  code: ApolloIntegrationErrorCode;
  retryable: boolean;
  message: string;
} {
  if (status === 401) {
    return {
      code: "APOLLO_AUTHENTICATION_ERROR",
      retryable: false,
      message:
        "Apollo rejected the configured credentials.",
    };
  }

  if (status === 403) {
    return {
      code: "APOLLO_AUTHORIZATION_ERROR",
      retryable: false,
      message:
        "Apollo denied access to the requested capability.",
    };
  }

  if (status === 429) {
    return {
      code: "APOLLO_RATE_LIMITED",
      retryable: true,
      message:
        "Apollo rate limit was reached.",
    };
  }

  if (status >= 500) {
    return {
      code: "APOLLO_UPSTREAM_ERROR",
      retryable: true,
      message:
        "Apollo returned an upstream service error.",
    };
  }

  return {
    code: "APOLLO_UPSTREAM_ERROR",
    retryable: false,
    message:
      "Apollo rejected the upstream request.",
  };
}

export function failureFromStatus(
  status: number,
  requestId?: string,
): ApolloFailure {
  const classification = classifyStatus(status);

  return {
    ok: false,
    status,
    error: {
      ...classification,
      upstreamStatus: status,
      requestId,
    },
  };
}

export function timeoutFailure(): ApolloFailure {
  return {
    ok: false,
    status: 504,
    error: {
      code: "APOLLO_TIMEOUT",
      message:
        "Apollo request exceeded the configured timeout.",
      retryable: true,
    },
  };
}

export function networkFailure(): ApolloFailure {
  return {
    ok: false,
    status: 502,
    error: {
      code: "APOLLO_NETWORK_ERROR",
      message:
        "Apollo could not be reached.",
      retryable: true,
    },
  };
}

export function invalidResponseFailure(
  upstreamStatus = 502,
  requestId?: string,
): ApolloFailure {
  return {
    ok: false,
    status: 502,
    error: {
      code: "APOLLO_INVALID_RESPONSE",
      message:
        "Apollo returned a response that could not be processed.",
      retryable: false,
      upstreamStatus,
      requestId,
    },
  };
}
