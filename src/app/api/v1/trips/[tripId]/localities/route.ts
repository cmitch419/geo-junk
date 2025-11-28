import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, getRequestUserId, ok, error, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const upsertLocalitySchema = z
  .object({
    localityId: z.string().optional(),
    name: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    nearestTown: z.string().optional(),
    accessNotes: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const isAttach = Boolean(data.localityId);
    if (isAttach) {
      return;
    }
    if (!data.name || data.latitude === undefined || data.longitude === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "name, latitude, and longitude are required when creating a new locality."
      });
    }
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

    const localities = await prisma.tripLocality.findMany({
      where: { tripId: trip.id },
      include: { locality: true },
      orderBy: { createdAt: "desc" }
    });

    return ok(
      localities.map((tl) => ({
        tripLocalityId: tl.id,
        ...tl.locality
      }))
    );
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

    const parsed = await parseJsonBody(req, upsertLocalitySchema);
    if (!parsed.success) return parsed.response;

    if (parsed.data.localityId) {
      // attach existing locality to this trip
      const locality = await prisma.locality.findFirst({
        where: { id: parsed.data.localityId, userId }
      });
      if (!locality) {
        return error({
          status: 404,
          code: "NOT_FOUND",
          message: "Locality not found for this user."
        });
      }

      await prisma.tripLocality.upsert({
        where: { tripId_localityId: { tripId: trip.id, localityId: locality.id } },
        update: {},
        create: { tripId: trip.id, localityId: locality.id }
      });

      return ok(locality, { status: 201 });
    }

    const locality = await prisma.locality.create({
      data: {
        userId,
        name: parsed.data.name || "",
        latitude: parsed.data.latitude ?? 0,
        longitude: parsed.data.longitude ?? 0,
        nearestTown: parsed.data.nearestTown?.trim() || null,
        accessNotes: parsed.data.accessNotes?.trim() || null
      }
    });

    await prisma.tripLocality.create({
      data: {
        tripId: trip.id,
        localityId: locality.id
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
