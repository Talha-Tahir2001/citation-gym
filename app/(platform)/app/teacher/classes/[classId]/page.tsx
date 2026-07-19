import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowRight, IconCopy, IconUsers } from "@tabler/icons-react"

import { Role } from "@/app/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherClassPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.TEACHER) redirect("/app")
  const { classId } = await params
  const classroom = await prisma.classroom.findFirst({
    where: { id: classId, teacherId: user.id, archivedAt: null },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: { student: { select: { displayName: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      assignments: {
        include: { _count: { select: { attempts: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!classroom) notFound()

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[.14em] text-primary">
            CLASSROOM
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold">
            {classroom.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {classroom.subject ?? "No subject set"}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link
              href={`/app/teacher/classes/${classroom.id}/assignments/new`}
            />
          }
        >
          New assignment <IconArrowRight data-icon="inline-end" />
        </Button>
      </section>
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-xl font-bold">Invite students</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Students can join from their overview using this code.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono text-base">
            {classroom.joinCode}
          </Badge>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <IconCopy /> Share this exact code with your students.
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <IconUsers className="text-primary" />
            <h2 className="font-heading text-2xl font-bold">Roster</h2>
          </div>
          {classroom.enrollments.length ? (
            <div className="mt-5 flex flex-col divide-y">
              {classroom.enrollments.map(({ student }) => (
                <div
                  key={student.email}
                  className="flex items-center justify-between py-3"
                >
                  <span>{student.displayName ?? student.email}</span>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No students have joined yet.
            </p>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl font-bold">Assignments</h2>
          {classroom.assignments.length ? (
            <div className="mt-5 flex flex-col gap-3">
              {classroom.assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/app/teacher/assignments/${assignment.id}`}
                  className="rounded-xl bg-secondary p-4 transition-colors hover:bg-secondary/75"
                >
                  <p className="font-medium">{assignment.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {assignment.status.toLowerCase()} ·{" "}
                    {assignment._count.attempts} submissions
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No assignments yet.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
