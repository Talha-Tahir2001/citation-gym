import { fail, ok, requireUser } from "@/lib/api"
import { coachSignatures, runAgenticCoach } from "@/lib/agentic-coach"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  const body = (await request.json().catch(() => null)) as {
    attemptId?: string
  } | null
  if (!body?.attemptId)
    return fail("INVALID_REQUEST", "An attempt ID is required.")
  const attempt = await prisma.attempt.findFirst({
    where: { id: body.attemptId, studentId: user.id },
    include: {
      assignment: {
        include: {
          reading: { include: { passages: { orderBy: { ordinal: "asc" } } } },
          signatures: true,
        },
      },
      versions: {
        include: { evidenceLinks: { include: { passage: true } } },
        orderBy: { number: "desc" },
        take: 1,
      },
    },
  })
  if (!attempt) return fail("NOT_FOUND", "Attempt not found.", 404)
  const version = attempt.versions[0]
  if (!version?.claimText || version.evidenceLinks.length === 0)
    return fail(
      "INCOMPLETE_ATTEMPT",
      "Add a claim and one evidence explanation before coaching."
    )
  const apiKey = process.env.AIMLAPI_KEY
  const model = process.env.AIMLAPI_MODEL
  if (!apiKey || !model)
    return fail(
      "AI_NOT_CONFIGURED",
      "Set AIMLAPI_KEY and AIMLAPI_MODEL on the server.",
      503
    )
  const startedAt = Date.now()
  try {
    const result = await runAgenticCoach({
      apiKey,
      baseUrl: process.env.AIMLAPI_BASE_URL ?? "https://api.aimlapi.com/v1",
      model,
      claimText: version.claimText,
      passages: attempt.assignment.reading.passages,
      evidence: version.evidenceLinks.map((link) => ({
        passageId: link.passageId,
        explanation: link.explanation,
      })),
    })
    const feedback = await prisma.coachFeedback.create({
      data: {
        attemptVersionId: version.id,
        model,
        promptVersion: "agentic-v2",
        resultJson: result as never,
        status: "COMPLETE",
        latencyMs: Date.now() - startedAt,
      },
    })
    if (result.signature !== "NONE") {
      const definition = coachSignatures[result.signature]
      const signature = await prisma.reasoningSignature.upsert({
        where: {
          assignmentId_key: {
            assignmentId: attempt.assignment.id,
            key: result.signature,
          },
        },
        create: {
          assignmentId: attempt.assignment.id,
          key: result.signature,
          label: definition.label,
          definition: definition.definition,
        },
        update: { label: definition.label, definition: definition.definition },
      })
      await prisma.feedbackSignature.create({
        data: {
          feedbackId: feedback.id,
          signatureId: signature.id,
          confidence: 0.8,
        },
      })
    }
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        type: "COACH_FEEDBACK_CREATED",
        targetType: "CoachFeedback",
        targetId: feedback.id,
        metadata: {
          workflow: "agentic-coach-v1",
          nodes: [
            "verify_evidence",
            "evaluate_alignment",
            "coach",
            "ground_feedback",
          ],
        },
      },
    })
    return ok({
      feedback: result,
      id: feedback.id,
      model,
      latencyMs: feedback.latencyMs,
    })
  } catch {
    return fail(
      "INVALID_AI_RESPONSE",
      "The coaching provider returned an invalid response.",
      502
    )
  }
}
