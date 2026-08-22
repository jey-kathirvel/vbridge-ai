import { NextResponse } from "next/server";

import { getApolloClientState } from "@/lib/apollo/client";
import { runApolloConnectivityProbe } from "@/lib/apollo/probe";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = getApolloClientState();

    if (!state.ready) {
      return NextResponse.json(
        {
          service: "apollo",
          configured: state.configured,
          enabled: state.enabled,
          ready: state.ready,
          baseUrlConfigured:
            state.baseUrlConfigured,
          timeoutMs: state.timeoutMs,
          mode: "foundation",
          upstreamVerified: false,
          upstreamStatus: "NOT_READY",
          secretExposed: false,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const probe =
      await runApolloConnectivityProbe();

    return NextResponse.json(
      {
        service: "apollo",
        configured: state.configured,
        enabled: state.enabled,
        ready: state.ready,
        baseUrlConfigured:
          state.baseUrlConfigured,
        timeoutMs: state.timeoutMs,
        mode: "live",
        upstreamVerified:
          probe.upstreamVerified,
        upstreamStatus:
          probe.upstreamStatus,
        upstreamHttpStatus:
          probe.httpStatus,
        retryable:
          probe.retryable,
        requestId:
          probe.requestId,
        secretExposed: false,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
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
        upstreamVerified: false,
        upstreamStatus: "UPSTREAM_ERROR",
        secretExposed: false,
        error:
          "Apollo health verification failed.",
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
