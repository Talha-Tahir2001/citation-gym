import "server-only"

import { auth } from "@clerk/nextjs/server"

import { getCurrentAppUser } from "@/lib/current-app-user"

export const ok = <T>(data: T, status = 200) =>
  Response.json({ data }, { status })
export const fail = (code: string, message: string, status = 400) =>
  Response.json({ data: null, error: { code, message } }, { status })

export async function requireUser() {
  const { userId } = await auth()
  if (!userId) return null
  return getCurrentAppUser()
}

export function string(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}
