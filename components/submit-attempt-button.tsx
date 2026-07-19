"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconCheck, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function SubmitAttemptButton({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit() {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
        method: "POST",
      })
      const result = (await response.json()) as { error?: { message?: string } }
      if (!response.ok) {
        setError(result.error?.message ?? "Unable to submit.")
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
    <div className="mt-6 flex flex-col gap-3">
      <Button onClick={submit} disabled={pending}>
        {pending ? (
          <IconLoader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <IconCheck data-icon="inline-start" />
        )}
        {pending ? "Submitting…" : "Submit assignment"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
