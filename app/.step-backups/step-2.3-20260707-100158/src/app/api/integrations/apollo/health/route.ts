import { NextResponse } from "next/server";

import { getApolloClientState } from "@/lib/apollo/client";
import type { ApolloHealthResponse } from "@/lib/apollo/contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = getApolloClientState();

    const response: ApolloHealthResponse = {
      service: "apollo",
      configured: state.configured,
      enabled: state.enabled,
      ready: state.ready,
      baseUrlConfigured:
        state.baseUrlConfigured,
      timeoutMs: state.timeoutMs,
      mode: state.ready
        ? "live"
        : "foundation",
      secretExposed: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        service: "apollo",
        configured: false,
        enabled: false,
        ready: false,
        baseUrlConfigured: false,
        timeoutMs: 0,
        mode: "foundation",
        secretExposed: false,
        error:
          "Apollo configuration is invalid.",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
