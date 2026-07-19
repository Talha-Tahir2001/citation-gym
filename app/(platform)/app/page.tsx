import Link from "next/link"
import { IconArrowRight, IconBook2, IconUsers } from "@tabler/icons-react"

import { Role } from "@/app/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function AppHomePage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const isTeacher = user.role === Role.TEACHER
  const classroom = await prisma.classroom.findFirst({
    where: isTeacher
      ? { teacherId: user.id, archivedAt: null }
      : {
          enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
          archivedAt: null,
        },
    include: { _count: { select: { enrollments: true, assignments: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        {isTeacher ? "TEACHER OVERVIEW" : "STUDENT OVERVIEW"}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">
        {isTeacher ? "Your teaching workspace" : "Your learning workspace"}
      </h1>
      {classroom ? (
        <section className="mt-7 rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <IconUsers className="text-primary" />
            <p className="font-medium">{classroom.name}</p>
          </div>
          <p className="mt-3 text-muted-foreground">
            {isTeacher
              ? `${classroom._count.enrollments} students · ${classroom._count.assignments} assignments`
              : `${classroom._count.assignments} assignments available`}
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={
              <Link
                href={
                  isTeacher
                    ? `/app/teacher/classes/${classroom.id}`
                    : `/app/student/classes/${classroom.id}`
                }
              />
            }
          >
            Open class <IconArrowRight data-icon="inline-end" />
          </Button>
        </section>
      ) : (
        <section className="mt-7 rounded-2xl border bg-card p-6">
          <IconBook2 className="text-primary" />
          <p className="mt-4 leading-7 text-muted-foreground">
            {isTeacher
              ? "Create your first classroom to invite students and publish assignments."
              : "Join a classroom with the code your teacher shared."}
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={
              <Link
                href={isTeacher ? "/app/teacher/classes/new" : "/app/student"}
              />
            }
          >
            {isTeacher ? "Create class" : "Join a class"}
            <IconArrowRight data-icon="inline-end" />
          </Button>
        </section>
      )}
    </div>
  )
}
