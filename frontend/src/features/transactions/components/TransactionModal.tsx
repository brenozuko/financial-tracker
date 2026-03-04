import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { Transaction } from "@/types/api"
import { useCreateTransaction, useUpdateTransaction } from "../queries"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

interface FormValues {
  type: "income" | "expense"
  description: string
  amount: string
  date: string
  category_id: string
  notes: string
  is_recurring: boolean
  recurrence_frequency: string
}

const NONE_CATEGORY = "__none__"

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
}: TransactionModalProps) {
  const isEditing = !!transaction
  const { data: categories } = useCategories()
  const createTxn = useCreateTransaction()
  const updateTxn = useUpdateTransaction(transaction?.id ?? "")

  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#6366F1")
  const createCategory = useCreateCategory()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: "expense",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category_id: NONE_CATEGORY,
      notes: "",
      is_recurring: false,
      recurrence_frequency: "",
    },
  })

  const isRecurring = watch("is_recurring")
  const isPending = createTxn.isPending || updateTxn.isPending

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type,
          description: transaction.description,
          amount: String(transaction.amount),
          date: transaction.date.split("T")[0],
          category_id: transaction.category_id ?? NONE_CATEGORY,
          notes: transaction.notes ?? "",
          is_recurring: transaction.is_recurring,
          recurrence_frequency: transaction.recurrence_frequency ?? "",
        })
      } else {
        reset({
          type: "expense",
          description: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          category_id: NONE_CATEGORY,
          notes: "",
          is_recurring: false,
          recurrence_frequency: "",
        })
      }
      setAddingCategory(false)
    }
  }, [open, transaction, reset])

  function onSubmit(values: FormValues) {
    const body = {
      type: values.type as "income" | "expense",
      description: values.description,
      amount: parseFloat(values.amount),
      date: new Date(values.date).toISOString(),
      category_id:
        values.category_id === NONE_CATEGORY ? null : values.category_id,
      notes: values.notes || null,
      is_recurring: values.is_recurring,
      recurrence_frequency: values.is_recurring
        ? (values.recurrence_frequency as "weekly" | "monthly" | "yearly")
        : null,
    }

    if (isEditing) {
      updateTxn.mutate(body, {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      })
    } else {
      createTxn.mutate(body, {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type toggle */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  type="button"
                  variant={field.value === "expense" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => field.onChange("expense")}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={field.value === "income" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => field.onChange("income")}
                >
                  Income
                </Button>
              </div>
            )}
          />

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="What was this for?"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
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

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
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

          {/* Recurring */}
          <Controller
            name="is_recurring"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_recurring"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="is_recurring" className="cursor-pointer">
                  Recurring transaction
                </Label>
              </div>
            )}
          />

          {isRecurring && (
            <Controller
              name="recurrence_frequency"
              control={control}
              rules={{ required: "Frequency is required for recurring" }}
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-1">
                  <Label>Frequency</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-sm text-destructive">{error.message}</p>
                  )}
                </div>
              )}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
