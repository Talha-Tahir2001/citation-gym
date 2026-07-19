"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function JoinClassForm() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  async function joinClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      })
      const result = (await response.json()) as {
        data?: { id: string }
        error?: { message?: string }
      }
      if (!response.ok || !result.data) {
        setError(result.error?.message ?? "Unable to join this class.")
        return
      }
      router.push(`/app/student/classes/${result.data.id}`)
      router.refresh()
    } catch {
      setError("Unable to reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={joinClass}>
      <Input
        value={joinCode}
        onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
        placeholder="CG-ABC123"
        aria-label="Class join code"
        required
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <IconLoader2 data-icon="inline-start" className="animate-spin" />
        ) : null}
        {isSubmitting ? "Joining…" : "Join class"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive sm:basis-full">{error}</p>
      ) : null}
    </form>
  )
}
