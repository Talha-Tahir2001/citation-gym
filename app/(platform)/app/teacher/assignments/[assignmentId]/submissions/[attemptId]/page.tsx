import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowLeft, IconTargetArrow } from "@tabler/icons-react"
import { Role } from "@/app/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherSubmissionPage({
  params,
}: {
  params: Promise<{ assignmentId: string; attemptId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.TEACHER) redirect("/app")
  const { assignmentId, attemptId } = await params
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      student: { select: { displayName: true, email: true } },
      assignment: true,
      versions: {
        include: {
          evidenceLinks: {
            include: { passage: true },
            orderBy: { position: "asc" },
          },
          coachFeedback: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { number: "desc" },
        take: 1,
      },
    },
  })
  if (!attempt || attempt.assignmentId !== assignmentId) notFound()
  const classroom = await prisma.classroom.findFirst({
    where: { id: attempt.assignment.classroomId, teacherId: user.id },
    select: { id: true },
  })
  if (!classroom) notFound()
  const version = attempt.versions[0]
  const feedback = version?.coachFeedback[0]?.resultJson as
    { feedback?: string; nextAction?: string } | undefined
  return (
    <div className="mx-auto max-w-5xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/app/teacher/assignments/${assignmentId}`} />}
      >
        <IconArrowLeft data-icon="inline-start" /> Assignment
      </Button>
      <section className="mt-5">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          STUDENT REASONING TRAIL
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          {attempt.student.displayName ?? attempt.student.email}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {attempt.status.toLowerCase()} · Version{" "}
          {version?.number ?? attempt.currentVersion}
        </p>
      </section>
      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <IconTargetArrow className="text-primary" />
            <h2 className="font-heading text-2xl font-bold">
              Claim and evidence
            </h2>
          </div>
          <p className="mt-5 rounded-xl bg-secondary p-4 leading-7">
            {version?.claimText ?? "No claim saved yet."}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {version?.evidenceLinks.map((link) => (
              <div key={link.id} className="rounded-xl border p-4">
                <p className="text-sm font-medium">
                  {link.passage.label ?? `Passage ${link.passage.ordinal}`}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {link.passage.text}
                </p>
                <p className="mt-3 text-sm">{link.explanation}</p>
              </div>
            )) ?? null}
            {!version?.evidenceLinks.length ? (
              <p className="text-sm text-muted-foreground">
                No evidence links saved yet.
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl font-bold">
            Reflection and coaching
          </h2>
          <p className="mt-5 rounded-xl bg-secondary p-4 leading-7">
            {version?.reflectionText ?? "No reflection saved yet."}
          </p>
          {feedback ? (
            <div className="mt-4 rounded-xl border p-4">
              <p className="font-medium">
                {feedback.feedback ?? "Coaching feedback"}
              </p>
              {feedback.nextAction ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Next action: {feedback.nextAction}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No AI coaching feedback has been requested yet.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
