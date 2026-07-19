"use client"

import Link from "next/link"
import React from "react"
import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

type Crumb = { label: string; href?: string }

function getBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 1) return []

  if (segments[1] === "student") {
    const crumbs: Crumb[] = [{ label: "Learning", href: "/app/student" }]
    if (segments[2] === "classes")
      crumbs.push({ label: segments[3] ? "Class" : "My classes" })
    if (segments[2] === "assignments")
      crumbs.push({ label: segments[3] ? "Assignment" : "Assignments" })
    if (segments[2] === "attempts") {
      crumbs.push(
        {
          label: "Assignment",
          href: "/app/student/assignments",
        },
        { label: segments[4] === "review" ? "Review" : "Reasoning studio" }
      )
    }
    return crumbs
  }

  if (segments[1] === "teacher") {
    const crumbs: Crumb[] = [{ label: "Teaching", href: "/app/teacher" }]
    if (segments[2] === "classes")
      crumbs.push({
        label:
          segments[3] === "new"
            ? "New class"
            : segments[3]
              ? "Class"
              : "Classes",
      })
    if (segments[2] === "assignments") {
      crumbs.push({
        label: segments[3] ? "Assignment" : "Assignments",
        href: "/app/teacher/assignments",
      })
      if (segments[4] === "submissions")
        crumbs.push({ label: "Submission review" })
      if (segments[4] === "insights")
        crumbs.push({ label: "Reasoning insight" })
    }
    return crumbs
  }

  return [
    { label: "Settings", href: "/app/settings/profile" },
    {
      label: segments[2]
        ? segments[2].charAt(0).toUpperCase() + segments[2].slice(1)
        : "Settings",
    },
  ]
}

export function AppNavbar() {
  const breadcrumbs = getBreadcrumbs(usePathname())

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <Link href="/app" className="font-heading font-bold md:hidden">
          Citation Gym
        </Link>
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden min-w-0 md:block">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden lg:inline-flex">
                <BreadcrumbLink render={<Link href="/app" />}>
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden lg:inline-flex" />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem
                    className={
                      index < breadcrumbs.length - 1
                        ? "hidden lg:inline-flex"
                        : "min-w-0"
                    }
                  >
                    {crumb.href && index < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink render={<Link href={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="block truncate">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden lg:inline-flex" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}
