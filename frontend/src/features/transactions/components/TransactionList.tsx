import { useState } from "react"
import { Plus, Receipt } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/types/api"
import type { ListTransactionsParams } from "../api"
import {
  useDeleteTransaction,
  useRestoreTransaction,
  useTransactions,
} from "../queries"
import { TransactionFilterBar } from "./TransactionFilterBar"
import { TransactionModal } from "./TransactionModal"
import { TransactionPagination } from "./TransactionPagination"
import { TransactionTable } from "./TransactionTable"

interface TransactionListProps {
  params: ListTransactionsParams
  onParamsChange: (params: ListTransactionsParams) => void
}

export function TransactionList({
  params,
  onParamsChange,
}: TransactionListProps) {
  const { data, isPending, isError } = useTransactions(params)
  const deleteTxn = useDeleteTransaction()
  const restoreTxn = useRestoreTransaction()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  function handleRowClick(txn: Transaction) {
    setEditingTransaction(txn)
    setModalOpen(true)
  }

  function handleCreate() {
    setEditingTransaction(null)
    setModalOpen(true)
  }

  function handleDelete(txn: Transaction) {
    deleteTxn.mutate(txn.id, {
      onSuccess: () => {
        toast("Transaction deleted", {
          description: txn.description,
          action: {
            label: "Undo",
            onClick: () => restoreTxn.mutate(txn.id),
          },
          duration: 5000,
        })
      },
    })
  }

  if (isPending) return <TransactionListSkeleton />
  if (isError)
    return (
      <p className="text-destructive">Failed to load transactions.</p>
    )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilterBar params={params} onParamsChange={onParamsChange} />

      {/* Content */}
      {data.total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-1 text-lg font-medium">No transactions yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Start tracking your finances by adding your first transaction.
          </p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add your first transaction
          </Button>
        </div>
      ) : (
        <>
          <TransactionTable
            transactions={data.items}
            params={params}
            onParamsChange={onParamsChange}
            onRowClick={handleRowClick}
            onDelete={handleDelete}
          />
          <TransactionPagination
            page={data.page}
            totalPages={data.total_pages}
            onPageChange={(page) => onParamsChange({ ...params, page })}
          />
        </>
      )}

      {/* Modal */}
      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        transaction={editingTransaction}
      />
    </div>
  )
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
