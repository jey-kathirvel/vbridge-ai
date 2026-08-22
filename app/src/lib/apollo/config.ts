const DEFAULT_BASE_URL = "https://api.apollo.io";
const DEFAULT_TIMEOUT_MS = 15_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 60_000;

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

function parseTimeout(
  value: string | undefined,
): number {
  if (!value) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_TIMEOUT_MS ||
    parsed > MAX_TIMEOUT_MS
  ) {
    throw new Error(
      `APOLLO_REQUEST_TIMEOUT_MS must be an integer between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}.`,
    );
  }

  return parsed;
}

function normalizeBaseUrl(
  value: string | undefined,
): string {
  const candidate = (
    value?.trim() || DEFAULT_BASE_URL
  ).replace(/\/+$/, "");

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      "APOLLO_API_BASE_URL must be a valid absolute URL.",
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      "APOLLO_API_BASE_URL must use HTTPS.",
    );
  }

  return parsed.toString().replace(/\/+$/, "");
}

export interface ApolloConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
  enabled: boolean;
  configured: boolean;
}

export function getApolloConfig(): ApolloConfig {
  const apiKey =
    process.env.APOLLO_API_KEY?.trim() || undefined;

  const enabled = parseBoolean(
    process.env.APOLLO_INTEGRATION_ENABLED,
    false,
  );

  return {
    baseUrl: normalizeBaseUrl(
      process.env.APOLLO_API_BASE_URL,
    ),
    apiKey,
    timeoutMs: parseTimeout(
      process.env.APOLLO_REQUEST_TIMEOUT_MS,
    ),
    enabled,
    configured: Boolean(apiKey),
  };
}

export function requireApolloConfig(): ApolloConfig & {
  apiKey: string;
} {
  const config = getApolloConfig();

  if (!config.enabled) {
    throw new Error(
      "Apollo integration is disabled.",
    );
  }

  if (!config.apiKey) {
    throw new Error(
      "Apollo integration is not configured.",
    );
  }

  return {
    ...config,
    apiKey: config.apiKey,
  };
}
