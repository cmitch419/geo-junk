import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, error, getRequestUserId, ok, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const createSpecimenSchema = z.object({
  id: z.string().optional(),
  tripId: z.string().min(1, "tripId is required"),
  localityId: z.string().min(1, "localityId is required"),
  collectionDate: z.union([z.string(), z.date()]),
  shortDescription: z.string().min(1, "shortDescription is required"),
  category: z.string().min(1, "category is required"),
  storageLocation: z.string().optional(),
  lithology: z.string().optional(),
  fossilGroup: z.string().optional(),
  prepStatus: z.string().optional(),
  keepTradeStatus: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export async function GET(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const searchParams = req.nextUrl.searchParams;
    const tripId = searchParams.get("tripId") || undefined;
    const localityId = searchParams.get("localityId") || undefined;

    const specimens = await prisma.specimen.findMany({
      where: {
        userId,
        tripId,
        localityId
      },
      include: {
        specimenTags: { include: { tag: true } }
      },
      orderBy: { collectionDate: "desc" }
    });

    return ok(
      specimens.map((s) => ({
        ...s,
        tags: s.specimenTags.map((st) => st.tag.name)
      }))
    );
  } catch (err) {
    console.error("GET /api/v1/specimens error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch specimens."
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody(req, createSpecimenSchema);
    if (!parsed.success) return parsed.response;

    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    // Ensure the trip and locality belong to this user and are linked
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
        message: "Locality not attached to this trip for this user."
      });
    }

    const parsedDate = new Date(parsed.data.collectionDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return error({
        status: 400,
        code: "INVALID_DATE",
        message: "collectionDate must be a valid ISO 8601 date string."
      });
    }

    const specimenId = parsed.data.id?.trim() || crypto.randomUUID();

    const specimen = await prisma.specimen.create({
      data: {
        id: specimenId,
        userId,
        tripId: parsed.data.tripId,
        localityId: parsed.data.localityId,
        collectionDate: parsedDate,
        shortDescription: parsed.data.shortDescription,
        category: parsed.data.category,
        storageLocation: parsed.data.storageLocation?.trim() || null,
        lithology: parsed.data.lithology?.trim() || null,
        fossilGroup: parsed.data.fossilGroup?.trim() || null,
        prepStatus: parsed.data.prepStatus?.trim() || null,
        keepTradeStatus: parsed.data.keepTradeStatus?.trim() || null,
        notes: parsed.data.notes?.trim() || null
      }
    });

    const rawTags = parsed.data.tags ?? [];
    const tagNames = Array.from(
      new Set(
        rawTags.map((t) => t.trim()).filter(Boolean)
      )
    );

    if (tagNames.length > 0) {
      const tagRecords = await Promise.all(
        tagNames.map((name) =>
          prisma.tag.upsert({
            where: { userId_name: { userId, name } },
            update: {},
            create: { userId, name }
          })
        )
      );

      await prisma.$transaction(
        tagRecords.map((tag) =>
          prisma.specimenTag.upsert({
            where: { specimenId_tagId: { specimenId: specimen.id, tagId: tag.id } },
            update: {},
            create: { specimenId: specimen.id, tagId: tag.id }
          })
        )
      );
    }

    return ok(
      {
        ...specimen,
        tags: tagNames
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/v1/specimens error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to create specimen."
    });
  }
}
