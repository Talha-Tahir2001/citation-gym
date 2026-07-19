import { Role } from "@/app/generated/prisma/client"
import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const body = (await request.json().catch(() => null)) as {
    role?: string
  } | null
  const role =
    body?.role === "TEACHER"
      ? Role.TEACHER
      : body?.role === "STUDENT"
        ? Role.STUDENT
        : null
  if (!role) return fail("INVALID_REQUEST", "Choose either STUDENT or TEACHER.")
  return ok(
    await prisma.user.update({ where: { id: user.id }, data: { role } })
  )
}
