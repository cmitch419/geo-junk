import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">GeoJunk</h1>
        <p className="text-sm text-slate-300">
          A fossil & rock specimen inventory app built around Trips, Localities, Specimens, and Photos.
        </p>
      </header>

      <section className="space-y-2">
        <p className="text-slate-200">
          This is a starter skeleton. You&apos;ll still need to:
        </p>
        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
          <li>Configure Google OAuth for Photos and Sheets.</li>
          <li>Run <code>prisma migrate dev</code> to create the database schema.</li>
          <li>Implement the API routes for Photos / Sheets / Trips.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Next steps</h2>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
          <li>Set up environment variables in <code>.env.local</code>.</li>
          <li>Run <code>npm install</code> then <code>npm run dev</code>.</li>
          <li>Start building out the Trip and Specimen flows.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">App sections</h2>
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
          <li><Link href="/trips">Trips</Link> – view and create field trips.</li>
        </ul>
      </section>
    </div>
  );
}
