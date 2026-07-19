"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBook2,
  IconClipboardText,
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const teacherItems = [
  { href: "/app", label: "Overview", icon: IconLayoutDashboard },
  { href: "/app/teacher/classes", label: "Classes", icon: IconUsers },
  {
    href: "/app/teacher/assignments",
    label: "Assignments",
    icon: IconClipboardText,
  },
]

const studentItems = [
  { href: "/app", label: "Overview", icon: IconLayoutDashboard },
  { href: "/app/student/classes", label: "My classes", icon: IconUsers },
  { href: "/app/student/assignments", label: "Assignments", icon: IconBook2 },
]

type AppRole = "TEACHER" | "STUDENT" | "ADMIN"

export function AppSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname()
  const items = role === "TEACHER" ? teacherItems : studentItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/app" />}
              tooltip="Citation Gym"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-heading font-bold text-primary-foreground">
                C
              </span>
              <span className="truncate font-heading font-bold group-data-[collapsible=icon]:hidden">
                Citation Gym
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role === "TEACHER" ? "Teaching" : "Learning"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={
                      pathname === href ||
                      (href !== "/app" && pathname.startsWith(`${href}/`))
                    }
                    render={<Link href={href} />}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/app/settings/profile" />}
              tooltip="Settings"
            >
              <IconSettings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
