import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowRight, IconBook2, IconUsers } from "@tabler/icons-react"

import { Role } from "@/app/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )

export default async function StudentClassPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.STUDENT) redirect("/app")
  const { classId } = await params
  if (!isUuid(classId)) redirect("/app/student/classes")

  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classId,
      archivedAt: null,
      enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
    },
    include: {
      teacher: { select: { displayName: true, email: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        select: { studentId: true },
      },
      assignments: {
        where: { status: "PUBLISHED" },
        include: {
          attempts: {
            where: { studentId: user.id },
            select: { id: true, status: true, currentVersion: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!classroom) notFound()

  const teacherName = classroom.teacher.displayName ?? classroom.teacher.email
  const learnerCount = classroom.enrollments.length

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          {classroom.subject?.toUpperCase() ?? "CLASSROOM"}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
          {classroom.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {teacherName} · {learnerCount} active learner
          {learnerCount === 1 ? "" : "s"}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <IconBook2 className="text-primary" />
            <CardDescription>Published assignments</CardDescription>
            <CardTitle className="text-3xl">
              {classroom.assignments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <IconUsers className="text-primary" />
            <CardDescription>Active learners</CardDescription>
            <CardTitle className="text-3xl">{learnerCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-bold tracking-[.14em] text-primary">
            ASSIGNMENTS
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold">
            Your classwork
          </h2>
        </div>
        {classroom.assignments.length ? (
          classroom.assignments.map((assignment) => {
            const attempt = assignment.attempts[0]
            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardDescription>Published assignment</CardDescription>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription>{assignment.prompt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={attempt ? "secondary" : "outline"}>
                    {attempt ? attempt.status.toLowerCase() : "ready to start"}
                  </Badge>
                </CardContent>
                <CardFooter>
                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/app/student/assignments/${assignment.id}`} />
                    }
                  >
                    {attempt ? "Continue assignment" : "View assignment"}
                    <IconArrowRight data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No published assignments yet</CardTitle>
              <CardDescription>
                Your teacher has not published classwork for this classroom.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  )
}
