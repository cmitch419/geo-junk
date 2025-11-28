// src/app/trips/[tripId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function createLocality(tripId: string, formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const nearestTown = String(formData.get("nearestTown") || "").trim();
  const notes = String(formData.get("accessNotes") || "").trim();

  if (!name || !latitude || !longitude) return;

  const userId = "demo-user"; // replace with real auth later

  await prisma.locality.create({
    data: {
      userId,
      tripId,
      name,
      latitude,
      longitude,
      nearestTown: nearestTown || null,
      accessNotes: notes || null
    }
  });

  revalidatePath(`/trips/${tripId}`);
}

export default async function TripDetailPage({
  params
}: {
  params: { tripId: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: {
      localities: true
    }
  });

  if (!trip) return notFound();

  return (
    <div className="space-y-8">
      {/* Trip Header */}
      <header>
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-slate-400 text-sm">
          {new Date(trip.date).toLocaleDateString()}
        </p>
        <Link href="/trips" className="text-emerald-400 text-sm">
          ← Back to trips
        </Link>
      </header>

      {/* Create Locality */}
      <section className="p-4 border border-slate-700 rounded-lg space-y-3">
        <h2 className="text-xl font-semibold">Add a locality</h2>

        <form action={createLocality.bind(null, trip.id)} className="space-y-3">
          <div>
            <label className="block text-sm">Locality Name</label>
            <input
              name="name"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Latitude</label>
              <input
                type="number"
                name="latitude"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Longitude</label>
              <input
                type="number"
                name="longitude"
                step="any"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Nearest Town</label>
            <input
              name="nearestTown"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm">Access Notes</label>
            <textarea
              name="accessNotes"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-sm"
          >
            Add Locality
          </button>
        </form>
      </section>

      {/* List localities */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Localities</h2>

        {trip.localities.length === 0 ? (
          <p className="text-sm text-slate-400">
            No localities yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {trip.localities.map((loc) => (
              <li
                key={loc.id}
                className="border border-slate-700 rounded px-3 py-2 text-sm"
              >
                <div className="font-medium">{loc.name}</div>
                <div className="text-slate-400 text-xs">
                  {loc.latitude}, {loc.longitude}
                  {loc.nearestTown ? ` • ${loc.nearestTown}` : ""}
                </div>
                {loc.accessNotes && (
                  <div className="text-slate-300 mt-1">{loc.accessNotes}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
