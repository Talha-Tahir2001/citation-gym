"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CreateClassResponse = {
  data?: { id: string }
  error?: { message?: string }
}

export default function NewClassPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function createClassroom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/v1/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject }),
      })
      const result = (await response.json()) as CreateClassResponse

      if (!response.ok || !result.data) {
        setError(result.error?.message ?? "Unable to create the classroom.")
        return
      }

      router.push(`/app/teacher/classes/${result.data.id}`)
      router.refresh()
    } catch {
      setError("Unable to reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href="/app/teacher" />}
      >
        <IconArrowLeft data-icon="inline-start" /> Dashboard
      </Button>
      <section className="mt-5 rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          NEW CLASS
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          Set up a classroom
        </h1>
        <form className="mt-7 flex flex-col gap-5" onSubmit={createClassroom}>
          <label
            className="flex flex-col gap-2 text-sm font-bold"
            htmlFor="name"
          >
            CLASS NAME
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="English 10 · Period 3"
              required
              disabled={isSubmitting}
            />
          </label>
          <label
            className="flex flex-col gap-2 text-sm font-bold"
            htmlFor="subject"
          >
            SUBJECT{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
            <Input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="English Language Arts"
              disabled={isSubmitting}
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="self-start" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <IconLoader2 data-icon="inline-start" className="animate-spin" />
            ) : null}
            {isSubmitting ? "Creating class…" : "Create class"}
          </Button>
        </form>
      </section>
    </div>
  )
}
