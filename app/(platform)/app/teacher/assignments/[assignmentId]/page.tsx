import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowRight, IconFileText, IconSparkles, IconUsers } from "@tabler/icons-react"
import { Role } from "@/app/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      signatures: {
        include: {
          feedback: {
            include: {
              feedback: {
                include: {
                  attemptVersion: { include: { attempt: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!assignment) notFound()
  const statusCounts = Object.fromEntries(
    ["DRAFT", "SUBMITTED", "RETURNED", "RESUBMITTED", "REVIEWED"].map(
      (status) => [
        status,
        assignment.attempts.filter((attempt) => attempt.status === status).length,
      ]
    )
  ) as Record<string, number>
  const insightPatterns = assignment.signatures
    .map((signature) => ({
      ...signature,
      affectedStudents: new Set(
        signature.feedback.map(
          (match) => match.feedback.attemptVersion.attempt.studentId
        )
      ).size,
    }))
    .filter((signature) => signature.affectedStudents > 0)
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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} size="sm">
            <CardHeader>
              <CardDescription>{status.toLowerCase()}</CardDescription>
              <CardTitle className="text-3xl">{count}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Assignment insights</CardTitle>
          <CardDescription>
            Patterns from source-grounded coaching, grouped by affected student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightPatterns.length ? (
            <div className="flex flex-col divide-y">
              {insightPatterns.map((signature) => (
                <Link
                  key={signature.id}
                  href={`/app/teacher/assignments/${assignment.id}/insights/${signature.id}`}
                  className="flex items-center justify-between gap-4 py-4 hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">{signature.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {signature.definition}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {signature.affectedStudents} student
                    {signature.affectedStudents === 1 ? "" : "s"}
                    <IconArrowRight data-icon="inline-end" />
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-4 text-sm text-muted-foreground">
              <IconSparkles className="text-primary" />
              <p>No coaching patterns yet.</p>
              <p>
                Patterns will appear when students request coaching on this
                assignment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Submission queue</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
