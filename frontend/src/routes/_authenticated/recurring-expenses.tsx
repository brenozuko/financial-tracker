import { createFileRoute } from "@tanstack/react-router"
import { RecurringExpenseList } from "@/features/recurring-expenses/components/RecurringExpenseList"

export const Route = createFileRoute("/_authenticated/recurring-expenses")({
  component: RecurringExpensesPage,
})

function RecurringExpensesPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <RecurringExpenseList />
    </div>
  )
}
