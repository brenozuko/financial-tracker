import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Stat {
  label: string
  value: string
  delta: string
  positive: boolean
  icon: LucideIcon
  sub: string
}

export interface Transaction {
  id: number
  date: string
  description: string
  category: string
  amount: number
  income: boolean
}

export interface Category {
  name: string
  amount: number
}

export const STATS: Stat[] = [
  {
    label: "Total Balance",
    value: "$24,830.00",
    delta: "+2.4%",
    positive: true,
    icon: Wallet,
    sub: "vs last month",
  },
  {
    label: "Monthly Income",
    value: "$6,200.00",
    delta: "+$400",
    positive: true,
    icon: TrendingUp,
    sub: "March 2026",
  },
  {
    label: "Monthly Expenses",
    value: "$3,941.50",
    delta: "+$218",
    positive: false,
    icon: TrendingDown,
    sub: "March 2026",
  },
  {
    label: "Savings Rate",
    value: "36.4%",
    delta: "+1.2pp",
    positive: true,
    icon: PiggyBank,
    sub: "of gross income",
  },
]

export const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: "Mar 01",
    description: "Salary — Acme Corp",
    category: "Income",
    amount: 6200.0,
    income: true,
  },
  {
    id: 2,
    date: "Mar 02",
    description: "Rent — Maple St",
    category: "Housing",
    amount: -1850.0,
    income: false,
  },
  {
    id: 3,
    date: "Mar 03",
    description: "Whole Foods",
    category: "Groceries",
    amount: -134.5,
    income: false,
  },
  {
    id: 4,
    date: "Mar 04",
    description: "Netflix",
    category: "Subscriptions",
    amount: -17.99,
    income: false,
  },
  {
    id: 5,
    date: "Mar 05",
    description: "Freelance — UI Design",
    category: "Income",
    amount: 850.0,
    income: true,
  },
]

export const CATEGORIES: Category[] = [
  { name: "Housing", amount: 1850.0 },
  { name: "Food & Drink", amount: 892.5 },
  { name: "Transport", amount: 438.0 },
  { name: "Subscriptions", amount: 312.0 },
  { name: "Health", amount: 249.0 },
  { name: "Entertainment", amount: 200.0 },
]
