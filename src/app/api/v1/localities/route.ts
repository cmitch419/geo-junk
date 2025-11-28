import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, error, getRequestUserId, ok, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const createLocalitySchema = z.object({
  name: z.string().min(1, "name is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  nearestTown: z.string().optional(),
  accessNotes: z.string().optional(),
  formation: z.string().optional(),
  stratUnit: z.string().optional(),
  age: z.string().optional(),
  stateProvince: z.string().optional(),
  country: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const localities = await prisma.locality.findMany({
      where: { userId },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }]
    });

    return ok(localities);
  } catch (err) {
    console.error("GET /api/v1/localities error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch localities."
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody(req, createLocalitySchema);
    if (!parsed.success) return parsed.response;

    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const locality = await prisma.locality.create({
      data: {
        userId,
        name: parsed.data.name,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        nearestTown: parsed.data.nearestTown?.trim() || null,
        accessNotes: parsed.data.accessNotes?.trim() || null,
        formation: parsed.data.formation?.trim() || null,
        stratUnit: parsed.data.stratUnit?.trim() || null,
        age: parsed.data.age?.trim() || null,
        stateProvince: parsed.data.stateProvince?.trim() || null,
        country: parsed.data.country?.trim() || null
      }
    });

    return ok(locality, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/localities error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to create locality."
    });
  }
}
