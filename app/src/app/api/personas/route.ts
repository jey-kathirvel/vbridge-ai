import { NextRequest, NextResponse } from "next/server";

import personasJson from "@/data/personas/personas.json";
import type {
  StakeholderType,
  VBridgePersona,
} from "@/types/persona";

const personas = personasJson as VBridgePersona[];

const stakeholderTypes: StakeholderType[] = [
  "BUSINESS_USER",
  "MSME",
  "STARTUP",
  "INVESTOR",
  "PARTNER",
  "MENTOR",
  "SERVICE_PROVIDER",
];

function isStakeholderType(
  value: string,
): value is StakeholderType {
  return stakeholderTypes.includes(value as StakeholderType);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const id = searchParams.get("id");
  const stakeholderType = searchParams.get("stakeholderType");

  if (id && stakeholderType) {
    return NextResponse.json(
      {
        error: "Use either id or stakeholderType, not both.",
      },
      { status: 400 },
    );
  }

  if (id) {
    const persona = personas.find((item) => item.id === id);

    if (!persona) {
      return NextResponse.json(
        {
          error: "Persona not found.",
          id,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      count: 1,
      data: persona,
    });
  }

  if (stakeholderType) {
    if (!isStakeholderType(stakeholderType)) {
      return NextResponse.json(
        {
          error: "Invalid stakeholderType.",
          allowedValues: stakeholderTypes,
        },
        { status: 400 },
      );
    }

    const filtered = personas.filter(
      (item) => item.stakeholderType === stakeholderType,
    );

    return NextResponse.json({
      count: filtered.length,
      data: filtered,
    });
  }

  return NextResponse.json({
    count: personas.length,
    data: personas,
  });
}
