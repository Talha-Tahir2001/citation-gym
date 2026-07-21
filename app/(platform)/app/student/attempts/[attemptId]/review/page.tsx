import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowLeft, IconCheck, IconTargetArrow } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { SubmitAttemptButton } from "@/components/submit-attempt-button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"
import { StartRevisionButton } from "@/components/start-revision-button"

export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user) redirect("/sign-in")
  const { attemptId } = await params
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, studentId: user.id },
    include: {
      assignment: true,
      versions: {
        include: {
          evidenceLinks: { include: { passage: true } },
          coachFeedback: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { number: "desc" },
        take: 1,
      },
      teacherReviews: {
        where: { action: "RETURNED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
  if (!attempt) notFound()
  const version = attempt.versions[0]
  const feedback = version?.coachFeedback[0]?.resultJson as
    { feedback?: string; nextAction?: string } | undefined
  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/app/student/attempts/${attempt.id}`} />}
      >
        <IconArrowLeft data-icon="inline-start" /> Back to draft
      </Button>
      <section className="mt-5 rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          REVIEW
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          {attempt.assignment.title}
        </h1>
        <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs font-bold">EVIDENCE</p>
            {version?.evidenceLinks.map((link) => (
              <p key={link.id} className="mt-2 text-sm leading-6">
                {link.passage.label}: {link.explanation}
              </p>
            )) ?? null}
            {!version?.evidenceLinks.length ? (
              <p className="mt-2 text-sm">No evidence selected.</p>
            ) : null}
          </div>
          <IconTargetArrow className="mx-auto self-center text-primary" />
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs font-bold">CLAIM</p>
            <p className="mt-2 text-sm leading-6">
              {version?.claimText ?? "No claim saved."}
            </p>
          </div>
        </div>
        {feedback ? (
          <div className="mt-6 rounded-xl border border-primary/35 bg-primary/10 p-4">
            <div className="flex gap-3">
              <IconCheck className="shrink-0 text-primary" />
              <p className="text-sm leading-6">
                <strong>{feedback.feedback}</strong>
                {feedback.nextAction ? ` ${feedback.nextAction}` : ""}
              </p>
            </div>
          </div>
        ) : null}
        {attempt.status === "RETURNED" ? (
          <>
            <div className="mt-6 rounded-xl border border-primary/35 bg-primary/10 p-4">
              <p className="font-medium">Your teacher requested a revision</p>
              <p className="mt-2 text-sm">{attempt.teacherReviews[0]?.note}</p>
            </div>
            <StartRevisionButton attemptId={attempt.id} />
          </>
        ) : attempt.status === "SUBMITTED" ||
          attempt.status === "RESUBMITTED" ||
          attempt.status === "REVIEWED" ? (
          <p className="mt-6 font-medium text-primary">
            {attempt.status.toLowerCase()}.
          </p>
        ) : (
          <SubmitAttemptButton attemptId={attempt.id} />
        )}
      </section>
    </div>
  )
}
