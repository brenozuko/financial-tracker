import { TrendingUp } from "lucide-react"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Agility</span>
          <span className="text-xs text-muted-foreground mt-0.5">Personal Finance Tracker</span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
