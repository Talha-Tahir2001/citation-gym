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
    where: { id: attemptId, studentId: user.id, status: "RETURNED" },
    include: { versions: { orderBy: { number: "desc" }, take: 1 } },
  })
  if (!attempt) return fail("NOT_FOUND", "Returned attempt not found.", 404)
  const latest = attempt.versions[0]
  const version = await prisma.$transaction(async (tx) => {
    const created = await tx.attemptVersion.create({
      data: {
        attemptId,
        number: latest.number + 1,
        claimText: latest.claimText,
        reflectionText: latest.reflectionText,
        evidenceLinks: {
          create: await tx.evidenceLink.findMany({
            where: { attemptVersionId: latest.id },
            select: { passageId: true, explanation: true, position: true },
          }),
        },
      },
    })
    await tx.attempt.update({
      where: { id: attemptId },
      data: { status: "DRAFT", currentVersion: created.number },
    })
    return created
  })
  return ok(version, 201)
}
