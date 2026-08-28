import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { MembershipForm } from "@/components/membership-form"
import { LoadingScreen } from "@/components/loading-screen"
import { FaqChatbot } from "@/components/faq-chatbot"
import { Toaster } from "@/components/ui/sonner"
import { Lock } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LoadingScreen />
      <Toaster position="top-center" richColors />

      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="animate-fade-up">
            <BrandLogo />
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 animate-pulse-glow"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.62 0.26 350 / 0.35), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 circuit-grid" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <p
            className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-primary animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            Recruitment is open
          </p>
          <h1
            className="mx-auto mt-4 max-w-3xl text-balance font-mono text-4xl font-bold leading-tight sm:text-5xl animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-foreground">Join the team behind </span>
            <span className="text-gradient">PUP ICPEP</span>
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Pick the department that fits you best — Graphics, Marketing, Tech, Operations, or
            Secretariat — and tell us why you belong. It only takes a couple of minutes.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <MembershipForm />
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-muted-foreground">
          PUP Institute of Computer Engineers of the Philippines — Student Edition
        </div>
      </footer>

      <FaqChatbot />
    </main>
  )
}
