import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppNavbar } from "@/features/navigation/components/AppNavbar"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
