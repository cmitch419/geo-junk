import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, getRequestUserId, ok, error, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const createLocalitySchema = z.object({
  name: z.string().min(1, "name is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  nearestTown: z.string().optional(),
  accessNotes: z.string().optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const trip = await prisma.trip.findFirst({
      where: { id: params.tripId, userId },
      select: { id: true }
    });

    if (!trip) {
      return error({
        status: 404,
        code: "NOT_FOUND",
        message: "Trip not found for this user."
      });
    }

    const localities = await prisma.locality.findMany({
      where: { tripId: trip.id, userId },
      orderBy: { createdAt: "desc" }
    });

    return ok(localities);
  } catch (err) {
    console.error("GET /api/v1/trips/[tripId]/localities error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch localities."
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const trip = await prisma.trip.findFirst({
      where: { id: params.tripId, userId },
      select: { id: true }
    });

    if (!trip) {
      return error({
        status: 404,
        code: "NOT_FOUND",
        message: "Trip not found for this user."
      });
    }

    const parsed = await parseJsonBody(req, createLocalitySchema);
    if (!parsed.success) return parsed.response;

    const locality = await prisma.locality.create({
      data: {
        userId,
        tripId: trip.id,
        name: parsed.data.name,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        nearestTown: parsed.data.nearestTown?.trim() || null,
        accessNotes: parsed.data.accessNotes?.trim() || null
      }
    });

    return ok(locality, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/trips/[tripId]/localities error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to create locality."
    });
  }
}
