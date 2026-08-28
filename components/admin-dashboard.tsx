"use client"

import { useMemo, useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEPARTMENTS, STATUS_OPTIONS, type ApplicationStatus } from "@/lib/departments"
import { updateApplicationStatus } from "@/app/actions"
import { cn } from "@/lib/utils"
import { Mail, Phone, ExternalLink, ChevronDown } from "lucide-react"

export type Application = {
  id: string
  created_at: string
  full_name: string
  email: string
  student_number: string | null
  course_year: string | null
  department: string
  contact_number: string | null
  facebook_url: string | null
  portfolio_url: string | null
  skills: string | null
  motivation: string
  status: ApplicationStatus
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  reviewed: "bg-accent/25 text-accent-foreground",
  accepted: "bg-primary/20 text-primary",
  rejected: "bg-destructive/20 text-destructive",
}

export function AdminDashboard({ applications }: { applications: Application[] }) {
  const [dept, setDept] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")

  const filtered = useMemo(
    () =>
      applications.filter(
        (a) =>
          (dept === "all" || a.department === dept) &&
          (status === "all" || a.status === status),
      ),
    [applications, dept, status],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length }
    for (const d of DEPARTMENTS) c[d.id] = applications.filter((a) => a.department === d.id).length
    return c
  }, [applications])

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DEPARTMENTS.map((d) => (
          <div key={d.id} className="rounded-xl border border-border/70 bg-card p-4">
            <p className="font-mono text-2xl font-bold text-foreground">{counts[d.id] ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d.id}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 py-16 text-center text-muted-foreground">
          No applications match these filters yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ApplicationRow({ app }: { app: Application }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<ApplicationStatus>(app.status)

  function changeStatus(next: ApplicationStatus) {
    setStatus(next)
    startTransition(() => updateApplicationStatus(app.id, next))
  }

  const date = new Date(app.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <li className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{app.full_name}</p>
            <p className="truncate text-sm text-muted-foreground">{app.email}</p>
          </div>
        </button>

        <Badge variant="outline" className="font-mono">
          {app.department}
        </Badge>
        <Badge className={cn("capitalize", STATUS_STYLES[status])}>{status}</Badge>
        <span className="hidden text-xs text-muted-foreground sm:block">{date}</span>

        <Select value={status} onValueChange={(v) => changeStatus(v as ApplicationStatus)}>
          <SelectTrigger className="w-[130px]" disabled={isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/40 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Student number" value={app.student_number} />
            <Detail label="Course & year" value={app.course_year} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contact</p>
              <div className="flex flex-col gap-1 text-sm">
                <a href={`mailto:${app.email}`} className="flex items-center gap-2 text-foreground hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> {app.email}
                </a>
                {app.contact_number && (
                  <span className="flex items-center gap-2 text-foreground">
                    <Phone className="h-3.5 w-3.5" /> {app.contact_number}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Links</p>
              <div className="flex flex-col gap-1 text-sm">
                {app.facebook_url ? (
                  <ExternalLinkRow href={app.facebook_url} label="Facebook" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
                {app.portfolio_url && <ExternalLinkRow href={app.portfolio_url} label="Portfolio" />}
              </div>
            </div>
          </div>

          {app.skills && (
            <div className="mt-4 space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills & experience</p>
              <p className="text-sm leading-relaxed text-foreground/90">{app.skills}</p>
            </div>
          )}
          <div className="mt-4 space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Motivation</p>
            <p className="text-sm leading-relaxed text-foreground/90">{app.motivation}</p>
          </div>
        </div>
      )}
    </li>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground/90">{value || "—"}</p>
    </div>
  )
}

function ExternalLinkRow({ href, label }: { href: string; label: string }) {
  const url = href.startsWith("http") ? href : `https://${href}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-foreground hover:text-primary"
    >
      <ExternalLink className="h-3.5 w-3.5" /> {label}
    </a>
  )
}
