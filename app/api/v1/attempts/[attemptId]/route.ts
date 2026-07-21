import { fail, ok, requireUser, string } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { attemptId } = await context.params
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      OR: [
        { studentId: user.id },
        { assignment: { classroom: { teacherId: user.id } } },
      ],
    },
    include: {
      assignment: {
        include: {
          reading: { include: { passages: { orderBy: { ordinal: "asc" } } } },
        },
      },
      student: { select: { displayName: true, email: true } },
      versions: {
        include: {
          evidenceLinks: {
            include: { passage: true },
            orderBy: { position: "asc" },
          },
          coachFeedback: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { number: "desc" },
      },
      teacherReviews: {
        where: { action: "RETURNED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
  return attempt ? ok(attempt) : fail("NOT_FOUND", "Attempt not found.", 404)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { attemptId } = await context.params
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      studentId: user.id,
      status: { in: ["DRAFT", "RETURNED", "RESUBMITTED"] },
    },
    include: { versions: { orderBy: { number: "desc" }, take: 1 } },
  })
  if (!attempt) return fail("NOT_FOUND", "Editable attempt not found.", 404)
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  const claimText = string(body?.claimText)
  const reflectionText = string(body?.reflectionText)
  const evidence = Array.isArray(body?.evidence) ? body.evidence : []
  const latest = attempt.versions[0]
  const version = await prisma.$transaction(async (tx) => {
    const updated = await tx.attemptVersion.update({
      where: { id: latest.id },
      data: {
        claimText: claimText || null,
        reflectionText: reflectionText || null,
      },
    })
    if (evidence.length) {
      await tx.evidenceLink.deleteMany({
        where: { attemptVersionId: latest.id },
      })
      await tx.evidenceLink.createMany({
        data: evidence
          .map((item, position) => {
            const link = item as Record<string, unknown>
            return {
              attemptVersionId: latest.id,
              passageId: string(link.passageId),
              explanation: string(link.explanation),
              position,
            }
          })
          .filter((link) => link.passageId && link.explanation),
      })
    }
    return updated
  })
  return ok(version)
}
