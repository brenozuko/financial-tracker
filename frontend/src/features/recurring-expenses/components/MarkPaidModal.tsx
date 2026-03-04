import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RecurringExpense } from "@/types/api"
import { useMarkPaid } from "../queries"

interface MarkPaidModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: RecurringExpense | null
}

interface FormValues {
  date: string
}

function getDefaultDate(expense: RecurringExpense | null): string {
  if (!expense) return new Date().toISOString().split("T")[0]
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const day = Math.min(expense.due_day, daysInMonth)
  return new Date(year, month, day).toISOString().split("T")[0]
}

export function MarkPaidModal({
  open,
  onOpenChange,
  expense,
}: MarkPaidModalProps) {
  const markPaid = useMarkPaid()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { date: getDefaultDate(expense) },
  })

  useEffect(() => {
    if (open && expense) {
      reset({ date: getDefaultDate(expense) })
    }
  }, [open, expense, reset])

  function onSubmit(values: FormValues) {
    if (!expense) return
    markPaid.mutate(
      { id: expense.id, date: new Date(values.date).toISOString() },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
        </DialogHeader>

        {expense && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{expense.name}</p>
            <p className="text-muted-foreground">
              €{expense.amount.toFixed(2)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="date">Payment date</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={markPaid.isPending}>
              {markPaid.isPending ? "Saving..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
