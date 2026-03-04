import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions"
import { SpendingByCategory } from "@/features/dashboard/components/SpendingByCategory"
import { StatCards } from "@/features/dashboard/components/StatCards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
})


function DashboardPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">March 2026</p>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-2">
          <SpendingByCategory />
        </div>
      </div>
    </div>

  )
}