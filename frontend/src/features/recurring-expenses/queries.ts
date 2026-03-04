import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { transactionKeys } from "@/features/transactions/queries"
import {
  recurringExpensesApi,
  type CreateRecurringExpenseBody,
  type UpdateRecurringExpenseBody,
} from "./api"

// ── Query Key Factory ──────────────────────────────────────────────────────

export const recurringExpenseKeys = {
  all: ["recurring-expenses"] as const,
  lists: () => [...recurringExpenseKeys.all, "list"] as const,
  list: () => [...recurringExpenseKeys.lists()] as const,
  detail: (id: string) =>
    [...recurringExpenseKeys.all, "detail", id] as const,
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useRecurringExpenses() {
  return useQuery({
    queryKey: recurringExpenseKeys.list(),
    queryFn: () => recurringExpensesApi.list(),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRecurringExpenseBody) =>
      recurringExpensesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringExpenseKeys.lists() })
    },
  })
}

export function useUpdateRecurringExpense(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateRecurringExpenseBody) =>
      recurringExpensesApi.update(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(recurringExpenseKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: recurringExpenseKeys.lists() })
    },
  })
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recurringExpensesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: recurringExpenseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: recurringExpenseKeys.lists() })
    },
  })
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      recurringExpensesApi.markPaid(id, { date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringExpenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

export function useMarkUnpaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recurringExpensesApi.markUnpaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringExpenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}
