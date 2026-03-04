import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/features/categories/queries"
import type { ListTransactionsParams } from "../api"

interface TransactionFilterBarProps {
  params: ListTransactionsParams
  onParamsChange: (params: ListTransactionsParams) => void
}

export function TransactionFilterBar({
  params,
  onParamsChange,
}: TransactionFilterBarProps) {
  const { data: categories } = useCategories()
  const [searchInput, setSearchInput] = useState(params.search ?? "")
  const isFirstRender = useRef(true)

  // Debounce search — skip the first render to avoid overwriting initial URL params
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      onParamsChange({ ...params, search: searchInput || undefined, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const hasActiveFilters =
    params.type || params.category_id || params.date_from || params.date_to || params.search

  function clearFilters() {
    setSearchInput("")
    onParamsChange({
      page: 1,
      page_size: params.page_size,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type filter */}
      <Select
        value={params.type ?? "all"}
        onValueChange={(val) =>
          onParamsChange({
            ...params,
            type: val === "all" ? undefined : (val as "income" | "expense"),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      {/* Category filter */}
      <Select
        value={params.category_id ?? "all"}
        onValueChange={(val) =>
          onParamsChange({
            ...params,
            category_id: val === "all" ? undefined : val,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
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

      {/* Date range */}
      <Input
        type="date"
        value={params.date_from ?? ""}
        onChange={(e) =>
          onParamsChange({
            ...params,
            date_from: e.target.value || undefined,
            page: 1,
          })
        }
        className="w-36"
        placeholder="From"
      />
      <Input
        type="date"
        value={params.date_to ?? ""}
        onChange={(e) =>
          onParamsChange({
            ...params,
            date_to: e.target.value || undefined,
            page: 1,
          })
        }
        className="w-36"
        placeholder="To"
      />

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
