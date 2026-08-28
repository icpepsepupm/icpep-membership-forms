"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  DEPARTMENT_IDS,
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

  const supabase = await createClient()

  const { error } = await supabase.from("applications").insert({
    full_name,
    email,
    student_number: str(formData, "student_number") || null,
    course_year: str(formData, "course_year") || null,
    department,
    contact_number: str(formData, "contact_number") || null,
    facebook_url: str(formData, "facebook_url") || null,
    portfolio_url: str(formData, "portfolio_url") || null,
    skills: str(formData, "skills") || null,
    motivation,
  })

  if (error) {
    console.log("[v0] submitApplication error:", error.message)
    return { ok: false, error: "Something went wrong submitting your application. Please try again." }
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
