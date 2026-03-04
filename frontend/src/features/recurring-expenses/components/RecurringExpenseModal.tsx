import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Plus } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCategories, useCreateCategory } from "@/features/categories/queries"
import type { RecurringExpense } from "@/types/api"
import {
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
} from "../queries"

interface RecurringExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: RecurringExpense | null
}

interface FormValues {
  name: string
  amount: string
  due_day: string
  category_id: string
  notes: string
}

const NONE_CATEGORY = "__none__"

export function RecurringExpenseModal({
  open,
  onOpenChange,
  expense,
}: RecurringExpenseModalProps) {
  const isEditing = !!expense
  const { data: categories } = useCategories()
  const createExpense = useCreateRecurringExpense()
  const updateExpense = useUpdateRecurringExpense(expense?.id ?? "")

  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#6366F1")
  const createCategory = useCreateCategory()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      amount: "",
      due_day: "",
      category_id: NONE_CATEGORY,
      notes: "",
    },
  })

  const isPending = createExpense.isPending || updateExpense.isPending

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          name: expense.name,
          amount: String(expense.amount),
          due_day: String(expense.due_day),
          category_id: expense.category_id ?? NONE_CATEGORY,
          notes: expense.notes ?? "",
        })
      } else {
        reset({
          name: "",
          amount: "",
          due_day: "",
          category_id: NONE_CATEGORY,
          notes: "",
        })
      }
    }
  }, [open, expense, reset])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setAddingCategory(false)
    onOpenChange(nextOpen)
  }

  function onSubmit(values: FormValues) {
    const body = {
      name: values.name,
      amount: parseFloat(values.amount),
      due_day: parseInt(values.due_day, 10),
      category_id:
        values.category_id === NONE_CATEGORY ? null : values.category_id,
      notes: values.notes || null,
    }

    if (isEditing) {
      updateExpense.mutate(body, {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      })
    } else {
      createExpense.mutate(body, {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      })
    }
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return
    createCategory.mutate(
      { name: newCatName.trim(), color: newCatColor },
      {
        onSuccess: () => {
          setNewCatName("")
          setAddingCategory(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Recurring Expense" : "New Recurring Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Netflix, Rent"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount", {
                required: "Amount is required",
                validate: (v) =>
                  parseFloat(v) > 0 || "Amount must be greater than zero",
              })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Due Day */}
          <div className="space-y-1">
            <Label htmlFor="due_day">Due day of month</Label>
            <Input
              id="due_day"
              type="number"
              min="1"
              max="31"
              {...register("due_day", {
                required: "Due day is required",
                validate: (v) => {
                  const n = parseInt(v, 10)
                  return (
                    (n >= 1 && n <= 31) || "Due day must be between 1 and 31"
                  )
                },
              })}
              placeholder="15"
            />
            {errors.due_day && (
              <p className="text-sm text-destructive">
                {errors.due_day.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_CATEGORY}>None</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {!addingCategory ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 gap-1 text-xs"
                onClick={() => setAddingCategory(true)}
              >
                <Plus className="h-3 w-3" /> Add category
              </Button>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-8 text-sm"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  onClick={handleAddCategory}
                  disabled={createCategory.isPending}
                >
                  {createCategory.isPending ? "..." : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => setAddingCategory(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
