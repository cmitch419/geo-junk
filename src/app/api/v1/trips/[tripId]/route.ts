import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, getRequestUserId, ok, error } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const trip = await prisma.trip.findFirst({
      where: { id: params.tripId, userId },
      include: {
        tripLocalities: {
          include: { locality: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!trip) {
      return error({
        status: 404,
        code: "NOT_FOUND",
        message: "Trip not found for this user."
      });
    }

    return ok({
      ...trip,
      localities: trip.tripLocalities.map((tl) => tl.locality)
    });
  } catch (err) {
    console.error("GET /api/v1/trips/[tripId] error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch trip."
    });
  }
}
