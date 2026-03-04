import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { STATS } from "../data/mockData"

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {stat.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {stat.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                )}
                <span
                  className={cn(
                    "font-mono text-xs font-medium tabular-nums",
                    stat.positive ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {stat.delta}
                </span>
                <span className="text-xs text-muted-foreground">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
