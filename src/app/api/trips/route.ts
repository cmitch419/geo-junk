// src/app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    // For now, ignore auth and just list all trips
    const trips = await prisma.trip.findMany({
      orderBy: { date: "desc" }
    });

    return NextResponse.json(trips);
  } catch (err) {
    console.error("GET /api/trips error:", err);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, notes } = body;

    if (!name || !date) {
      return NextResponse.json(
        { error: "name and date are required" },
        { status: 400 }
      );
    }

    // TEMP: fake userId until auth is wired.
    // You can swap this for the actual logged-in user later.
    const userId = "demo-user";

    // ensure demo user exists so foreign key doesn't explode
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "demo@example.com",
        googleUserId: "demo-google-id",
        googleRefreshToken: "dummy-token"
      }
    });

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        date: new Date(date),
        notes: notes || null
      }
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips error:", err);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
