import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { AppNavbar } from "@/components/app-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentAppUser } from "@/lib/current-app-user"

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const user = await getCurrentAppUser()
  if (!user) redirect("/sign-in")

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} />
      <SidebarInset>
        <AppNavbar />
        <div className="mx-auto max-w-7xl p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
