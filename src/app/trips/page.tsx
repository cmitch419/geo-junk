// src/app/trips/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server action to create a new trip
async function createTrip(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name || !date) return;

  // TEMP userId – match the one used in /api/trips
  const userId = "demo-user";

  // Ensure the demo user exists (same trick as in API)
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

  await prisma.trip.create({
    data: {
      userId,
      name,
      date: new Date(date),
      notes: notes || null
    }
  });

  revalidatePath("/trips");
}

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    orderBy: { date: "desc" }
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Trips</h1>
        <p className="text-sm text-slate-300">
          Field trips are the top-level container for your localities, specimens, and photos.
        </p>
      </header>

      <section className="border border-slate-700 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Create a trip (test)</h2>
        <form action={createTrip} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm text-slate-200">
              Name
            </label>
            <input
              name="name"
              className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              placeholder="Wolf Creek with Evan – 2025-03-02"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-200">
              Date
            </label>
            <input
              name="date"
              type="date"
              className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-200">
              Notes
            </label>
            <textarea
              name="notes"
              className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded bg-emerald-600 px-3 py-1 text-sm font-medium hover:bg-emerald-500"
          >
            Save trip
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Existing trips</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-slate-400">
            No trips yet. Create one using the form above.
          </p>
        ) : (
          <ul className="space-y-2">
            {trips.map((trip) => (
              <li key={trip.id} className="border border-slate-700 rounded-lg px-3 py-2 text-sm flex flex-col gap-1">
                <a href={`/trips/${trip.id}`} className="font-medium text-emerald-400 hover:underline">
                  {trip.name}
                </a>

                <div className="text-slate-400">
                  {new Date(trip.date).toLocaleDateString()}{" "}
                  {trip.notes && <span>• {trip.notes}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
