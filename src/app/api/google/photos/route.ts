import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/google/photos
 * Expected body: { albumId: string }
 * This route should:
 *  - Use the authenticated user's Google token (via your auth/session)
 *  - Call Google Photos mediaItems.search scoped to the provided albumId
 *  - Return a list of media items (id, baseUrl, metadata)
 *
 * This is a stub – you still need to implement auth and the Google API call.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented. Wire this up to Google Photos mediaItems.search." },
    { status: 501 }
  );
}
