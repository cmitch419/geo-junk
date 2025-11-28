import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists, getRequestUserId, ok, error, parseJsonBody } from "@/lib/api";
import { z } from "zod";

const createTripSchema = z.object({
  name: z.string().min(1, "name is required"),
  date: z.union([z.string(), z.date()]),
  notes: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { date: "desc" }
    });

    return ok(trips);
  } catch (err) {
    console.error("GET /api/v1/trips error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to fetch trips."
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody(req, createTripSchema);
    if (!parsed.success) return parsed.response;

    const { name, date, notes } = parsed.data;

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return error({
        status: 400,
        code: "INVALID_DATE",
        message: "date must be a valid ISO 8601 date string."
      });
    }

    const userId = getRequestUserId(req);
    await ensureUserExists(userId);

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        date: parsedDate,
        notes: notes?.trim() || null
      }
    });

    return ok(trip, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/trips error:", err);
    return error({
      status: 500,
      code: "SERVER_ERROR",
      message: "Failed to create trip."
    });
  }
}
