import { NextRequest, NextResponse } from "next/server";

import personasJson from "@/data/personas/personas.json";
import type { VBridgePersona } from "@/types/persona";
import { planLeadSearches } from "@/lib/lead-generation/persona-planner";
import type { LeadSearchPlanResponse } from "@/lib/lead-generation/contracts";

export const dynamic = "force-dynamic";

const personas =
  personasJson as VBridgePersona[];

export async function GET(
  request: NextRequest,
) {
  const personaId =
    request.nextUrl.searchParams
      .get("personaId")
      ?.trim();

  const selectedPersonas = personaId
    ? personas.filter(
        (persona) =>
          persona.id === personaId,
      )
    : personas;

  if (
    personaId &&
    selectedPersonas.length === 0
  ) {
    return NextResponse.json(
      {
        error: "Persona not found.",
        personaId,
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

  const plans =
    planLeadSearches(selectedPersonas);

  const response: LeadSearchPlanResponse = {
    count: plans.length,
    executionMode: "PLANNER_ONLY",
    apolloCalled: false,
    plans,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Method not allowed. STEP 3.1 is planner-only.",
      executionMode: "PLANNER_ONLY",
      apolloCalled: false,
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
        "Cache-Control": "no-store",
      },
    },
  );
}
