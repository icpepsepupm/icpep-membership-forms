"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  DEPARTMENT_IDS,
  DEPARTMENT_POSITIONS,
  STATUS_OPTIONS,
  type ApplicationStatus,
  type DepartmentId,
} from "@/lib/departments"

export type SubmitResult = { ok: true } | { ok: false; error: string }

function str(form: FormData, key: string) {
  const v = form.get(key)
  return typeof v === "string" ? v.trim() : ""
}

export async function submitApplication(formData: FormData): Promise<SubmitResult> {
  const full_name = str(formData, "full_name")
  const email = str(formData, "email")
  const department = str(formData, "department") as DepartmentId
  const motivation = str(formData, "motivation")

  // Server-side validation
  if (!full_name) return { ok: false, error: "Please enter your full name." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Please enter a valid email address." }
  if (!DEPARTMENT_IDS.includes(department))
    return { ok: false, error: "Please choose a valid department." }
  if (motivation.length < 20)
    return { ok: false, error: "Tell us a bit more about why you want to join (at least 20 characters)." }
  const position = str(formData, "position")
  if (!position) return { ok: false, error: "Please select a position." }
  const allowed = DEPARTMENT_POSITIONS[department]
  if (!allowed || !(allowed as readonly string[]).includes(position))
    return { ok: false, error: "Invalid position for this department." }

  const student_number = str(formData, "student_number")
  const course_year = str(formData, "course_year")
  const contact_number_raw = str(formData, "contact_number")
  const facebook_url_raw = str(formData, "facebook_url")
  const skills = str(formData, "skills")
  const portfolio_url_raw = str(formData, "portfolio_url") || null

  if (!student_number) return { ok: false, error: "Please enter your student number." }
  if (!/^\d{4}-\d{5}-MN-\d$/.test(student_number))
    return { ok: false, error: "Student number must be like 2023-00000-MN-0 (MN fixed)." }

  if (!course_year) return { ok: false, error: "Please enter your course & year." }

  if (!contact_number_raw) return { ok: false, error: "Please enter your contact number." }
  const digits = contact_number_raw.replace(/[\s\-\(\)]/g, "")
  const normContact = digits.startsWith("+63") ? "0" + digits.slice(3) : digits.startsWith("63") ? "0" + digits.slice(2) : digits
  if (!/^09\d{9}$/.test(normContact))
    return { ok: false, error: "Contact number must be 09XXXXXXXXX or +639XXXXXXXXX." }

  if (!facebook_url_raw) return { ok: false, error: "Please enter your Facebook profile." }
  const fb = facebook_url_raw.startsWith("http") ? facebook_url_raw : `https://${facebook_url_raw}`
  try {
    const u = new URL(fb)
    if (!/(^|\.)facebook\.com$/i.test(u.hostname) || u.pathname.replace(/\//g, "").length < 1) throw new Error()
  } catch {
    return { ok: false, error: "Facebook profile must be a valid facebook.com URL (e.g. facebook.com/username)." }
  }

  if (!skills || skills.length < 20) return { ok: false, error: "Please describe your skills (at least 20 characters)." }
  if (portfolio_url_raw) {
    const p = portfolio_url_raw.startsWith("http") ? portfolio_url_raw : `https://${portfolio_url_raw}`
    try {
      new URL(p)
    } catch {
      return { ok: false, error: "Portfolio link must be a valid URL." }
    }
  }

  const normEmail = email.trim().toLowerCase()
  const portfolio_url = portfolio_url_raw ? (portfolio_url_raw.startsWith("http") ? portfolio_url_raw : `https://${portfolio_url_raw}`) : null

  const supabase = await createClient()

  // ponytail: OR duplicate — block if email or student_number already exists (friendly pre-check, DB UNIQUE is race guard)
  const { data: existing } = await supabase
    .from("applications")
    .select("email, student_number")
    .or(`email.ilike.${normEmail},student_number.eq.${student_number}`)
    .limit(1)
    .maybeSingle()
  if (existing) {
    if (existing.email?.toLowerCase() === normEmail) return { ok: false, error: "An application with this email already exists." }
    if (existing.student_number === student_number) return { ok: false, error: "An application with this student number already exists." }
    return { ok: false, error: "An application with this email or student number already exists." }
  }

  const { error } = await supabase.from("applications").insert({
    full_name: full_name.trim(),
    email: normEmail,
    student_number,
    course_year: course_year.trim(),
    department,
    position,
    contact_number: normContact,
    facebook_url: fb,
    portfolio_url,
    skills: skills.trim(),
    motivation: motivation.trim(),
  })

  if (error) {
    console.log("[v0] submitApplication error:", JSON.stringify(error, null, 2))
    if (error.code === "23505") {
      const m = error.message.toLowerCase()
      if (m.includes("email")) return { ok: false, error: "An application with this email already exists." }
      if (m.includes("student_number")) return { ok: false, error: "An application with this student number already exists." }
      return { ok: false, error: "You have already submitted an application." }
    }
    // ponytail: surface real Supabase message in dev, generic in prod
    const msg = process.env.NODE_ENV !== "production" && error.message ? error.message : "Something went wrong submitting your application. Please try again."
    return { ok: false, error: msg }
  }

  return { ok: true }
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  if (!STATUS_OPTIONS.includes(status)) return
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from("applications").update({ status }).eq("id", id)
  if (error) {
    console.log("[v0] updateApplicationStatus error:", error.message)
    return
  }
  revalidatePath("/admin")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
