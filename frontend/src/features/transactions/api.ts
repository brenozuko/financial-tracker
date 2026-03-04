import { apiClient } from "@/lib/api-client"
import type { PaginatedResponse, Transaction } from "@/types/api"

export interface CreateTransactionBody {
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category_id?: string | null
  notes?: string | null
  is_recurring?: boolean
  recurrence_frequency?: "weekly" | "monthly" | "yearly" | null
}

export interface UpdateTransactionBody {
  type?: "income" | "expense"
  description?: string
  amount?: number
  date?: string
  category_id?: string | null
  notes?: string | null
  is_recurring?: boolean
  recurrence_frequency?: "weekly" | "monthly" | "yearly" | null
}

export interface ListTransactionsParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
  type?: "income" | "expense"
  category_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

export const transactionsApi = {
  list(params: ListTransactionsParams = {}) {
    return apiClient
      .get<PaginatedResponse<Transaction>>("/transactions/", { params })
      .then((r) => r.data)
  },

  get(id: string) {
    return apiClient
      .get<Transaction>(`/transactions/${id}`)
      .then((r) => r.data)
  },

  create(body: CreateTransactionBody) {
    return apiClient
      .post<Transaction>("/transactions/", body)
      .then((r) => r.data)
  },

  update(id: string, body: UpdateTransactionBody) {
    return apiClient
      .patch<Transaction>(`/transactions/${id}`, body)
      .then((r) => r.data)
  },

  delete(id: string) {
    return apiClient.delete(`/transactions/${id}`).then(() => undefined)
  },

  restore(id: string) {
    return apiClient
      .post<Transaction>(`/transactions/${id}/restore`)
      .then((r) => r.data)
  },
}
