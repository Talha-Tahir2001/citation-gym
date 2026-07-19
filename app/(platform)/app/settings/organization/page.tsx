export default function OrganizationSettingsPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        SETTINGS
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Organization</h1>
      <section className="mt-7 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-bold">Your organization</h2>
        <p className="mt-2 leading-7 text-muted-foreground">
          Organization membership, retention, and team permissions will be
          managed here.
        </p>
        <div className="mt-6 rounded-xl bg-secondary p-4">
          <p className="text-sm font-medium">Student data retention</p>
          <p className="mt-1 text-sm text-muted-foreground">
            365 days · configurable by organization administrators
          </p>
        </div>
      </section>
    </div>
  )
}
