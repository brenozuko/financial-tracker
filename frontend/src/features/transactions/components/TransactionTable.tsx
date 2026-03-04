import { format } from "date-fns"
import { ArrowDown, ArrowUp, ArrowUpDown, Repeat, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/api"
import type { ListTransactionsParams } from "../api"

interface TransactionTableProps {
  transactions: Transaction[]
  params: ListTransactionsParams
  onParamsChange: (params: ListTransactionsParams) => void
  onRowClick: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

function SortIcon({
  column,
  params,
}: {
  column: string
  params: ListTransactionsParams
}) {
  if (params.sort_by !== column) return <ArrowUpDown className="h-4 w-4" />
  return params.sort_order === "asc" ? (
    <ArrowUp className="h-4 w-4" />
  ) : (
    <ArrowDown className="h-4 w-4" />
  )
}

export function TransactionTable({
  transactions,
  params,
  onParamsChange,
  onRowClick,
  onDelete,
}: TransactionTableProps) {
  function handleSort(column: string) {
    const isSame = params.sort_by === column
    onParamsChange({
      ...params,
      sort_by: column,
      sort_order: isSame && params.sort_order === "desc" ? "asc" : "desc",
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1"
                onClick={() => handleSort("date")}
              >
                Date
                <SortIcon column="date" params={params} />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1"
                onClick={() => handleSort("description")}
              >
                Description
                <SortIcon column="description" params={params} />
              </Button>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="-mr-3 ml-auto gap-1"
                onClick={() => handleSort("amount")}
              >
                Amount
                <SortIcon column="amount" params={params} />
              </Button>
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow
              key={txn.id}
              className="cursor-pointer"
              onClick={() => onRowClick(txn)}
            >
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {format(new Date(txn.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{txn.description}</span>
                  {txn.is_recurring && (
                    <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {txn.category && (
                  <Badge
                    variant="outline"
                    className="gap-1.5"
                    style={{ borderColor: txn.category.color }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: txn.category.color }}
                    />
                    {txn.category.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium tabular-nums",
                  txn.type === "income" ? "text-green-500" : "text-red-500",
                )}
              >
                {txn.type === "income" ? "+" : "-"}$
                {txn.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(txn)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
