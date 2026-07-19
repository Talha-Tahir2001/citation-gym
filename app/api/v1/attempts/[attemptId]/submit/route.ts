import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const { attemptId } = await context.params
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, studentId: user.id },
    include: { versions: { orderBy: { number: "desc" }, take: 1 } },
  })
  if (!attempt) return fail("NOT_FOUND", "Attempt not found.", 404)
  const version = attempt.versions[0]
  const evidenceCount = await prisma.evidenceLink.count({
    where: { attemptVersionId: version.id },
  })
  if (!version.claimText || evidenceCount === 0)
    return fail(
      "INCOMPLETE_ATTEMPT",
      "Add a claim and at least one evidence explanation before submitting."
    )
  const submitted = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      currentVersion: version.number,
    },
  })
  await prisma.auditEvent.create({
    data: {
      actorId: user.id,
      type: "ATTEMPT_SUBMITTED",
      targetType: "Attempt",
      targetId: attemptId,
      metadata: { version: version.number },
    },
  })
  return ok(submitted)
}
