"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DEPARTMENTS, type DepartmentId } from "@/lib/departments"
import { submitApplication } from "@/app/actions"
import { toast } from "sonner"
import { Check, ArrowRight, ArrowLeft, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "department" | "details" | "done"

export function MembershipForm() {
  const [step, setStep] = useState<Step>("department")
  const [department, setDepartment] = useState<DepartmentId | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    if (!department) return
    formData.set("department", department)
    startTransition(async () => {
      const res = await submitApplication(formData)
      if (res.ok) {
        setStep("done")
      } else {
        toast.error(res.error)
      }
    })
  }

  if (step === "done") {
    return <SuccessPanel department={department} onReset={() => { setDepartment(null); setStep("department") }} />
  }

  return (
    <div className="w-full">
      <StepIndicator step={step} />

      {step === "department" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {DEPARTMENTS.map((dept) => {
            const active = department === dept.id
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setDepartment(dept.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-all",
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                  )}
                />
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-lg font-bold tracking-wide text-foreground">{dept.id}</h3>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground/90">{dept.tagline}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{dept.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {dept.focus.map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="button"
              size="lg"
              disabled={!department}
              onClick={() => setStep("details")}
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "details" && department && (
        <form action={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="text-sm text-muted-foreground">Applying for</span>
            <span className="font-mono text-sm font-bold tracking-wide text-foreground">{department}</span>
            <button
              type="button"
              onClick={() => setStep("department")}
              className="ml-auto text-xs text-primary underline-offset-2 hover:underline"
            >
              Change
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="full_name" required placeholder="Juan Dela Cruz" />
            <Field label="Email" name="email" type="email" required placeholder="you@iskolarngbayan.pup.edu.ph" />
            <Field label="Student number" name="student_number" placeholder="2023-00000-MN-0" />
            <Field label="Course & year" name="course_year" placeholder="BSCPE 2-1" />
            <Field label="Contact number" name="contact_number" placeholder="09XXXXXXXXX" />
            <Field label="Facebook profile" name="facebook_url" placeholder="facebook.com/username" />
          </div>

          <Field
            label="Portfolio / GitHub / Drive (optional)"
            name="portfolio_url"
            placeholder="Link to your work"
          />

          <div className="space-y-2">
            <Label htmlFor="skills">Relevant skills & experience</Label>
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              placeholder="Tools you use, past projects, orgs you've been part of..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">
              Why do you want to join this department? <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="motivation"
              name="motivation"
              rows={5}
              required
              minLength={20}
              placeholder="Tell us what excites you about this role and what you hope to contribute."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("department")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" size="lg" disabled={isPending} className="gap-2">
              {isPending ? "Submitting..." : "Submit application"}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { id: "department", label: "Department" },
    { id: "details", label: "Your details" },
  ]
  const currentIndex = step === "department" ? 0 : 1
  return (
    <div className="mb-6 flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors",
                i <= currentIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                i <= currentIndex ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  )
}

function SuccessPanel({
  department,
  onReset,
}: {
  department: DepartmentId | null
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-primary/30 bg-card p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
        <PartyPopper className="h-7 w-7 text-primary-foreground" />
      </div>
      <h2 className="mt-5 font-mono text-2xl font-bold text-foreground">Application received</h2>
      <p className="mt-2 max-w-md text-balance text-muted-foreground">
        Thanks for applying to the {department} department. Our officers will review your application
        and reach out via the email you provided.
      </p>
      <Button onClick={onReset} variant="outline" className="mt-6 bg-transparent">
        Submit another application
      </Button>
    </div>
  )
}
