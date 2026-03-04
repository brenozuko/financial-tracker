import { CheckCircle2, Pencil, Trash2, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RecurringExpense } from "@/types/api"
import { useMarkUnpaid } from "../queries"

interface RecurringExpenseCardProps {
  expense: RecurringExpense
  onMarkPaid: (expense: RecurringExpense) => void
  onEdit: (expense: RecurringExpense) => void
  onDelete: (expense: RecurringExpense) => void
}

function isOverdue(expense: RecurringExpense): boolean {
  if (expense.is_paid) return false
  const today = new Date()
  return today.getDate() > expense.due_day
}

export function RecurringExpenseCard({
  expense,
  onMarkPaid,
  onEdit,
  onDelete,
}: RecurringExpenseCardProps) {
  const markUnpaid = useMarkUnpaid()
  const overdue = isOverdue(expense)

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
      {/* Left: info */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{expense.name}</span>
          {overdue && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <TriangleAlert className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            €{expense.amount.toFixed(2)}
          </span>
          <span>Due day {expense.due_day}</span>
          {expense.category && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: expense.category.color }}
              />
              {expense.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="ml-4 flex shrink-0 items-center gap-2">
        {expense.is_paid ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Paid
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => markUnpaid.mutate(expense.id)}
              disabled={markUnpaid.isPending}
            >
              Undo
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkPaid(expense)}
          >
            Mark as paid
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => onEdit(expense)}
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(expense)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  )
}
