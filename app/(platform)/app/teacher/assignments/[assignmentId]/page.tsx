import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconFileText, IconUsers } from "@tabler/icons-react"
import { Role } from "@/app/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.TEACHER) redirect("/app")
  const { assignmentId } = await params
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, classroom: { teacherId: user.id } },
    include: {
      classroom: true,
      attempts: {
        include: { student: { select: { displayName: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!assignment) notFound()
  const submitted = assignment.attempts.filter(
    (attempt) => attempt.status === "SUBMITTED"
  )
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[.14em] text-primary">
            ASSIGNMENT
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold">
            {assignment.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {assignment.status.toLowerCase()} · {assignment.classroom.name}
          </p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/app/teacher/classes/${assignment.classroomId}`} />
          }
        >
          Class overview
        </Button>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <IconUsers className="text-primary" />
          <p className="mt-4 text-3xl font-bold">{submitted.length}</p>
          <p className="text-sm text-muted-foreground">Submitted</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <IconFileText className="text-primary" />
          <p className="mt-4 text-3xl font-bold">
            {assignment.attempts.length}
          </p>
          <p className="text-sm text-muted-foreground">Started attempts</p>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-bold">Submission queue</h2>
        {assignment.attempts.length ? (
          <div className="mt-4 flex flex-col divide-y">
            {assignment.attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/app/teacher/assignments/${assignment.id}/submissions/${attempt.id}`}
                className="flex items-center justify-between py-4 hover:bg-secondary"
              >
                <div>
                  <p className="font-medium">
                    {attempt.student.displayName ?? attempt.student.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {attempt.status.toLowerCase()}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Version {attempt.currentVersion}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No students have started this assignment yet.
          </p>
        )}
      </section>
    </div>
  )
}
