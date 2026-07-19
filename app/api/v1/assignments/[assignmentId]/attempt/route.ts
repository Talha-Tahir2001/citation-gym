import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { assignmentId } = await context.params
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      status: "PUBLISHED",
      classroom: {
        enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
      },
    },
  })
  if (!assignment)
    return fail("NOT_FOUND", "Published assignment not found.", 404)
  const attempt = await prisma.attempt.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
    create: {
      assignmentId,
      studentId: user.id,
      versions: { create: { number: 1 } },
    },
    update: {},
    include: { versions: { orderBy: { number: "desc" }, take: 1 } },
  })
  return ok(attempt, 201)
}
