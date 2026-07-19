import Link from "next/link"
import { JoinClassForm } from "@/components/join-class-form"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function StudentClassesPage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const classrooms = await prisma.classroom.findMany({
    where: {
      enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
      archivedAt: null,
    },
    include: { _count: { select: { assignments: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div>
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        MY CLASSES
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Your classrooms</h1>
      <section className="mt-7 rounded-2xl border bg-card p-5">
        <p className="font-medium">Join another class</p>
        <JoinClassForm />
      </section>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {classrooms.map((classroom) => (
          <Link
            key={classroom.id}
            href={`/app/student/classes/${classroom.id}`}
            className="rounded-2xl border bg-card p-5 transition-colors hover:bg-secondary"
          >
            <h2 className="font-heading text-xl font-bold">{classroom.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {classroom._count.assignments} assignments
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
