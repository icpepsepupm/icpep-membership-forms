"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DEPARTMENTS, DEPARTMENT_POSITIONS, type DepartmentId } from "@/lib/departments"
import { submitApplication } from "@/app/actions"
import { toast } from "sonner"
import { Check, ArrowRight, ArrowLeft, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Step = "department" | "details" | "done"

function validate(name: string, value: string, position: string) {
  const v = value.trim()
  switch (name) {
    case "full_name":
      if (!v) return "Please enter your full name."
      return ""
    case "email":
      if (!v) return "Please enter your email."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address."
      return ""
    case "student_number":
      if (!v) return "Please enter your student number."
      if (!/^\d{4}-\d{5}-MN-\d$/.test(v)) return "Student number must be like 2023-00000-MN-0 (MN fixed)."
      return ""
    case "course_year":
      if (!v) return "Please enter your course & year."
      return ""
    case "contact_number": {
      if (!v) return "Please enter your contact number."
      const digits = v.replace(/[\s\-\(\)]/g, "")
      const norm = digits.startsWith("+63") ? "0" + digits.slice(3) : digits.startsWith("63") ? "0" + digits.slice(2) : digits
      if (!/^09\d{9}$/.test(norm)) return "Contact number must be 09XXXXXXXXX or +639XXXXXXXXX."
      return ""
    }
    case "facebook_url": {
      if (!v) return "Please enter your Facebook profile."
      const fb = v.startsWith("http") ? v : `https://${v}`
      try {
        const u = new URL(fb)
        if (!/(^|\.)facebook\.com$/i.test(u.hostname) || u.pathname.replace(/\//g, "").length < 1) throw new Error()
      } catch {
        return "Facebook profile must be a valid facebook.com URL (e.g. facebook.com/username)."
      }
      return ""
    }
    case "portfolio_url": {
      if (!v) return ""
      const p = v.startsWith("http") ? v : `https://${v}`
      try {
        new URL(p)
      } catch {
        return "Portfolio link must be a valid URL."
      }
      return ""
    }
    case "skills":
      if (!v) return "Please tell us your skills & experience."
      if (v.length < 20) return "Please describe your skills (at least 20 characters)."
      return ""
    case "motivation":
      if (!v) return "Please tell us why you want to join."
      if (v.length < 20) return "Tell us a bit more (at least 20 characters)."
      return ""
    case "position":
      if (!position.trim()) return "Please select a position."
      return ""
    default:
      return ""
  }
}

export function MembershipForm() {
  const [step, setStep] = useState<Step>("department")
  const [department, setDepartment] = useState<DepartmentId | null>(null)
  const [position, setPosition] = useState("")
  const [isPending, startTransition] = useTransition()
  const positionsForDept = department ? DEPARTMENT_POSITIONS[department] : []

  const [values, setValues] = useState<Record<string, string>>({
    full_name: "",
    email: "",
    student_number: "",
    course_year: "",
    contact_number: "",
    facebook_url: "",
    portfolio_url: "",
    skills: "",
    motivation: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [posTouched, setPosTouched] = useState(false)

  const posError = posTouched && !position ? "Please select a position." : ""

  function handleBlur(name: string, value: string) {
    setTouched((p) => ({ ...p, [name]: true }))
    setErrors((p) => ({ ...p, [name]: validate(name, value, position) }))
  }

  function handleChange(name: string, value: string) {
    setValues((p) => ({ ...p, [name]: value }))
    if (touched[name]) setErrors((p) => ({ ...p, [name]: validate(name, value, position) }))
  }

  function handlePositionChange(v: string | null) {
    const next = v ?? ""
    setPosition(next)
    if (posTouched) setErrors((p) => ({ ...p, position: validate("position", "", next) }))
  }

  function handleSubmit(formData: FormData) {
    if (!department) return
    // mark all touched and validate open course_year
    const allTouched: Record<string, boolean> = {}
    const nextErrors: Record<string, string> = {}
    for (const k of Object.keys(values)) {
      allTouched[k] = true
      nextErrors[k] = validate(k, values[k] ?? "", position)
    }
    nextErrors["position"] = validate("position", "", position)
    setTouched((p) => ({ ...p, ...allTouched }))
    setPosTouched(true)
    setErrors((p) => ({ ...p, ...nextErrors }))
    const hasError = Object.values(nextErrors).some(Boolean)
    if (hasError) {
      const first = Object.entries(nextErrors).find(([, e]) => e)
      if (first) toast.error(first[1])
      return
    }
    formData.set("department", department)
    formData.set("position", position)
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
    return <SuccessPanel department={department} onReset={() => { setDepartment(null); setPosition(""); setValues({ full_name: "", email: "", student_number: "", course_year: "", contact_number: "", facebook_url: "", portfolio_url: "", skills: "", motivation: "" }); setErrors({}); setTouched({}); setPosTouched(false); setStep("department") }} />
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
                onClick={() => { setDepartment(dept.id); setPosition(""); setPosTouched(false); setErrors((p) => ({ ...p, position: "" })) }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
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

          <div className="space-y-2">
            <Label>
              Position <span className="text-primary">*</span>
            </Label>
            <Select value={position} onValueChange={handlePositionChange}>
              <SelectTrigger className={cn("w-full", posError && "border-destructive focus-visible:ring-destructive/20")}>
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {positionsForDept.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {posError && <p className="text-xs text-destructive">{posError}</p>}
            <input type="hidden" name="position" value={position} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="full_name" required placeholder="Juan Dela Cruz" value={values.full_name} error={touched.full_name ? errors.full_name : ""} onChange={handleChange} onBlur={handleBlur} />
            <Field label="Email" name="email" type="email" required placeholder="you@iskolarngbayan.pup.edu.ph" value={values.email} error={touched.email ? errors.email : ""} onChange={handleChange} onBlur={handleBlur} />
            <Field label="Student number" name="student_number" required placeholder="2023-00000-MN-0" value={values.student_number} error={touched.student_number ? errors.student_number : ""} onChange={handleChange} onBlur={handleBlur} />
            <Field label="Course & year" name="course_year" required placeholder="BSCPE 2-1" value={values.course_year} error={touched.course_year ? errors.course_year : ""} onChange={handleChange} onBlur={handleBlur} />
            <Field label="Contact number" name="contact_number" required placeholder="09XXXXXXXXX or +639XXXXXXXXX" value={values.contact_number} error={touched.contact_number ? errors.contact_number : ""} onChange={handleChange} onBlur={handleBlur} />
            <Field label="Facebook profile" name="facebook_url" required placeholder="facebook.com/username" value={values.facebook_url} error={touched.facebook_url ? errors.facebook_url : ""} onChange={handleChange} onBlur={handleBlur} />
          </div>

          <Field
            label="Portfolio / GitHub / Drive (optional)"
            name="portfolio_url"
            placeholder="Link to your work"
            value={values.portfolio_url}
            error={touched.portfolio_url ? errors.portfolio_url : ""}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div className="space-y-2">
            <Label htmlFor="skills">
              Relevant skills & experience <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              required
              minLength={20}
              placeholder="Tools you use, past projects, orgs you've been part of..."
              value={values.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              onBlur={(e) => handleBlur("skills", e.target.value)}
              aria-invalid={!!(touched.skills && errors.skills)}
              className={cn(touched.skills && errors.skills && "border-destructive focus-visible:ring-destructive/20")}
            />
            {touched.skills && errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
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
              value={values.motivation}
              onChange={(e) => handleChange("motivation", e.target.value)}
              onBlur={(e) => handleBlur("motivation", e.target.value)}
              aria-invalid={!!(touched.motivation && errors.motivation)}
              className={cn(touched.motivation && errors.motivation && "border-destructive focus-visible:ring-destructive/20")}
            />
            {touched.motivation && errors.motivation && <p className="text-xs text-destructive">{errors.motivation}</p>}
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
  value,
  error,
  onChange,
  onBlur,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  value?: string
  error?: string
  onChange?: (name: string, value: string) => void
  onBlur?: (name: string, value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(name, e.target.value)}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        aria-invalid={!!error}
        className={cn(error && "border-destructive focus-visible:ring-destructive/20")}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
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
