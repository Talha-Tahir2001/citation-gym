import { redirect } from "next/navigation"

import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function AssignmentsPage() {
  const user = await getCurrentAppUser()
  if (!user) redirect("/sign-in")
  const assignment = await prisma.assignment.findFirst({
    where:
      user.role === "TEACHER"
        ? { classroom: { teacherId: user.id } }
        : {
            status: "PUBLISHED",
            classroom: {
              enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
            },
          },
    orderBy: { createdAt: "desc" },
  })
  if (!assignment)
    redirect(user.role === "TEACHER" ? "/app/teacher" : "/app/student")
  redirect(
    user.role === "TEACHER"
      ? `/app/teacher/assignments/${assignment.id}`
      : `/app/student/assignments/${assignment.id}`
  )
}
