import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEMO_USER_ID = "demo-user"; // replace with real auth later

async function importPhoto(formData: FormData) {
  "use server";

  const tripId = String(formData.get("tripId") || "").trim();
  const localityId = String(formData.get("localityId") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const googleMediaItemId = String(formData.get("googleMediaItemId") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const takenAtRaw = String(formData.get("takenAt") || "").trim();
  const gpsLat = formData.get("gpsLat");
  const gpsLon = formData.get("gpsLon");

  if (!tripId || !localityId || (!imageUrl && !googleMediaItemId)) return;

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@example.com",
      googleUserId: "demo-google-id",
      googleRefreshToken: "dummy-token"
    }
  });

  const tripLocality = await prisma.tripLocality.findFirst({
    where: {
      tripId,
      localityId,
      trip: { userId: DEMO_USER_ID }
    }
  });
  if (!tripLocality) return;

  let takenAt: Date | null = null;
  if (takenAtRaw) {
    const d = new Date(takenAtRaw);
    if (!Number.isNaN(d.getTime())) {
      takenAt = d;
    }
  }

  await prisma.photo.create({
    data: {
      userId: DEMO_USER_ID,
      tripId,
      localityId,
      specimenId: null,
      googleMediaItemId: googleMediaItemId || imageUrl, // temporary storage of source id/url
      googlePhotosUrl: imageUrl || googleMediaItemId,
      caption: caption || null,
      takenAt,
      gpsLat: gpsLat ? Number(gpsLat) : null,
      gpsLon: gpsLon ? Number(gpsLon) : null
    }
  });

  revalidatePath("/photos/import");
}

export default async function PhotoImportPage() {
  const trips = await prisma.trip.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { date: "desc" },
    include: {
      tripLocalities: { include: { locality: true }, orderBy: { locality: { name: "asc" } } }
    }
  });

  const recentPhotos = await prisma.photo.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      trip: { select: { name: true, date: true } },
      locality: { select: { name: true } }
    }
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Import Photo</h1>
        <p className="text-sm text-slate-300">
          Paste a Google Photos link or media item ID. We&apos;ll store it with optional GPS / date metadata.
        </p>
      </header>

      <section className="border border-slate-700 rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Add from Google link / upload URL</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-slate-400">
            Create a trip first. Go to <a href="/trips" className="text-emerald-400 underline">Trips</a>.
          </p>
        ) : (
          <form action={importPhoto} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Trip</label>
                <select
                  name="tripId"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  required
                >
                  <option value="">Select a trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name} ({new Date(trip.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Locality</label>
                <select
                  name="localityId"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  required
                >
                  <option value="">Select a locality</option>
                  {trips.flatMap((trip) =>
                    trip.tripLocalities.map((tl) => (
                      <option key={tl.locality.id} value={tl.locality.id}>
                        {tl.locality.name} — {trip.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Google Photos link or URL</label>
                <input
                  name="imageUrl"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  placeholder="https://photos.google.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Google media item ID (optional)</label>
                <input
                  name="googleMediaItemId"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  placeholder="APw...123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Taken at (optional)</label>
                <input
                  type="datetime-local"
                  name="takenAt"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Caption (optional)</label>
                <input
                  name="caption"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  placeholder="Outcrop overview"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">GPS Lat (optional)</label>
                <input
                  name="gpsLat"
                  type="number"
                  step="any"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">GPS Lon (optional)</label>
                <input
                  name="gpsLon"
                  type="number"
                  step="any"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
            >
              Save photo
            </button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent imports</h2>
        {recentPhotos.length === 0 ? (
          <p className="text-sm text-slate-400">No photos yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentPhotos.map((p) => (
              <li key={p.id} className="border border-slate-700 rounded px-3 py-2 text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.caption || "Untitled photo"}</div>
                  {p.takenAt && (
                    <span className="text-xs text-slate-400">
                      {new Date(p.takenAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {p.trip?.name} — {p.locality?.name}
                </div>
                {(p.googlePhotosUrl || p.googleMediaItemId) && (
                  <div className="text-xs">
                    <a
                      href={p.googlePhotosUrl || undefined}
                      target="_blank"
                      className="text-emerald-400 hover:underline"
                    >
                      {p.googlePhotosUrl || p.googleMediaItemId}
                    </a>
                  </div>
                )}
                {(p.gpsLat !== null || p.gpsLon !== null) && (
                  <div className="text-xs text-slate-300">
                    {p.gpsLat}, {p.gpsLon}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
