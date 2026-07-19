"use client"

import { useState } from "react"
import { Show, UserButton } from "@clerk/nextjs"
import {
  IconArrowRight,
  IconBolt,
  IconBook2,
  IconCheck,
  IconChevronDown,
  IconSparkle,
  IconQuote,
  IconSparkles,
  IconTargetArrow,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features: [typeof IconTargetArrow, string, string][] = [
  [
    IconTargetArrow,
    "Build evidence habits",
    "Students collect, test, and connect the strongest details before they write.",
  ],
  [
    IconSparkle,
    "Feedback that teaches",
    "A source-grounded coach prompts the next move instead of simply giving an answer.",
  ],
  [
    IconBolt,
    "See reasoning in motion",
    "Teachers spot patterns early and turn them into the right five-minute mini-lesson.",
  ],
]
const questions = [
  [
    "Does Citation Gym replace the teacher?",
    "No. It makes students' thinking visible so teachers can spend their time on the interventions that matter.",
  ],
  [
    "What ages is it designed for?",
    "The experience is designed for middle and high school argument writing, with flexible prompts and source sets.",
  ],
  [
    "Is student work protected?",
    "Yes. Student work stays in your school workspace and AI feedback is constrained to the assigned sources.",
  ],
]

export default function Home() {
  const [openQuestion, setOpenQuestion] = useState(0)
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-152 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_82%),transparent_48%)]" />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <IconQuote />
          </span>
          Citation Gym
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link className="hover:text-foreground" href="/sign-up?role=student">
            For students
          </Link>
          <Link className="hover:text-foreground" href="/sign-up?role=teacher">
            For teachers
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Show when="signed-out">
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Sign in
            </Button>
            <Button nativeButton={false} render={<Link href="/sign-up" />}>
              Get started <IconArrowRight data-icon="inline-end" />
            </Button>
          </Show>
          <Show when="signed-in">
            <Button nativeButton={false} render={<Link href="/app" />}>
              Open workspace <IconArrowRight data-icon="inline-end" />
            </Button>
            <UserButton />
          </Show>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 pb-24 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-24 lg:pb-32">
        <div className="flex flex-col items-start gap-7">
          <div className="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
            <IconSparkles className="text-primary" />
            Evidence-first writing practice
          </div>
          <h1 className="max-w-3xl font-heading text-5xl leading-[.96] font-bold tracking-tighter text-balance sm:text-7xl">
            Strong arguments start with{" "}
            <span className="text-primary">stronger thinking.</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Citation Gym helps students turn reading into evidence-backed
            arguments—while giving teachers a clear view of the reasoning behind
            every sentence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Try the writing gym <IconArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/sign-up?role=teacher" />}
            >
              Explore teacher view
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <span className="grid size-8 place-items-center rounded-full border-2 border-background bg-chart-2 text-xs font-bold text-background">
                AM
              </span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-background bg-chart-3 text-xs font-bold text-background">
                JL
              </span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-background bg-chart-1 text-xs font-bold text-background">
                SC
              </span>
            </div>
            Built for curious classrooms
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl rounded-3xl border bg-card p-3 shadow-2xl shadow-primary/10">
          <div className="rounded-2xl bg-secondary p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[.16em] text-muted-foreground">
                ECOLOGY &amp; EQUITY · UNIT 03
              </span>
              <span className="rounded-full bg-background px-2 py-1 text-xs font-medium">
                Step 3 of 4
              </span>
            </div>
            <h2 className="mt-6 font-heading text-2xl font-bold">
              Make your case.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              How should cities use tree planting to make heat safety more
              equitable?
            </p>
            <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold tracking-[.12em] text-muted-foreground">
                <span>YOUR EVIDENCE</span>
                <span className="text-foreground">2 selected</span>
              </div>
              <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-6">
                “Cities with more tree canopy can be several degrees cooler than
                nearby paved areas.”
              </p>
              <p className="mt-3 border-l-2 border-primary pl-3 text-sm leading-6">
                “Low-income neighborhoods often have fewer nearby parks and less
                tree cover.”
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-primary/35 bg-primary/10 p-4">
              <div className="flex gap-3">
                <IconSparkles className="shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold tracking-[.12em] text-muted-foreground">
                    SOURCE-GROUNDED COACH
                  </p>
                  <p className="mt-1 text-sm leading-6 font-medium">
                    You found a powerful contrast. Can you explain who benefits
                    when a city prioritizes low-canopy neighborhoods?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border bg-card p-4 shadow-xl sm:block">
            <p className="text-2xl font-bold">71%</p>
            <p className="text-xs text-muted-foreground">Evidence alignment</p>
            <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[71%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </section>
      <section className="border-y bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-[.16em] text-primary">
              THE PRACTICE LOOP
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Practice the moves that make an argument hold up.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(([Icon, title, text], index) => (
              <article
                key={title as string}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Icon />
                </span>
                <p className="mt-8 text-sm font-bold text-muted-foreground">
                  0{index + 1}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.14em] text-muted-foreground">
                CLASS PULSE
              </p>
              <h3 className="mt-1 font-heading text-2xl font-bold">
                Where reasoning needs a lift
              </h3>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold">
              24 active
            </span>
          </div>
          <div className="mt-7 flex flex-col gap-5">
            {[
              ["Evidence selected", 92],
              ["Evidence explained", 71],
              ["Claim is specific", 63],
              ["Inference supported", 48],
            ].map(([label, score]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <strong>{score}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex gap-3 rounded-xl bg-secondary p-4">
            <IconSparkles className="shrink-0 text-primary" />
            <p className="text-sm leading-6">
              <strong>Suggested mini-lesson:</strong> Model the difference
              between what a source says and what it makes a reader infer.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold tracking-[.16em] text-primary">
            FOR TEACHERS
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Know what to teach next—before the draft is due.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Citation Gym gathers the small decisions that shape student writing,
            then turns them into an at-a-glance instructional plan.
          </p>
          <ul className="mt-7 flex flex-col gap-4">
            {[
              "See evidence choices alongside final claims",
              "Spot shared misconceptions across a class",
              "Offer targeted prompts without taking over the work",
            ].map((item) => (
              <li className="flex items-center gap-3" key={item}>
                <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <IconCheck className="size-4" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button
            className="mt-8"
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-up?role=teacher" />}
          >
            See the teacher experience <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>
      <section className="border-y bg-secondary/50 py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <IconBook2 className="mx-auto text-primary" />
          <blockquote className="mt-6 font-heading text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
            “The best feedback doesn’t make the writing better for students. It
            makes their next decision clearer.”
          </blockquote>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            — Citation Gym teaching principle
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <p className="text-center text-sm font-bold tracking-[.16em] text-primary">
          QUESTIONS, ANSWERED
        </p>
        <h2 className="mt-3 text-center font-heading text-4xl font-bold tracking-tight">
          A better kind of writing practice.
        </h2>
        <div className="mt-10 flex flex-col divide-y rounded-2xl border bg-card">
          {questions.map(([question, answer], index) => (
            <div key={question}>
              <button
                onClick={() =>
                  setOpenQuestion(openQuestion === index ? -1 : index)
                }
                className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-medium"
              >
                <span>{question}</span>
                <IconChevronDown
                  className={
                    openQuestion === index
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>
              {openQuestion === index && (
                <p className="px-5 pb-5 leading-7 text-muted-foreground">
                  {answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="font-heading font-bold text-foreground">
            Citation Gym
          </Link>
          <p>© 2026 Citation Gym. Built for better arguments.</p>
          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
