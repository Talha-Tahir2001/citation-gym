"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export function StartAttemptButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const response = await fetch(
          `/api/v1/assignments/${assignmentId}/attempt`,
          { method: "POST" }
        )
        const result = await response.json()
        if (result.data?.id)
          router.push(`/app/student/attempts/${result.data.id}`)
        else setPending(false)
      }}
    >
      {pending ? "Opening studio…" : "Start reasoning studio"}
      <IconArrowRight data-icon="inline-end" />
    </Button>
  )
}
