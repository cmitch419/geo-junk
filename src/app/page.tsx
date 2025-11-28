import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">GeoJunk</h1>
        <p className="text-sm text-slate-300">
          Field fossil & rock specimen inventory built around Trips, Localities, Specimens, and Photos.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What&apos;s working</h2>
        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
          <li>Trips: create and view trips, attach reusable localities.</li>
          <li>Localities: manage a reusable locality library, attach to trips.</li>
          <li>Specimens: create specimens linked to trip + locality with tags.</li>
          <li>Photos: import Google links/media IDs with metadata into trips/localities.</li>
          <li>API v1: REST endpoints for trips, localities, specimens, and photos.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">App sections</h2>
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
          <li><Link href="/trips" className="text-emerald-400 hover:underline">Trips</Link> – create trips and attach localities.</li>
          <li><Link href="/localities" className="text-emerald-400 hover:underline">Localities</Link> – manage reusable localities.</li>
          <li><Link href="/specimens" className="text-emerald-400 hover:underline">Specimens</Link> – catalog specimens tied to trips/localities.</li>
          <li><Link href="/photos/import" className="text-emerald-400 hover:underline">Photo import</Link> – add Google links/media IDs with GPS/time.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Next steps</h2>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
          <li>Run <code>prisma migrate dev</code> then <code>prisma generate</code> to sync DB.</li>
          <li>Set up real auth (replace demo user) and Google Photos OAuth.</li>
          <li>Wire EXIF/Google fetch to auto-fill GPS/time and suggest localities.</li>
          <li>Export to Sheets per the API stubs.</li>
        </ol>
      </section>
    </div>
  );
}
