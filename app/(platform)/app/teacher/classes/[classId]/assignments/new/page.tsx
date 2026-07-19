"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewAssignmentPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [readingBody, setReadingBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function createAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/classes/${classId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt, readingBody, publish: true }),
      })
      const result = (await response.json()) as {
        data?: { id: string }
        error?: { message?: string }
      }
      if (!response.ok || !result.data) {
        setError(result.error?.message ?? "Unable to create assignment.")
        return
      }
      router.push(`/app/teacher/assignments/${result.data.id}`)
      router.refresh()
    } catch {
      setError("Unable to reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/app/teacher/classes/${classId}`} />}
      >
        <IconArrowLeft data-icon="inline-start" /> Class
      </Button>
      <section className="mt-5 rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          NEW ASSIGNMENT
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          Create a published assignment
        </h1>
        <form className="mt-7 flex flex-col gap-5" onSubmit={createAssignment}>
          <label className="flex flex-col gap-2 text-sm font-bold">
            TITLE
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Make a claim from evidence"
              required
              disabled={isSubmitting}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold">
            ARGUMENT PROMPT
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-32 rounded-xl border bg-background p-3 font-normal"
              required
              disabled={isSubmitting}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold">
            READING TEXT
            <textarea
              value={readingBody}
              onChange={(event) => setReadingBody(event.target.value)}
              className="min-h-56 rounded-xl border bg-background p-3 font-normal"
              required
              disabled={isSubmitting}
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="self-start" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <IconLoader2 data-icon="inline-start" className="animate-spin" />
            ) : null}
            {isSubmitting ? "Publishing…" : "Publish assignment"}
          </Button>
        </form>
      </section>
    </div>
  )
}
