"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconBook2, IconChartBar } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function SelectRolePage() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const selectRole = async (role: "STUDENT" | "TEACHER") => {
    setPending(role)
    const response = await fetch("/api/v1/profile/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (response.ok) router.replace("/app")
    else setPending(null)
  }
  return (
    <div className="mx-auto max-w-3xl py-12">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        WELCOME TO CITATION GYM
      </p>
      <h1 className="mt-2 font-heading text-4xl font-bold">
        How will you use Citation Gym?
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Choose your role to set up the correct workspace.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6">
          <IconBook2 className="text-primary" />
          <h2 className="mt-5 font-heading text-2xl font-bold">
            I’m a student
          </h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Join a class and build source-grounded arguments.
          </p>
          <Button
            className="mt-6"
            disabled={pending !== null}
            onClick={() => selectRole("STUDENT")}
          >
            {pending === "STUDENT" ? "Setting up…" : "Continue as student"}
          </Button>
        </section>
        <section className="rounded-2xl border bg-card p-6">
          <IconChartBar className="text-primary" />
          <h2 className="mt-5 font-heading text-2xl font-bold">
            I’m a teacher
          </h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            Create classes, assignments, and reasoning insights.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            disabled={pending !== null}
            onClick={() => selectRole("TEACHER")}
          >
            {pending === "TEACHER" ? "Setting up…" : "Continue as teacher"}
          </Button>
        </section>
      </div>
    </div>
  )
}
