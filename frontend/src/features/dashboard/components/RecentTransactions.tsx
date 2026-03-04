import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { TRANSACTIONS } from "../data/mockData"

function fmt(n: number) {
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return n >= 0 ? `+$${abs}` : `-$${abs}`
}

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul>
          {TRANSACTIONS.map((tx, i) => (
            <li key={tx.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      tx.income
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500",
                    )}
                  >
                    {tx.income ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
                    {tx.category}
                  </Badge>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      tx.income ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {fmt(tx.amount)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
