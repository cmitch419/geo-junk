// src/app/specimens/page.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createSpecimen(formData: FormData) {
  "use server";

  const userId = "demo-user"; // swap once auth is wired

  const tripId = String(formData.get("tripId") || "").trim();
  const localityId = String(formData.get("localityId") || "").trim();
  const shortDescription = String(formData.get("shortDescription") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const collectionDate = String(formData.get("collectionDate") || "").trim();
  const storageLocation = String(formData.get("storageLocation") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const tagsRaw = String(formData.get("tags") || "");
  const tags = Array.from(
    new Set(
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  if (!tripId || !localityId || !shortDescription || !category || !collectionDate) {
    return;
  }

  const parsedDate = new Date(collectionDate);
  if (Number.isNaN(parsedDate.getTime())) return;

  // ensure user exists for FK
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

  // ensure locality is attached to this trip for this user
  const tripLocality = await prisma.tripLocality.findFirst({
    where: {
      tripId,
      localityId,
      trip: { userId }
    }
  });
  if (!tripLocality) return;

  const specimen = await prisma.specimen.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      tripId,
      localityId,
      collectionDate: parsedDate,
      shortDescription,
      category,
      storageLocation: storageLocation || null,
      notes: notes || null
    }
  });

  if (tags.length > 0) {
    const tagRecords = await Promise.all(
      tags.map((name) =>
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

  revalidatePath("/specimens");
}

export default async function SpecimensPage() {
  const trips = await prisma.trip.findMany({
    where: { userId: "demo-user" },
    orderBy: { date: "desc" },
    include: {
      tripLocalities: {
        include: { locality: true },
        orderBy: { locality: { name: "asc" } }
      }
    }
  });

  const specimens = await prisma.specimen.findMany({
    where: { userId: "demo-user" },
    include: {
      trip: { select: { name: true, date: true } },
      locality: { select: { name: true } },
      specimenTags: { include: { tag: true } }
    },
    orderBy: { collectionDate: "desc" }
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Specimens</h1>
        <p className="text-sm text-slate-300">
          Create specimens linked to trips and localities.
        </p>
      </header>

      <section className="border border-slate-700 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Add a specimen</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-slate-400">
            Create a trip first on the <a className="text-emerald-400 underline" href="/trips">Trips</a> page.
          </p>
        ) : (
          <form action={createSpecimen} className="space-y-4">
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
                <div className="text-xs text-emerald-400">
                  <a href="/localities" target="_blank" className="hover:underline">
                    Add or edit a locality in a new tab
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Collection Date</label>
                <input
                  type="date"
                  name="collectionDate"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-slate-200">Category</label>
                <input
                  name="category"
                  placeholder="fossil / rock / mineral / matrix"
                  className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Short Description</label>
              <input
                name="shortDescription"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                placeholder="Brachiopod hash plate"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Storage Location (optional)</label>
              <input
                name="storageLocation"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                placeholder="Cabinet A3"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Notes (optional)</label>
              <textarea
                name="notes"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                rows={3}
                placeholder="Prep notes, lithology, fossil group, etc."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Tags (comma separated)</label>
              <input
                name="tags"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                placeholder="brachiopod, shale, hash plate"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
            >
              Save specimen
            </button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent specimens</h2>
        {specimens.length === 0 ? (
          <p className="text-sm text-slate-400">No specimens yet.</p>
        ) : (
          <ul className="space-y-2">
            {specimens.map((specimen) => (
              <li
                key={specimen.id}
                className="border border-slate-700 rounded px-3 py-2 text-sm space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{specimen.shortDescription}</div>
                  <span className="text-xs text-slate-400">
                    {new Date(specimen.collectionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {specimen.category} • {specimen.trip?.name} — {specimen.locality?.name}
                </div>
                {specimen.notes && (
                  <div className="text-slate-300 text-sm">{specimen.notes}</div>
                )}
                {specimen.specimenTags.length > 0 && (
                  <div className="text-xs text-emerald-300 flex flex-wrap gap-1">
                    {specimen.specimenTags.map((st) => (
                      <span
                        key={st.tag.id}
                        className="border border-emerald-500/50 rounded px-2 py-0.5"
                      >
                        {st.tag.name}
                      </span>
                    ))}
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
