import { apiClient } from "@/lib/api-client"
import type { RecurringExpense, Transaction } from "@/types/api"

export interface CreateRecurringExpenseBody {
  name: string
  amount: number
  due_day: number
  category_id?: string | null
  notes?: string | null
}

export interface UpdateRecurringExpenseBody {
  name?: string
  amount?: number
  due_day?: number
  category_id?: string | null
  notes?: string | null
}

export const recurringExpensesApi = {
  list() {
    return apiClient
      .get<RecurringExpense[]>("/recurring-expenses/")
      .then((r) => r.data)
  },

  get(id: string) {
    return apiClient
      .get<RecurringExpense>(`/recurring-expenses/${id}`)
      .then((r) => r.data)
  },

  create(body: CreateRecurringExpenseBody) {
    return apiClient
      .post<RecurringExpense>("/recurring-expenses/", body)
      .then((r) => r.data)
  },

  update(id: string, body: UpdateRecurringExpenseBody) {
    return apiClient
      .patch<RecurringExpense>(`/recurring-expenses/${id}`, body)
      .then((r) => r.data)
  },

  delete(id: string) {
    return apiClient.delete(`/recurring-expenses/${id}`).then(() => undefined)
  },

  markPaid(id: string, body: { date: string }) {
    return apiClient
      .post<Transaction>(`/recurring-expenses/${id}/mark-paid`, body)
      .then((r) => r.data)
  },

  markUnpaid(id: string) {
    return apiClient
      .post(`/recurring-expenses/${id}/mark-unpaid`)
      .then(() => undefined)
  },
}
