import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowLeft, IconUsers } from "@tabler/icons-react"
import { Role } from "@/app/generated/prisma/client"
import { Button } from "@/components/ui/button"
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
    include: { _count: { select: { feedback: true } } },
  })
  if (!signature) notFound()
  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/app/teacher/assignments/${assignmentId}`} />}
      >
        <IconArrowLeft data-icon="inline-start" /> Assignment
      </Button>
      <section className="mt-5 rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          REASONING SIGNATURE
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">
          {signature.label}
        </h1>
        <p className="mt-3 text-muted-foreground">{signature.definition}</p>
        <div className="mt-6 rounded-xl bg-secondary p-4">
          <IconUsers className="text-primary" />
          <p className="mt-3 text-2xl font-bold">
            {signature._count.feedback} feedback matches
          </p>
          <p className="text-sm text-muted-foreground">
            recorded for this pattern
          </p>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Student-level links will appear here as feedback signatures are
          generated.
        </p>
      </section>
    </div>
  )
}
