import {
  NextRequest,
  NextResponse,
} from "next/server";

import personasJson from "@/data/personas/personas.json";
import type {
  VBridgePersona,
} from "@/types/persona";
import {
  executeControlledLiveSearch,
} from "@/lib/lead-generation/live-search";

export const dynamic = "force-dynamic";

const personas =
  personasJson as VBridgePersona[];

const CONTROLLED_PERSONA_ID =
  "MSME-001";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Method not allowed. Live search requires explicit POST.",
      executionMode:
        "LIVE_CONTROLLED",
      apolloCalled: false,
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body.",
        executionMode:
          "LIVE_CONTROLLED",
        apolloCalled: false,
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        error:
          "Request body must be an object.",
        executionMode:
          "LIVE_CONTROLLED",
        apolloCalled: false,
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const personaId =
    "personaId" in body &&
    typeof body.personaId === "string"
      ? body.personaId.trim()
      : "";

  if (
    personaId !== CONTROLLED_PERSONA_ID
  ) {
    return NextResponse.json(
      {
        error:
          "Controlled live search is restricted to MSME-001.",
        allowedPersonaId:
          CONTROLLED_PERSONA_ID,
        executionMode:
          "LIVE_CONTROLLED",
        apolloCalled: false,
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const persona =
    personas.find(
      (item) =>
        item.id === personaId,
    );

  if (!persona) {
    return NextResponse.json(
      {
        error: "Persona not found.",
        personaId,
        executionMode:
          "LIVE_CONTROLLED",
        apolloCalled: false,
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const result =
      await executeControlledLiveSearch(
        persona,
      );

    return NextResponse.json(
      result,
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    if (error instanceof ApolloError) {
      return NextResponse.json(
        {
          error:
            "Apollo live search failed.",
          upstreamStatus:
            classifyStatus(error.status),
          upstreamHttpStatus:
            error.status,
          retryable:
            error.retryable,
          executionMode:
            "LIVE_CONTROLLED",
          apolloCalled: true,
          secretExposed: false,
          rawUpstreamReturned: false,
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Live search failed.",
        executionMode:
          "LIVE_CONTROLLED",
        apolloCalled: false,
        secretExposed: false,
        rawUpstreamReturned: false,
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
