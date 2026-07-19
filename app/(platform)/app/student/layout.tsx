import { redirect } from "next/navigation"

import { Role } from "@/app/generated/prisma/client"
import { getCurrentAppUser } from "@/lib/current-app-user"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.STUDENT) redirect("/app")
  return children
}
