import { EnrollmentStatus, Role } from "@/app/generated/prisma/client"
import { fail, ok, requireUser, string } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  if (user.role !== Role.STUDENT)
    return fail("FORBIDDEN", "Only students can join a class.", 403)
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  const joinCode = string(body?.joinCode).toUpperCase()
  if (!joinCode) return fail("INVALID_REQUEST", "A class code is required.")
  const classroom = await prisma.classroom.findFirst({
    where: { joinCode, archivedAt: null },
  })
  if (!classroom)
    return fail("NOT_FOUND", "No active class matches that code.", 404)
  await prisma.$transaction([
    prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: classroom.organizationId,
        },
      },
      create: {
        userId: user.id,
        organizationId: classroom.organizationId,
        role: Role.STUDENT,
      },
      update: { role: Role.STUDENT },
    }),
    prisma.enrollment.upsert({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId: user.id,
        },
      },
      create: {
        classroomId: classroom.id,
        studentId: user.id,
        status: EnrollmentStatus.ACTIVE,
      },
      update: { status: EnrollmentStatus.ACTIVE },
    }),
  ])
  return ok({ id: classroom.id, name: classroom.name })
}
