import "server-only";

import {
  getApolloConfig,
  requireApolloConfig,
} from "./config";
import type {
  ApolloRequestOptions,
  ApolloResult,
} from "./contracts";
import {
  failureFromStatus,
  invalidResponseFailure,
  networkFailure,
  timeoutFailure,
} from "./errors";

function buildUrl(
  baseUrl: string,
  path: string,
  query?: ApolloRequestOptions["query"],
): URL {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = new URL(
    `${baseUrl}${normalizedPath}`,
  );

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (
        value !== undefined &&
        value !== null
      ) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

function getRequestId(
  response: Response,
): string | undefined {
  return (
    response.headers.get("x-request-id") ??
    response.headers.get("request-id") ??
    undefined
  );
}

export async function apolloRequest<T>(
  path: string,
  options: ApolloRequestOptions = {},
): Promise<ApolloResult<T>> {
  const config = requireApolloConfig();

  const timeoutMs =
    options.timeoutMs ?? config.timeoutMs;

  const timeoutController =
    new AbortController();

  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    timeoutMs,
  );

  const abortFromCaller = () =>
    timeoutController.abort();

  options.signal?.addEventListener(
    "abort",
    abortFromCaller,
    { once: true },
  );

  try {
    const url = buildUrl(
      config.baseUrl,
      path,
      options.query,
    );

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": config.apiKey,
        ...options.headers,
      },
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      signal: timeoutController.signal,
      cache: "no-store",
    });

    const requestId = getRequestId(response);

    if (!response.ok) {
      return failureFromStatus(
        response.status,
        requestId,
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      return invalidResponseFailure(
        response.status,
        requestId,
      );
    }

    try {
      const data = (await response.json()) as T;

      return {
        ok: true,
        status: response.status,
        data,
        requestId,
      };
    } catch {
      return invalidResponseFailure(
        response.status,
        requestId,
      );
    }
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return timeoutFailure();
    }

    return networkFailure();
  } finally {
    clearTimeout(timeoutId);

    options.signal?.removeEventListener(
      "abort",
      abortFromCaller,
    );
  }
}

export function getApolloClientState() {
  const config = getApolloConfig();

  return {
    configured: config.configured,
    enabled: config.enabled,
    ready:
      config.configured &&
      config.enabled,
    baseUrlConfigured: Boolean(config.baseUrl),
    timeoutMs: config.timeoutMs,
  };
}
