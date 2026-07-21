import { Role, TeacherReviewAction } from "@/app/generated/prisma/client"
import { fail, ok, requireUser, string } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  const user = await requireUser()
  if (!user) return fail("UNAUTHORIZED", "Sign in required.", 401)
  if (user.role !== Role.TEACHER)
    return fail("FORBIDDEN", "Only teachers can review work.", 403)
  const { attemptId } = await context.params
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  const action =
    body?.action === "RETURNED"
      ? TeacherReviewAction.RETURNED
      : body?.action === "REVIEWED"
        ? TeacherReviewAction.REVIEWED
        : null
  const note = string(body?.note)
  if (!action) return fail("INVALID_REQUEST", "Choose a review action.")
  if (action === "RETURNED" && !note)
    return fail("INVALID_REQUEST", "A return note is required.")
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, assignment: { classroom: { teacherId: user.id } } },
    include: { versions: { orderBy: { number: "desc" }, take: 1 } },
  })
  if (!attempt) return fail("NOT_FOUND", "Attempt not found.", 404)
  const version = attempt.versions[0]
  const status =
    action === TeacherReviewAction.RETURNED ? "RETURNED" : "REVIEWED"
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.teacherReview.create({
      data: {
        attemptId,
        attemptVersionId: version.id,
        teacherId: user.id,
        action,
        note: note || null,
      },
    })
    await tx.attempt.update({ where: { id: attemptId }, data: { status } })
    return created
  })
  return ok(review)
}
