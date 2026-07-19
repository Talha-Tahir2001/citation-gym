import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherClassesPage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: user.id, archivedAt: null },
    include: { _count: { select: { enrollments: true, assignments: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[.14em] text-primary">
            CLASSES
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold">
            Your classrooms
          </h1>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/app/teacher/classes/new" />}
        >
          <IconPlus data-icon="inline-start" /> Create class
        </Button>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {classrooms.map((classroom) => (
          <Link
            key={classroom.id}
            href={`/app/teacher/classes/${classroom.id}`}
            className="rounded-2xl border bg-card p-5 transition-colors hover:bg-secondary"
          >
            <h2 className="font-heading text-xl font-bold">{classroom.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {classroom._count.enrollments} students ·{" "}
              {classroom._count.assignments} assignments
            </p>
          </Link>
        ))}
      </div>
      {!classrooms.length ? (
        <p className="mt-7 text-muted-foreground">
          No classrooms yet. Create one to get started.
        </p>
      ) : null}
    </div>
  )
}
