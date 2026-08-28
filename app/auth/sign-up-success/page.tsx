import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <Card className="border-border/70 text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-2 font-mono">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to your inbox. Confirm your email, then sign in to access
              the admin dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
