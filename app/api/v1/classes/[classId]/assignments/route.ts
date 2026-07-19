import { AssignmentStatus, Role } from "@/app/generated/prisma/client"
import { fail, ok, requireUser, string } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { classId } = await context.params
  const assignments = await prisma.assignment.findMany({
    where: {
      classroomId: classId,
      ...(user.role === Role.STUDENT
        ? {
            status: AssignmentStatus.PUBLISHED,
            classroom: {
              enrollments: { some: { studentId: user.id, status: "ACTIVE" } },
            },
          }
        : { classroom: { teacherId: user.id } }),
    },
    include: {
      reading: { select: { title: true } },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return ok(assignments)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { classId } = await context.params
  const classroom = await prisma.classroom.findFirst({
    where: { id: classId, teacherId: user.id },
  })
  if (!classroom)
    return fail(
      "FORBIDDEN",
      "Only the class teacher can create assignments.",
      403
    )
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  const title = string(body?.title)
  const prompt = string(body?.prompt)
  const readingBody = string(body?.readingBody)
  if (!title || !prompt || !readingBody)
    return fail(
      "INVALID_REQUEST",
      "Title, prompt, and reading text are required."
    )
  const reading = await prisma.reading.create({
    data: {
      organizationId: classroom.organizationId,
      title,
      body: readingBody,
      createdById: user.id,
      passages: {
        create: readingBody
          .split(/\n\n+/)
          .filter(Boolean)
          .map((text, index) => ({
            ordinal: index + 1,
            startOffset: 0,
            endOffset: text.length,
            text,
            label: `Passage ${index + 1}`,
          })),
      },
    },
  })
  const assignment = await prisma.assignment.create({
    data: {
      classroomId: classId,
      readingId: reading.id,
      title,
      prompt,
      status: body?.publish
        ? AssignmentStatus.PUBLISHED
        : AssignmentStatus.DRAFT,
    },
  })
  return ok(assignment, 201)
}
