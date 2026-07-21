"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
export function StartRevisionButton({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function start() {
    setPending(true)
    const r = await fetch(`/api/v1/attempts/${attemptId}/revision`, {
      method: "POST",
    })
    const d = await r.json()
    if (r.ok) router.push(`/app/student/attempts/${attemptId}`)
    else {
      setError(d.error?.message ?? "Unable to start revision.")
      setPending(false)
    }
  }
  return (
    <div className="mt-5">
      <Button disabled={pending} onClick={start}>
        {pending ? "Starting revision…" : "Start revision"}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
