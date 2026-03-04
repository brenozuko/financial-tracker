import { useState } from "react"
import { Plus, RefreshCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecurringExpense } from "@/types/api"
import { useDeleteRecurringExpense, useRecurringExpenses } from "../queries"
import { MarkPaidModal } from "./MarkPaidModal"
import { RecurringExpenseCard } from "./RecurringExpenseCard"
import { RecurringExpenseModal } from "./RecurringExpenseModal"

export function RecurringExpenseList() {
  const { data, isPending, isError } = useRecurringExpenses()
  const deleteExpense = useDeleteRecurringExpense()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(
    null,
  )
  const [markPaidExpense, setMarkPaidExpense] =
    useState<RecurringExpense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpense | null>(
    null,
  )

  function handleCreate() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  function handleEdit(expense: RecurringExpense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteExpense.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  if (isPending) return <RecurringExpenseListSkeleton />
  if (isError)
    return (
      <p className="text-destructive">Failed to load recurring expenses.</p>
    )

  const totalCommitted = data.reduce((sum, e) => sum + e.amount, 0)
  const totalPaid = data
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recurring Expenses</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Recurring Expense
        </Button>
      </div>

      {/* Monthly summary strip */}
      {data.length > 0 && (
        <div className="flex gap-6 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          <span>
            <span className="text-muted-foreground">Committed: </span>
            <span className="font-semibold">€{totalCommitted.toFixed(2)}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Paid this month: </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              €{totalPaid.toFixed(2)}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Remaining: </span>
            <span className="font-semibold">
              €{(totalCommitted - totalPaid).toFixed(2)}
            </span>
          </span>
        </div>
      )}

      {/* Content */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-1 text-lg font-medium">No recurring expenses</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Track your monthly bills by adding a recurring expense.
          </p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add your first recurring expense
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((expense) => (
            <RecurringExpenseCard
              key={expense.id}
              expense={expense}
              onMarkPaid={setMarkPaidExpense}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <RecurringExpenseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        expense={editingExpense}
      />

      {/* Mark as paid modal */}
      <MarkPaidModal
        open={!!markPaidExpense}
        onOpenChange={(open) => !open && setMarkPaidExpense(null)}
        expense={markPaidExpense}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring expense?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RecurringExpenseListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-48" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
