import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { classId } = await context.params
  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classId,
      OR: [
        { teacherId: user.id },
        { enrollments: { some: { studentId: user.id, status: "ACTIVE" } } },
      ],
    },
    include: {
      enrollments: {
        include: {
          student: { select: { id: true, displayName: true, email: true } },
        },
      },
      assignments: {
        include: { _count: { select: { attempts: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  return classroom
    ? ok(classroom)
    : fail("NOT_FOUND", "Classroom not found.", 404)
}
