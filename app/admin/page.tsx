import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { BrandLogo } from "@/components/brand-logo"
import { AdminDashboard, type Application } from "@/components/admin-dashboard"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions"
import { LogOut, ArrowLeft } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, created_at, full_name, email, student_number, course_year, department, position, contact_number, facebook_url, portfolio_url, skills, motivation, status",
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.log("[v0] admin fetch error:", error.message)
  }

  const applications = (data ?? []) as Application[]

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Form
              </Link>
            </Button>
            <form
              action={async () => {
                "use server"
                await signOut()
                redirect("/auth/login")
              }}
            >
              <Button type="submit" variant="outline" size="sm" className="gap-1.5 bg-transparent">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-mono text-2xl font-bold text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage membership applications across all departments.
          </p>
        </div>
        <AdminDashboard applications={applications} />
      </section>
    </main>
  )
}
