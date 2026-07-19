"use client"

import { useState } from "react"
import { IconCheck } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export default function ProfileSettingsPage() {
  const [saved, setSaved] = useState(false)
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        SETTINGS
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Profile</h1>
      <section className="mt-7 rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-5">
          <label className="text-sm font-bold">
            DISPLAY NAME
            <input
              defaultValue="Citation Gym learner"
              className="mt-2 h-10 w-full rounded-xl border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-sm font-bold">
            EMAIL
            <input
              defaultValue="student@example.edu"
              disabled
              className="mt-2 h-10 w-full rounded-xl border bg-secondary px-3 font-normal text-muted-foreground"
            />
          </label>
        </div>
        <Button className="mt-7" onClick={() => setSaved(true)}>
          {saved && <IconCheck data-icon="inline-start" />} Save changes
        </Button>
      </section>
    </div>
  )
}
