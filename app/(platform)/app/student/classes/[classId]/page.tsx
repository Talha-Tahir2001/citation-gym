import Link from "next/link"
import { IconArrowRight, IconBook2, IconUsers } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export default function StudentClassPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm font-bold tracking-[.14em] text-primary">
          ECOLOGY &amp; EQUITY
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
          English 10 · Period 3
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ms. Rivera’s class · 24 classmates
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <IconBook2 className="text-primary" />
          <p className="mt-5 text-2xl font-bold">1</p>
          <p className="text-sm text-muted-foreground">Published assignment</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <IconUsers className="text-primary" />
          <p className="mt-5 text-2xl font-bold">24</p>
          <p className="text-sm text-muted-foreground">Active learners</p>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-6">
        <p className="text-sm font-bold text-primary">CURRENT ASSIGNMENT</p>
        <h2 className="mt-2 font-heading text-2xl font-bold">
          Who gets to live in a cooler city?
        </h2>
        <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
          Select evidence from the source set and build an argument about
          equitable heat safety.
        </p>
        <Button
          className="mt-5"
          nativeButton={false}
          render={<Link href="/app/student" />}
        >
          View assignment <IconArrowRight data-icon="inline-end" />
        </Button>
      </section>
    </div>
  )
}
