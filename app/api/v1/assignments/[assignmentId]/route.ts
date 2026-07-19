import { Role } from "@/app/generated/prisma/client"
import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { assignmentId } = await context.params
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      OR: [
        { classroom: { teacherId: user.id } },
        {
          classroom: {
            enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
          },
        },
      ],
    },
    include: {
      classroom: { select: { id: true, name: true, subject: true } },
      reading: { include: { passages: { orderBy: { ordinal: "asc" } } } },
      signatures: true,
      _count: { select: { attempts: true } },
    },
  })
  if (!assignment) return fail("NOT_FOUND", "Assignment not found.", 404)
  if (user.role === Role.STUDENT && assignment.status !== "PUBLISHED")
    return fail("NOT_FOUND", "Assignment not found.", 404)
  return ok(assignment)
}
