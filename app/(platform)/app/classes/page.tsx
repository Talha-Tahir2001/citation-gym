import { redirect } from "next/navigation"

import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function ClassesPage() {
  const user = await getCurrentAppUser()
  if (!user) redirect("/sign-in")
  const classroom = await prisma.classroom.findFirst({
    where:
      user.role === "TEACHER"
        ? { teacherId: user.id }
        : { enrollments: { some: { studentId: user.id, status: "ACTIVE" } } },
    orderBy: { createdAt: "desc" },
  })
  if (!classroom)
    redirect(
      user.role === "TEACHER" ? "/app/teacher/classes/new" : "/app/student"
    )
  redirect(
    user.role === "TEACHER"
      ? `/app/teacher/classes/${classroom.id}`
      : `/app/student/classes/${classroom.id}`
  )
}
