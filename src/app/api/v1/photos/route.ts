import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, error, getRequestUserId, ok, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const createPhotoSchema = z.object({
  tripId: z.string().min(1, "tripId is required"),
  localityId: z.string().min(1, "localityId is required"),
  source: z.enum(["google", "upload", "other"]).default("other"),
  googleMediaItemId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  takenAt: z.union([z.string(), z.date()]).optional(),
  gpsLat: z.coerce.number().optional(),
  gpsLon: z.coerce.number().optional(),
  caption: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const searchParams = req.nextUrl.searchParams;
    const tripId = searchParams.get("tripId") || undefined;
    const localityId = searchParams.get("localityId") || undefined;

    const photos = await prisma.photo.findMany({
      where: { userId, tripId, localityId },
      orderBy: { createdAt: "desc" }
    });

    return ok(photos);
  } catch (err) {
    console.error("GET /api/v1/photos error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch photos."
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody(req, createPhotoSchema);
    if (!parsed.success) return parsed.response;

    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const tripLocality = await prisma.tripLocality.findFirst({
      where: {
        tripId: parsed.data.tripId,
        localityId: parsed.data.localityId,
        trip: { userId }
      },
      select: { localityId: true }
    });

    if (!tripLocality) {
      return error({
        status: 404,
        code: "NOT_FOUND",
        message: "Locality is not attached to this trip for this user."
      });
    }

    let takenAt: Date | null = null;
    if (parsed.data.takenAt) {
      const d = new Date(parsed.data.takenAt);
      if (Number.isNaN(d.getTime())) {
        return error({
          status: 400,
          code: "INVALID_DATE",
          message: "takenAt must be a valid ISO 8601 date string."
        });
      }
      takenAt = d;
    }

    const photo = await prisma.photo.create({
      data: {
        userId,
        tripId: parsed.data.tripId,
        localityId: parsed.data.localityId,
        specimenId: null,
        googleMediaItemId: parsed.data.googleMediaItemId || "",
        googlePhotosUrl: parsed.data.imageUrl || "",
        takenAt,
        gpsLat: parsed.data.gpsLat ?? null,
        gpsLon: parsed.data.gpsLon ?? null,
        caption: parsed.data.caption?.trim() || null
      }
    });

    return ok(photo, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/photos error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to create photo."
    });
  }
}
