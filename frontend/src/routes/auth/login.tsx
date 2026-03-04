import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import type { AxiosError } from "axios"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/features/auth/hooks"
import { AuthFooter } from "@/features/auth/components/AuthFooter"
import { AuthShell } from "@/features/auth/components/AuthShell"
import { ErrorBanner } from "@/features/auth/components/ErrorBanner"

interface LoginForm {
  email: string
  password: string
}

export const Route = createFileRoute("/auth/login")({
  beforeLoad: () => {
    if (localStorage.getItem("token")) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const login = useLogin()
  const form = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginForm) {
    login.mutate(values)
  }

  const errorMessage = login.isError
    ? ((login.error as AxiosError<{ detail: string }>)?.response?.data?.detail ??
        "Something went wrong")
    : null

  return (
    <AuthShell>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Sign in to your account</p>
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-2" disabled={login.isPending}>
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <AuthFooter>
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </AuthFooter>
    </AuthShell>
  )
}
