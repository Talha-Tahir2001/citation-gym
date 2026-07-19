import { Role } from "@/app/generated/prisma/client"
import { fail, ok, requireUser, string } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { ensureWorkspace } from "@/lib/workspace"

export async function GET() {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  await ensureWorkspace(user)
  const classrooms =
    user.role === Role.TEACHER
      ? await prisma.classroom.findMany({
          where: { teacherId: user.id, archivedAt: null },
          include: {
            _count: { select: { enrollments: true, assignments: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.classroom.findMany({
          where: {
            enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
            archivedAt: null,
          },
          include: {
            _count: { select: { enrollments: true, assignments: true } },
          },
        })
  return ok(classrooms)
}

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  if (user.role !== Role.TEACHER)
    return fail("FORBIDDEN", "Only teachers can create classes.", 403)
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  const name = string(body?.name)
  if (!name) return fail("INVALID_REQUEST", "A class name is required.")
  const workspace = await ensureWorkspace(user)
  const classroom = await prisma.classroom.create({
    data: {
      organizationId: workspace.organization.id,
      teacherId: user.id,
      name,
      subject: string(body?.subject) || null,
      joinCode: `CG-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    },
  })
  return ok(classroom, 201)
}
