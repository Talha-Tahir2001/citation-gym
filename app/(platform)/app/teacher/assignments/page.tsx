import Link from "next/link"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const assignments = await prisma.assignment.findMany({
    where: { classroom: { teacherId: user.id } },
    include: { classroom: true, _count: { select: { attempts: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        ASSIGNMENTS
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Your assignments</h1>
      <div className="mt-7 flex flex-col gap-3">
        {assignments.map((assignment) => (
          <Link
            key={assignment.id}
            href={`/app/teacher/assignments/${assignment.id}`}
            className="rounded-2xl border bg-card p-5 transition-colors hover:bg-secondary"
          >
            <h2 className="font-heading text-xl font-bold">
              {assignment.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {assignment.classroom.name} · {assignment.status.toLowerCase()} ·{" "}
              {assignment._count.attempts} submissions
            </p>
          </Link>
        ))}
      </div>
      {!assignments.length ? (
        <p className="mt-7 text-muted-foreground">
          No assignments yet. Create one from a classroom.
        </p>
      ) : null}
    </div>
  )
}
