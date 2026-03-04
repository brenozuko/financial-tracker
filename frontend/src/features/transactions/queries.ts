import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  transactionsApi,
  type CreateTransactionBody,
  type ListTransactionsParams,
  type UpdateTransactionBody,
} from "./api"

// ── Query Key Factory ──────────────────────────────────────────────────────

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params: ListTransactionsParams) =>
    [...transactionKeys.lists(), params] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useTransactions(params: ListTransactionsParams = {}) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsApi.list(params),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionBody) => transactionsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTransactionBody) =>
      transactionsApi.update(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(transactionKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

export function useRestoreTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}
