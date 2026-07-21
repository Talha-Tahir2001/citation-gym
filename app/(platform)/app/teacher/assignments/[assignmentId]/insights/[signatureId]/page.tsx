import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowLeft, IconArrowRight, IconUsers } from "@tabler/icons-react"
import { Role } from "@/app/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentAppUser } from "@/lib/current-app-user"
import { prisma } from "@/lib/prisma"

export default async function TeacherInsightPage({
  params,
}: {
  params: Promise<{ assignmentId: string; signatureId: string }>
}) {
  const user = await getCurrentAppUser()
  if (!user || user.role !== Role.TEACHER) redirect("/app")
  const { assignmentId, signatureId } = await params
  const signature = await prisma.reasoningSignature.findFirst({
    where: {
      id: signatureId,
      assignmentId,
      assignment: { classroom: { teacherId: user.id } },
    },
    include: {
      feedback: {
        orderBy: { feedback: { createdAt: "desc" } },
        include: {
          feedback: {
            include: {
              attemptVersion: {
                include: {
                  attempt: {
                    include: {
                      student: { select: { displayName: true, email: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!signature) notFound()
  const latestByStudent = new Map<string, (typeof signature.feedback)[number]>()
  for (const match of signature.feedback) {
    const attempt = match.feedback.attemptVersion.attempt
    if (!latestByStudent.has(attempt.studentId))
      latestByStudent.set(attempt.studentId, match)
  }
  const affectedStudents = [...latestByStudent.values()]
  const readResult = (value: unknown) => {
    if (!value || typeof value !== "object") return {}
    const result = value as Record<string, unknown>
    return {
      alignmentSummary:
        typeof result.alignmentSummary === "string"
          ? result.alignmentSummary
          : null,
      feedback: typeof result.feedback === "string" ? result.feedback : null,
    }
  }
  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/app/teacher/assignments/${assignmentId}`} />}
      >
        <IconArrowLeft data-icon="inline-start" /> Assignment
      </Button>
      <Card className="mt-5">
        <CardHeader>
          <CardDescription>Reasoning signature</CardDescription>
          <CardTitle className="text-3xl">{signature.label}</CardTitle>
          <CardDescription>{signature.definition}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 rounded-xl bg-secondary py-4">
          <IconUsers className="text-primary" />
          <div>
            <p className="text-2xl font-bold">{affectedStudents.length}</p>
            <p className="text-sm text-muted-foreground">affected students</p>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Affected student work</CardTitle>
          <CardDescription>
            The most recent coaching match for each student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y">
            {affectedStudents.map((match) => {
              const attempt = match.feedback.attemptVersion.attempt
              const result = readResult(match.feedback.resultJson)
              return (
                <Link
                  key={attempt.studentId}
                  href={`/app/teacher/assignments/${assignmentId}/submissions/${attempt.id}`}
                  className="flex flex-col gap-3 py-4 hover:bg-muted sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {attempt.student.displayName ?? attempt.student.email}
                      </p>
                      <Badge variant="secondary">
                        {attempt.status.toLowerCase()}
                      </Badge>
                      <Badge variant="outline">
                        Version {match.feedback.attemptVersion.number}
                      </Badge>
                    </div>
                    {result.alignmentSummary ? (
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Alignment:</strong>{" "}
                        {result.alignmentSummary}
                      </p>
                    ) : null}
                    {result.feedback ? (
                      <p className="text-sm text-muted-foreground">
                        {result.feedback}
                      </p>
                    ) : null}
                  </div>
                  <IconArrowRight className="text-muted-foreground" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
