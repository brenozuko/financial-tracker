import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "../data/mockData"

export function SpendingByCategory() {
  const totalSpend = CATEGORIES.reduce((s, c) => s + c.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {CATEGORIES.map((cat) => {
          const pct = (cat.amount / totalSpend) * 100
          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{cat.name}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  ${cat.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-right font-mono text-[10px] text-muted-foreground">
                {pct.toFixed(1)}%
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
