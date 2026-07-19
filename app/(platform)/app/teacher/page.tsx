import Link from "next/link"
import { IconArrowRight, IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherDashboardPage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const classroom = await prisma.classroom.findFirst({
    where: { teacherId: user.id, archivedAt: null },
    include: {
      assignments: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  if (!classroom)
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          TEACHER DASHBOARD
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          Start with your first class.
        </h1>
        <section className="mt-7 rounded-2xl border bg-card p-6">
          <IconUsers className="text-primary" />
          <p className="mt-4 leading-7 text-muted-foreground">
            Create a real classroom, then share its join code with your
            students.
          </p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/app/teacher/classes/new" />}
          >
            Create class <IconArrowRight data-icon="inline-end" />
          </Button>
        </section>
      </div>
    )
  return (
    <div>
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        TEACHER DASHBOARD
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">{classroom.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {classroom._count.enrollments} enrolled · Join code:{" "}
        <strong>{classroom.joinCode}</strong>
      </p>
      <section className="mt-7 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-2xl font-bold">
          {classroom.assignments[0]?.title ?? "No assignments yet"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {classroom.assignments[0]?.prompt ??
            "Create an assignment to begin collecting reasoning trails."}
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href={`/app/teacher/classes/${classroom.id}`} />}
        >
          Manage classroom
        </Button>
      </section>
    </div>
  )
}
