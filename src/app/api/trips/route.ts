import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/trips  -> list trips for the authenticated user
 * POST /api/trips -> create a new trip
 *
 * This is a stub – connect to your Prisma client and implement CRUD.
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: "GET /api/trips not implemented yet." },
    { status: 501 }
  );
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "POST /api/trips not implemented yet." },
    { status: 501 }
  );
}
