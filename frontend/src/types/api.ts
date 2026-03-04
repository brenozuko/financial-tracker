export type TransactionType = "income" | "expense"
export type RecurrenceFrequency = "weekly" | "monthly" | "yearly"

export interface Category {
  id: string
  name: string
  color: string
  is_default: boolean
  user_id: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  category_id: string | null
  category: Category | null
  notes: string | null
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency | null
  recurring_expense_id: string | null
  billing_period: string | null
  created_at: string
  updated_at: string
}

export interface RecurringExpense {
  id: string
  user_id: string
  name: string
  amount: number
  category_id: string | null
  category: Category | null
  due_day: number
  notes: string | null
  created_at: string
  updated_at: string
  is_paid: boolean
  paid_transaction_id: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
