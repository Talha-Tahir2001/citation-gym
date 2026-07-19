import "server-only"

import { currentUser } from "@clerk/nextjs/server"

import { Role } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ensureWorkspace } from "@/lib/workspace"

export async function getCurrentAppUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (!email)
    throw new Error("A primary email address is required to use Citation Gym.")

  const metadataRole =
    clerkUser.publicMetadata.role === "TEACHER"
      ? Role.TEACHER
      : clerkUser.publicMetadata.role === "STUDENT"
        ? Role.STUDENT
        : undefined
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null

  // Email is the stable identity bridge here. A Clerk account can be recreated
  // during development, which changes its Clerk ID but not its verified email.
  const appUser = await prisma.user.upsert({
    where: { email },
    create: {
      clerkId: clerkUser.id,
      email,
      displayName,
      imageUrl: clerkUser.imageUrl,
      role: metadataRole ?? Role.STUDENT,
    },
    update: {
      clerkId: clerkUser.id,
      displayName,
      imageUrl: clerkUser.imageUrl,
      ...(metadataRole ? { role: metadataRole } : {}),
    },
  })
  await ensureWorkspace(appUser)
  return appUser
}
