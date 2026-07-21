import { fail, ok, requireUser } from "@/lib/api"
import { prisma } from "@/lib/prisma"

const signatures = {
  UNSUPPORTED_INFERENCE: {
    label: "Inference presented as fact",
    definition:
      "The claim goes beyond what the cited passage directly supports.",
  },
  QUOTE_DUMP: {
    label: "Evidence needs explanation",
    definition:
      "Evidence is selected without explaining how it supports the claim.",
  },
  OVERBROAD_CLAIM: {
    label: "Claim is too broad",
    definition:
      "The claim needs to be narrowed to match the available evidence.",
  },
  COUNTEREVIDENCE_IGNORED: {
    label: "Counterevidence is missing",
    definition:
      "The reasoning should account for relevant limits or competing evidence.",
  },
  SOURCE_MISREAD: {
    label: "Source meaning was misread",
    definition:
      "The explanation does not accurately represent the cited passage.",
  },
} as const

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
  const sourceSet = attempt.assignment.reading.passages
    .map((passage) => `[${passage.id}] ${passage.text}`)
    .join("\n\n")
  const startedAt = Date.now()
  const response = await fetch(
    `${process.env.AIMLAPI_BASE_URL ?? "https://api.aimlapi.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Citation Gym's source-grounded writing coach. Use only assigned passages; never rewrite the answer or add facts. Return valid JSON: signature (UNSUPPORTED_INFERENCE|QUOTE_DUMP|OVERBROAD_CLAIM|COUNTEREVIDENCE_IGNORED|SOURCE_MISREAD|NONE), sourcePassageIds (string[]), feedback (one short sentence), nextAction (exactly one specific action).",
          },
          {
            role: "user",
            content: `Passages:\n${sourceSet}\n\nClaim:\n${version.claimText}\n\nConnections:\n${version.evidenceLinks.map((link) => `[${link.passageId}] ${link.explanation}`).join("\n")}`,
          },
        ],
      }),
    }
  )
  if (!response.ok)
    return fail(
      "AI_PROVIDER_ERROR",
      "The coaching provider could not complete this request.",
      502
    )
  const completion = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = completion.choices?.[0]?.message?.content
  if (!content)
    return fail(
      "INVALID_AI_RESPONSE",
      "The coaching provider returned an empty response.",
      502
    )
  try {
    const raw = JSON.parse(content) as Record<string, unknown>
    const signatureKey =
      typeof raw.signature === "string" && raw.signature in signatures
        ? (raw.signature as keyof typeof signatures)
        : "NONE"
    const result = {
      signature: signatureKey,
      sourcePassageIds: Array.isArray(raw.sourcePassageIds)
        ? raw.sourcePassageIds.filter(
            (id): id is string =>
              typeof id === "string" &&
              attempt.assignment.reading.passages.some(
                (passage) => passage.id === id
              )
          )
        : [],
      feedback:
        typeof raw.feedback === "string" && raw.feedback.trim()
          ? raw.feedback.trim().slice(0, 500)
          : "Check that your claim says only what your selected evidence supports.",
      nextAction:
        typeof raw.nextAction === "string" && raw.nextAction.trim()
          ? raw.nextAction.trim().slice(0, 300)
          : "Revise one sentence to make the evidence-to-claim connection explicit.",
    }
    const feedback = await prisma.coachFeedback.create({
      data: {
        attemptVersionId: version.id,
        model,
        promptVersion: "v1",
        resultJson: result as never,
        status: "COMPLETE",
        latencyMs: Date.now() - startedAt,
      },
    })
    if (signatureKey !== "NONE") {
      const definition = signatures[signatureKey]
      const signature = await prisma.reasoningSignature.upsert({
        where: {
          assignmentId_key: {
            assignmentId: attempt.assignment.id,
            key: signatureKey,
          },
        },
        create: {
          assignmentId: attempt.assignment.id,
          key: signatureKey,
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
