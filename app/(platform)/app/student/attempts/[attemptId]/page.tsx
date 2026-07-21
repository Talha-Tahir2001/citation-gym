"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { IconArrowRight, IconCheck, IconSparkles } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AttemptData = {
  status: "DRAFT" | "SUBMITTED" | "RETURNED" | "RESUBMITTED" | "REVIEWED"
  assignment: {
    title: string
    prompt: string
    reading: { passages: { id: string; label: string | null; text: string }[] }
  }
  versions: {
    claimText: string | null
    reflectionText: string | null
    evidenceLinks: { passageId: string; explanation: string }[]
    coachFeedback: {
      resultJson: {
        alignmentSummary?: string
        feedback?: string
        nextAction?: string
      }
    }[]
  }[]
  teacherReviews: { note: string | null }[]
}

export default function ReasoningStudioPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [claim, setClaim] = useState("")
  const [explanation, setExplanation] = useState("")
  const [saving, setSaving] = useState(false)
  const [coaching, setCoaching] = useState(false)
  const [coachError, setCoachError] = useState<string | null>(null)
  const [coach, setCoach] = useState<{
    alignmentSummary?: string
    feedback?: string
    nextAction?: string
  } | null>(null)
  useEffect(() => {
    fetch(`/api/v1/attempts/${attemptId}`)
      .then((response) => response.json())
      .then((result) => {
        const data = result.data as AttemptData
        setAttempt(data)
        const version = data?.versions?.[0]
        setClaim(version?.claimText ?? "")
        setExplanation(version?.reflectionText ?? "")
        setSelected(version?.evidenceLinks?.map((link) => link.passageId) ?? [])
        setCoach(version?.coachFeedback?.[0]?.resultJson ?? null)
      })
  }, [attemptId])
  if (!attempt)
    return (
      <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
        Loading your reasoning studio…
      </div>
    )
  const save = async () => {
    setSaving(true)
    await fetch(`/api/v1/attempts/${attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimText: claim,
        reflectionText: explanation,
        evidence: selected.map((passageId) => ({ passageId, explanation })),
      }),
    })
    setSaving(false)
  }
  const requestCoach = async () => {
    setCoachError(null)
    setCoaching(true)
    try {
      await save()
      const response = await fetch("/api/v1/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      })
      const result = await response.json()
      if (!response.ok) {
        setCoachError(
          result.error?.message ?? "Coaching is unavailable right now."
        )
        return
      }
      setCoach(result.data?.feedback ?? null)
    } catch {
      setCoachError("Unable to reach the coaching service.")
    } finally {
      setCoaching(false)
    }
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-2xl border bg-card p-5">
        <p className="text-xs font-bold tracking-[.14em] text-primary">
          ASSIGNED READING
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold">
          {attempt.assignment.title}
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          {attempt.assignment.prompt}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {attempt.assignment.reading.passages.map((passage) => (
            <button
              key={passage.id}
              onClick={() =>
                setSelected((current) =>
                  current.includes(passage.id)
                    ? current.filter((item) => item !== passage.id)
                    : [...current, passage.id]
                )
              }
              className={
                selected.includes(passage.id)
                  ? "rounded-xl border border-primary bg-primary/10 p-4 text-left"
                  : "rounded-xl border p-4 text-left hover:bg-secondary"
              }
            >
              <div className="flex justify-between gap-3">
                <strong className="text-sm">
                  {passage.label ?? "Passage"}
                </strong>
                {selected.includes(passage.id) && (
                  <IconCheck className="text-primary" />
                )}
              </div>
              <p className="mt-2 text-sm leading-6">{passage.text}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <p className="text-xs font-bold tracking-[.14em] text-primary">
          REASONING STUDIO
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold">Make your case</h2>
        <label className="mt-7 block text-sm font-bold">
          MAKE A CLAIM
          <textarea
            value={claim}
            onChange={(event) => setClaim(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-xl border bg-background p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="mt-6 block text-sm font-bold">
          CONNECT THE EVIDENCE
          <textarea
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-xl border bg-background p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {coach && (
          <Card className="mt-6 border-primary/35 bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSparkles data-icon="inline-start" /> AI coaching
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {coach.alignmentSummary ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  <strong className="text-foreground">Evidence alignment:</strong>{" "}
                  {coach.alignmentSummary}
                </p>
              ) : null}
              <p className="text-sm leading-6">
                <strong>{coach.feedback}</strong>
                {coach.nextAction && <> {coach.nextAction}</>}
              </p>
            </CardContent>
          </Card>
        )}
        {attempt.status === "RETURNED" ? (
          <div className="mt-6 rounded-xl border border-primary/35 bg-primary/10 p-4">
            <p className="font-medium">Your teacher requested a revision</p>
            <p className="mt-2 text-sm">{attempt.teacherReviews[0]?.note}</p>
            <Button
              className="mt-4"
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/app/student/attempts/${attemptId}/review`} />
              }
            >
              Review feedback and start revision
            </Button>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            disabled={!claim || selected.length === 0 || coaching || saving}
            onClick={requestCoach}
          >
            {coaching ? "Coaching…" : "Coach me"}{" "}
            <IconSparkles data-icon="inline-end" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/app/student/attempts/${attemptId}/review`} />}
          >
            Review <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
        {coachError ? (
          <p className="mt-3 text-sm text-destructive">{coachError}</p>
        ) : null}
      </section>
    </div>
  )
}
