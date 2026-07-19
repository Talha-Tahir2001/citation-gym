export default function AiSettingsPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        SETTINGS
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">AI controls</h1>
      <section className="mt-7 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-bold">
          Source-grounded coaching
        </h2>
        <p className="mt-2 leading-7 text-muted-foreground">
          Coaching is designed to use only the passages assigned by a teacher
          and return one actionable next step.
        </p>
        <div className="mt-6 flex items-center justify-between rounded-xl bg-secondary p-4">
          <div>
            <p className="font-medium">
              Allow coaching for published assignments
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Provider and audit settings will be connected in the API slice.
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-medium">
            Enabled
          </span>
        </div>
      </section>
    </div>
  )
}
