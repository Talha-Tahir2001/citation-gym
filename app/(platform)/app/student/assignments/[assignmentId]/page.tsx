import { notFound, redirect } from "next/navigation"
import {
  IconCalendar,
  IconFileText,
  IconTargetArrow,
} from "@tabler/icons-react"

import { StartAttemptButton } from "@/components/start-attempt-button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const user = await getCurrentAppUser()
  const { assignmentId } = await params
  if (!user) redirect("/sign-in")
  if (!isUuid(assignmentId)) redirect("/app/student")
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      status: "PUBLISHED",
      classroom: {
        enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
      },
    },
    include: { classroom: true, reading: { include: { passages: true } } },
  })
  if (!assignment) notFound()
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        ASSIGNMENT · {assignment.classroom.name.toUpperCase()}
      </p>
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight">
        {assignment.title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        {assignment.prompt}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <IconFileText className="text-primary" />
          <p className="mt-3 font-medium">
            {assignment.reading.passages.length} passages
          </p>
          <p className="text-sm text-muted-foreground">
            {assignment.reading.sourceLabel ?? "Assigned source set"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <IconTargetArrow className="text-primary" />
          <p className="mt-3 font-medium">Evidence to claim</p>
          <p className="text-sm text-muted-foreground">
            Build a clear connection
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <IconCalendar className="text-primary" />
          <p className="mt-3 font-medium">
            {assignment.dueAt
              ? assignment.dueAt.toLocaleDateString()
              : "No due date"}
          </p>
          <p className="text-sm text-muted-foreground">Teacher controlled</p>
        </div>
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-bold">Before you begin</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Read the source set, select the passages that matter, then explain how
          they support a specific claim.
        </p>
        <div className="mt-6">
          <StartAttemptButton assignmentId={assignment.id} />
        </div>
      </section>
    </div>
  )
}
