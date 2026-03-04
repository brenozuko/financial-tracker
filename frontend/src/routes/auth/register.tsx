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
import { useRegister } from "@/features/auth/hooks"
import { AuthFooter } from "@/features/auth/components/AuthFooter"
import { AuthShell } from "@/features/auth/components/AuthShell"
import { ErrorBanner } from "@/features/auth/components/ErrorBanner"

interface RegisterForm {
  name: string
  email: string
  password: string
}

export const Route = createFileRoute("/auth/register")({
  beforeLoad: () => {
    if (localStorage.getItem("token")) {
      throw redirect({ to: "/" })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const register = useRegister()
  const form = useForm<RegisterForm>({
    defaultValues: { name: "", email: "", password: "" },
  })

  function onSubmit(values: RegisterForm) {
    register.mutate(values)
  }

  const errorMessage = register.isError
    ? ((register.error as AxiosError<{ detail: string }>)?.response?.data?.detail ??
        "Something went wrong")
    : null

  return (
    <AuthShell>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Create an account</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Start tracking your finances today
        </p>
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Alice" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            rules={{
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Min. 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-2" disabled={register.isPending}>
            {register.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <AuthFooter>
        Already have an account?{" "}
        <Link to="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </AuthFooter>
    </AuthShell>
  )
}
