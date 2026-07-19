import { SignUp } from "@clerk/nextjs"

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const redirectUrl =
    role === "teacher" || role === "student"
      ? `/app/select-role?role=${role}`
      : "/app/select-role"
  return (
    <main className="grid min-h-screen place-items-center bg-secondary p-6">
      <SignUp forceRedirectUrl={redirectUrl} />
    </main>
  )
}
