import "server-only"

import { type User } from "@/app/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function ensureWorkspace(user: User) {
  const slug = `workspace-${user.id}`
  const organization = await prisma.organization.upsert({
    where: { slug },
    create: { name: "My school workspace", slug },
    update: {},
  })
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
    },
    update: { role: user.role },
  })
  return { organization }
}
