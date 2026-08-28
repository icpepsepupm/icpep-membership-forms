"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function LoadingScreen() {
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Respect users who prefer reduced motion — skip the splash quickly.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const showFor = reduce ? 300 : 1900
    const t1 = setTimeout(() => setDone(true), showFor)
    const t2 = setTimeout(() => setHidden(true), showFor + 600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        done ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      aria-hidden={done}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 animate-pulse-glow"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 45%, oklch(0.62 0.26 350 / 0.35), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 circuit-grid" aria-hidden="true" />

      <div className="relative flex flex-col items-center">
        {/* spinning ring around logo */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, oklch(0.62 0.26 350), oklch(0.55 0.22 300), transparent)",
              animation: "spin-ring 1.1s linear infinite",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            }}
            aria-hidden="true"
          />
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-background ring-1 ring-primary/30">
            <Image src="/icpep-logo.jpg" alt="PUP ICPEP logo" fill sizes="80px" className="object-cover" priority />
          </div>
        </div>

        <p className="mt-6 font-mono text-sm font-bold tracking-[0.4em] text-foreground">PUP ICPEP</p>
        <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground">INITIALIZING</p>

        {/* progress bar */}
        <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full w-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ animation: "bar-load 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
          />
        </div>
      </div>
    </div>
  )
}
