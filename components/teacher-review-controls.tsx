"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function TeacherReviewControls({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function review(action: "RETURNED" | "REVIEWED") {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/attempts/${attemptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error?.message ?? "Unable to save review.")
        return
      }
      router.refresh()
    } catch {
      setError("Unable to reach the server.")
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="mt-6 rounded-2xl border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">Teacher feedback</h2>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Explain the most important revision to make…"
        className="mt-4 min-h-28 w-full rounded-xl border bg-background p-3"
        disabled={pending}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => review("REVIEWED")}
        >
          Mark reviewed
        </Button>
        <Button
          disabled={pending || !note.trim()}
          onClick={() => review("RETURNED")}
        >
          Return for revision
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
