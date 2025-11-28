export default function TripsPage() {
  // Placeholder – in a real app, you would fetch trips from the database here.
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trips</h1>
      <p className="text-sm text-slate-300">
        This is where you&apos;ll list and create Trips. Each Trip can have one or more Localities,
        and each Locality can have many Specimens and Photos.
      </p>
      <p className="text-sm text-slate-400">
        Implement fetching Trips via an API route and render them here.
      </p>
    </div>
  );
}
