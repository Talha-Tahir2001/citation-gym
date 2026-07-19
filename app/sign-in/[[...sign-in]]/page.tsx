import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-secondary p-6">
      <SignIn forceRedirectUrl="/app" />
    </main>
  )
}
