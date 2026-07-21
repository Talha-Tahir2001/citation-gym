import "server-only"

import { ChatOpenAI } from "@langchain/openai"
import { Annotation, END, START, StateGraph } from "@langchain/langgraph"
import { z } from "zod"

export const coachSignatures = {
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

export type CoachSignature = keyof typeof coachSignatures | "NONE"

export type AgenticCoachInput = {
  apiKey: string
  baseUrl: string
  model: string
  claimText: string
  passages: { id: string; text: string }[]
  evidence: { passageId: string; explanation: string }[]
}

export type AgenticCoachFeedback = {
  signature: CoachSignature
  sourcePassageIds: string[]
  alignmentSummary: string
  feedback: string
  nextAction: string
}

const CoachState = Annotation.Root({
  input: Annotation<AgenticCoachInput>,
  citedPassageIds: Annotation<string[]>,
  evidenceBrief: Annotation<string>,
  rawAlignment: Annotation<string>,
  alignmentSummary: Annotation<string>,
  rawResponse: Annotation<string>,
  feedback: Annotation<AgenticCoachFeedback>,
})

const modelFeedbackSchema = z.object({
  signature: z.string().optional(),
  sourcePassageIds: z.array(z.string()).optional(),
  feedback: z.string().optional(),
  nextAction: z.string().optional(),
})

const alignmentSchema = z.object({
  alignmentSummary: z.string().optional(),
})

function messageText(content: unknown) {
  if (typeof content === "string") return content
  if (Array.isArray(content))
    return content
      .map((part) =>
        typeof part === "object" && part && "text" in part
          ? String(part.text)
          : ""
      )
      .join("")
  return ""
}

function parseJsonResponse(value: string) {
  const normalized = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
  return JSON.parse(normalized) as unknown
}

function createModel(input: AgenticCoachInput) {
  return new ChatOpenAI({
    apiKey: input.apiKey,
    model: input.model,
    temperature: 0.2,
    maxRetries: 1,
    configuration: { baseURL: input.baseUrl },
  })
}

function createCoachGraph() {
  return new StateGraph(CoachState)
    .addNode("verify_evidence", (state) => {
      const citedPassageIds = [
        ...new Set(
          state.input.evidence
            .filter((item) =>
              state.input.passages.some((passage) => passage.id === item.passageId)
            )
            .map((item) => item.passageId)
        ),
      ]
      const evidenceBrief = state.input.evidence
        .filter((item) => citedPassageIds.includes(item.passageId))
        .map((item) => `[${item.passageId}] ${item.explanation}`)
        .join("\n")

      if (!citedPassageIds.length || !evidenceBrief.trim())
        throw new Error("No valid evidence is available for coaching.")

      return { citedPassageIds, evidenceBrief }
    })
    .addNode("evaluate_alignment", async (state) => {
      const passages = state.input.passages
        .filter((passage) => state.citedPassageIds.includes(passage.id))
        .map((passage) => `[${passage.id}] ${passage.text}`)
        .join("\n\n")
      const completion = await createModel(state.input).invoke([
        {
          role: "system",
          content:
            "You evaluate whether a student's claim is supported by their selected passages. Use only those passages and do not grade the student. Respond with JSON only in this exact shape: {\"alignmentSummary\":\"one concise, plain-language sentence explaining the support or the specific gap\"}.",
        },
        {
          role: "user",
          content: `Selected passages:\n${passages}\n\nStudent claim:\n${state.input.claimText}\n\nStudent evidence explanations:\n${state.evidenceBrief}`,
        },
      ])
      const rawAlignment = messageText(completion.content)
      if (!rawAlignment.trim())
        throw new Error("The alignment evaluator returned an empty response.")
      const alignment = alignmentSchema.parse(parseJsonResponse(rawAlignment))
      const alignmentSummary = alignment.alignmentSummary?.trim().slice(0, 500)
      if (!alignmentSummary)
        throw new Error("The alignment evaluator returned an invalid response.")
      return { rawAlignment, alignmentSummary }
    })
    .addNode("coach", async (state) => {
      const passages = state.input.passages
        .map((passage) => `[${passage.id}] ${passage.text}`)
        .join("\n\n")
      const completion = await createModel(state.input).invoke([
        {
          role: "system",
          content:
            "You are Citation Gym's source-grounded writing coach. Use only assigned passages. Never rewrite the student's answer or introduce facts. Give concise, constructive feedback. Respond with JSON only, using this exact shape: {\"signature\":\"UNSUPPORTED_INFERENCE|QUOTE_DUMP|OVERBROAD_CLAIM|COUNTEREVIDENCE_IGNORED|SOURCE_MISREAD|NONE\",\"sourcePassageIds\":[\"...\"],\"feedback\":\"one short sentence\",\"nextAction\":\"one specific action\"}.",
        },
        {
          role: "user",
          content: `Assigned passages:\n${passages}\n\nStudent claim:\n${state.input.claimText}\n\nStudent evidence explanations:\n${state.evidenceBrief}\n\nEvidence-alignment evaluation:\n${state.alignmentSummary}`,
        },
      ])
      const rawResponse = messageText(completion.content)
      if (!rawResponse.trim()) throw new Error("The provider returned an empty response.")
      return { rawResponse }
    })
    .addNode("ground_feedback", (state) => {
      const raw = modelFeedbackSchema.parse(parseJsonResponse(state.rawResponse))
      const validIds = new Set(state.citedPassageIds)
      const signature =
        raw.signature && raw.signature in coachSignatures
          ? (raw.signature as keyof typeof coachSignatures)
          : "NONE"
      return {
        feedback: {
          signature,
          sourcePassageIds: (raw.sourcePassageIds ?? []).filter((id) =>
            validIds.has(id)
          ),
          alignmentSummary: state.alignmentSummary,
          feedback:
            raw.feedback?.trim().slice(0, 500) ||
            "Check that your claim says only what your selected evidence supports.",
          nextAction:
            raw.nextAction?.trim().slice(0, 300) ||
            "Revise one sentence to make the evidence-to-claim connection explicit.",
        },
      }
    })
    .addEdge(START, "verify_evidence")
    .addEdge("verify_evidence", "evaluate_alignment")
    .addEdge("evaluate_alignment", "coach")
    .addEdge("coach", "ground_feedback")
    .addEdge("ground_feedback", END)
    .compile()
}

export async function runAgenticCoach(input: AgenticCoachInput) {
  const result = await createCoachGraph().invoke({ input })
  return result.feedback
}
