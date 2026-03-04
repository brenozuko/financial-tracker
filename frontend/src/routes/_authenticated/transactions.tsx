import { TransactionList } from "@/features/transactions/components/TransactionList"
import type { ListTransactionsParams } from "@/features/transactions/api"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

type TransactionSearch = {
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

export const Route = createFileRoute("/_authenticated/transactions")({
  validateSearch: (search: Record<string, unknown>): TransactionSearch => ({
    page: Number(search.page) || undefined,
    page_size: Number(search.page_size) || undefined,
    sort_by: (search.sort_by as string) || undefined,
    sort_order: (search.sort_order as "asc" | "desc") || undefined,
    type: (search.type as "income" | "expense") || undefined,
    category_id: (search.category_id as string) || undefined,
    date_from: (search.date_from as string) || undefined,
    date_to: (search.date_to as string) || undefined,
    search: (search.search as string) || undefined,
  }),
  component: TransactionsPage,
})

function TransactionsPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const params: ListTransactionsParams = {
    page: searchParams.page ?? 1,
    page_size: searchParams.page_size ?? 10,
    sort_by: searchParams.sort_by ?? "date",
    sort_order: searchParams.sort_order ?? "desc",
    type: searchParams.type,
    category_id: searchParams.category_id,
    date_from: searchParams.date_from,
    date_to: searchParams.date_to,
    search: searchParams.search,
  }

  function handleParamsChange(newParams: ListTransactionsParams) {
    navigate({
      search: {
        page: newParams.page,
        page_size: newParams.page_size,
        sort_by: newParams.sort_by,
        sort_order: newParams.sort_order,
        type: newParams.type,
        category_id: newParams.category_id,
        date_from: newParams.date_from,
        date_to: newParams.date_to,
        search: newParams.search,
      },
    })
  }

  return <TransactionList params={params} onParamsChange={handleParamsChange} />
}
