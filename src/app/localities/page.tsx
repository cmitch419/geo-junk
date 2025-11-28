import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createLocality(formData: FormData) {
  "use server";

  const userId = "demo-user"; // replace once auth is wired

  const name = String(formData.get("name") || "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const nearestTown = String(formData.get("nearestTown") || "").trim();
  const accessNotes = String(formData.get("accessNotes") || "").trim();
  const formation = String(formData.get("formation") || "").trim();
  const stratUnit = String(formData.get("stratUnit") || "").trim();
  const age = String(formData.get("age") || "").trim();
  const stateProvince = String(formData.get("stateProvince") || "").trim();
  const country = String(formData.get("country") || "").trim();

  if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) return;

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

  await prisma.locality.create({
    data: {
      userId,
      name,
      latitude,
      longitude,
      nearestTown: nearestTown || null,
      accessNotes: accessNotes || null,
      formation: formation || null,
      stratUnit: stratUnit || null,
      age: age || null,
      stateProvince: stateProvince || null,
      country: country || null
    }
  });

  revalidatePath("/localities");
}

export default async function LocalitiesPage() {
  const localities = await prisma.locality.findMany({
    where: { userId: "demo-user" },
    orderBy: [{ name: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Localities</h1>
        <p className="text-sm text-slate-300">
          Manage reusable localities that can be linked to trips.
        </p>
      </header>

      <section className="border border-slate-700 rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Add a locality</h2>
        <form action={createLocality} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm text-slate-200">Name</label>
            <input
              name="name"
              className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Nearest Town</label>
              <input
                name="nearestTown"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Access Notes</label>
              <textarea
                name="accessNotes"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Formation</label>
              <input
                name="formation"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Strat Unit</label>
              <input
                name="stratUnit"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Age</label>
              <input
                name="age"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">State / Province</label>
              <input
                name="stateProvince"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-200">Country</label>
              <input
                name="country"
                className="w-full rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
          >
            Save locality
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your localities</h2>
        {localities.length === 0 ? (
          <p className="text-sm text-slate-400">No localities yet.</p>
        ) : (
          <ul className="space-y-2">
            {localities.map((loc) => (
              <li
                key={loc.id}
                className="border border-slate-700 rounded px-3 py-2 text-sm space-y-1"
              >
                <div className="font-medium">{loc.name}</div>
                <div className="text-xs text-slate-400">
                  {loc.latitude}, {loc.longitude}
                  {loc.nearestTown ? ` • ${loc.nearestTown}` : ""}
                  {loc.stateProvince ? ` • ${loc.stateProvince}` : ""}
                  {loc.country ? ` • ${loc.country}` : ""}
                </div>
                {loc.formation && (
                  <div className="text-xs text-slate-300">
                    {loc.formation}
                    {loc.stratUnit ? ` — ${loc.stratUnit}` : ""}
                    {loc.age ? ` (${loc.age})` : ""}
                  </div>
                )}
                {loc.accessNotes && (
                  <div className="text-slate-300 text-sm">{loc.accessNotes}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
