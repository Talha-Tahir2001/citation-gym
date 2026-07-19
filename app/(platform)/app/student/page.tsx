import Link from "next/link"
import { IconBook2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"
import { JoinClassForm } from "@/components/join-class-form"

export default async function StudentDashboardPage() {
  const user = await getCurrentAppUser()
  if (!user) return null
  const assignment = await prisma.assignment.findFirst({
    where: {
      status: "PUBLISHED",
      classroom: {
        enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
      },
    },
    include: { classroom: true },
    orderBy: { createdAt: "desc" },
  })
  if (!assignment)
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          MY LEARNING
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          You’re ready to join a class.
        </h1>
        <section className="mt-7 rounded-2xl border bg-card p-6">
          <IconBook2 className="text-primary" />
          <p className="mt-4 leading-7 text-muted-foreground">
            Ask your teacher for a class join code, then enter it here.
          </p>
          <JoinClassForm />
        </section>
      </div>
    )
  return (
    <div>
      <p className="text-sm font-bold tracking-[.14em] text-primary">
        MY LEARNING
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">
        Your next reasoning move
      </h1>
      <section className="mt-7 rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold text-primary">
          {assignment.classroom.name}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold">
          {assignment.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{assignment.prompt}</p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href={`/app/student/assignments/${assignment.id}`} />}
        >
          Open assignment
        </Button>
      </section>
    </div>
  )
}
