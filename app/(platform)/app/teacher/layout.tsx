import { redirect } from "next/navigation"

import { Role } from "@/app/generated/prisma/client"
import { getCurrentAppUser } from "@/lib/current-app-user"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.TEACHER) redirect("/app")
  return children
}
