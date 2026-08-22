import { NextResponse } from "next/server";

import { runApolloConnectivityProbe } from "@/lib/apollo/probe";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await runApolloConnectivityProbe();

  return NextResponse.json(result, {
    status: result.httpStatus,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Method not allowed. Use POST to run the Apollo connectivity probe.",
      secretExposed: false,
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
