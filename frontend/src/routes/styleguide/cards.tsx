import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  ShoppingCart,
  Coffee,
  Wifi,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  Plus,
} from "lucide-react"

export const Route = createFileRoute("/styleguide/cards")({
  component: StyleguideCardsPage,
})

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-14">
      <div className="mb-6">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <Separator className="mt-3 bg-border/60" />
      </div>
      {children}
    </section>
  )
}

function SlotLabel({
  label,
  color,
}: {
  label: string
  color: string
}) {
  return (
    <span
      className={`absolute -left-[104px] top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest ${color} text-right w-24 hidden md:block`}
    >
      {label}
    </span>
  )
}

function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  iconColor,
}: {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs text-muted-foreground">
          {label}
        </CardDescription>
        <div className={`h-7 w-7 rounded-md ${iconColor} flex items-center justify-center`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-mono text-2xl font-semibold text-foreground">
          {value}
        </p>
        <p
          className={`text-xs mt-1 font-medium flex items-center gap-1 ${
            positive ? "text-[#50fa7b]" : "text-destructive"
          }`}
        >
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change} vs last month
        </p>
      </CardContent>
    </Card>
  )
}

const TRANSACTIONS = [
  {
    icon: ShoppingCart,
    iconBg: "bg-[#8be9fd]/15",
    iconColor: "text-[#8be9fd]",
    label: "Shopify — monthly plan",
    category: "SaaS",
    categoryStyle: "bg-[#8be9fd]/15 text-[#8be9fd] border-[#8be9fd]/30 border",
    amount: "-$79.00",
    positive: false,
    date: "Today",
  },
  {
    icon: ArrowUpRight,
    iconBg: "bg-[#50fa7b]/15",
    iconColor: "text-[#50fa7b]",
    label: "Client payment — Acme Co.",
    category: "Income",
    categoryStyle:
      "bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border",
    amount: "+$3,200.00",
    positive: true,
    date: "Yesterday",
  },
  {
    icon: Coffee,
    iconBg: "bg-[#ffb86c]/15",
    iconColor: "text-[#ffb86c]",
    label: "Blue Bottle Coffee",
    category: "Food & Drink",
    categoryStyle:
      "bg-[#ffb86c]/15 text-[#ffb86c] border-[#ffb86c]/30 border",
    amount: "-$6.50",
    positive: false,
    date: "Jun 30",
  },
  {
    icon: Wifi,
    iconBg: "bg-[#bd93f9]/15",
    iconColor: "text-[#bd93f9]",
    label: "Vercel Pro subscription",
    category: "Infra",
    categoryStyle:
      "bg-[#bd93f9]/15 text-[#bd93f9] border-[#bd93f9]/30 border",
    amount: "-$20.00",
    positive: false,
    date: "Jun 29",
  },
  {
    icon: ArrowDownLeft,
    iconBg: "bg-[#ff79c6]/15",
    iconColor: "text-[#ff79c6]",
    label: "Refund — AWS credits",
    category: "Refund",
    categoryStyle:
      "bg-[#ff79c6]/15 text-[#ff79c6] border-[#ff79c6]/30 border",
    amount: "+$120.00",
    positive: true,
    date: "Jun 28",
  },
]

function StyleguideCardsPage() {
  return (
    <div className="px-10 py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
            Dracula Theme
          </span>
        </div>
        <h1 className="font-mono text-4xl font-bold text-foreground tracking-tight leading-none">
          Cards
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Surface containers built on{" "}
          <code className="text-primary text-sm">shadcn/ui Card</code> — stat
          widgets, feature panels, lists, and empty states.
        </p>
      </div>

      {/* ── Anatomy ──────────────────────────────────────────────── */}
      <Section
        title="Anatomy"
        subtitle="Named slots: CardHeader · CardTitle · CardDescription · CardContent · CardFooter"
      >
        <div className="relative ml-28">
          <Card className="border-border bg-card max-w-md">
            {/* CardHeader */}
            <div className="relative border-l-2 border-[#8be9fd]/60 ml-0">
              <SlotLabel label="CardHeader" color="text-[#8be9fd]" />
              <CardHeader>
                {/* CardTitle */}
                <div className="relative border-l-2 border-[#bd93f9]/60 -ml-6 pl-4">
                  <SlotLabel label="CardTitle" color="text-[#bd93f9]" />
                  <CardTitle className="font-mono text-sm text-foreground">
                    Income vs Expenses
                  </CardTitle>
                </div>
                {/* CardDescription */}
                <div className="relative border-l-2 border-[#50fa7b]/60 -ml-6 pl-4 mt-1">
                  <SlotLabel label="CardDescription" color="text-[#50fa7b]" />
                  <CardDescription>Last 30 days — Jun 8 → Jul 5</CardDescription>
                </div>
              </CardHeader>
            </div>

            {/* CardContent */}
            <div className="relative border-l-2 border-[#ffb86c]/60 -ml-0">
              <SlotLabel label="CardContent" color="text-[#ffb86c]" />
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the main content area. Place charts, stats, forms, or
                  any arbitrary UI here. It receives{" "}
                  <code className="text-primary text-xs">px-6</code> padding by
                  default.
                </p>
              </CardContent>
            </div>

            {/* CardFooter */}
            <div className="relative border-l-2 border-[#ff79c6]/60 -ml-0">
              <SlotLabel label="CardFooter" color="text-[#ff79c6]" />
              <CardFooter className="border-t border-border pt-4 flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Updated just now
                </span>
                <Button size="xs" variant="outline">
                  View all
                </Button>
              </CardFooter>
            </div>
          </Card>
        </div>
      </Section>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <Section
        title="Stat Cards"
        subtitle="Financial KPI widgets — icon, value, and delta trend"
      >
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Revenue today"
            value="$1,036"
            change="21%"
            positive
            icon={TrendingUp}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            label="Total expenses"
            value="$4,597"
            change="0.7%"
            positive={false}
            icon={DollarSign}
            iconColor="bg-destructive/10 text-destructive"
          />
          <StatCard
            label="Potential savings"
            value="$1,870"
            change="12%"
            positive
            icon={Zap}
            iconColor="bg-[#f1fa8c]/10 text-[#f1fa8c]"
          />
          <StatCard
            label="Monthly activity"
            value="72%"
            change="8%"
            positive
            icon={Activity}
            iconColor="bg-[#bd93f9]/10 text-[#bd93f9]"
          />
        </div>
      </Section>

      {/* ── Feature Card ─────────────────────────────────────────── */}
      <Section
        title="Feature Card"
        subtitle="Full-width panel with gradient, period filter, numbers, and sparkline"
      >
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-base text-foreground">
                Income vs Expenses
              </CardTitle>
              <div className="flex gap-2">
                <Badge className="font-mono text-[10px] bg-secondary text-muted-foreground">
                  7d
                </Badge>
                <Badge className="font-mono text-[10px] bg-secondary text-muted-foreground">
                  30d
                </Badge>
                <Badge className="font-mono text-[10px] bg-primary/20 text-primary border border-primary/30">
                  90d
                </Badge>
              </div>
            </div>
            <CardDescription>Last 4 weeks — Jun 8 → Jul 5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8 mb-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
                  Income
                </p>
                <p className="font-mono text-2xl font-bold text-foreground">
                  $23,242
                  <span className="text-muted-foreground text-sm">.37</span>
                </p>
                <div className="h-0.5 w-full bg-primary/60 mt-2 rounded-full" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
                  Expenses
                </p>
                <p className="font-mono text-2xl font-bold text-foreground">
                  $4,597
                  <span className="text-muted-foreground text-sm">.55</span>
                </p>
                <div className="h-0.5 w-full bg-destructive/60 mt-2 rounded-full" />
              </div>
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end gap-1 h-16">
              {[
                30, 45, 55, 40, 65, 80, 72, 90, 85, 95, 78, 88, 70, 82, 92,
                85, 78, 95, 88, 100, 90, 95, 82, 88,
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/30 hover:bg-primary/60 transition-colors cursor-default"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-muted-foreground">
                Jun 8
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Jul 5
              </span>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── List Card ────────────────────────────────────────────── */}
      <Section
        title="List Card"
        subtitle="Recent transactions — icon, label + category badge, mono amount"
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-sm text-foreground">
                Recent Transactions
              </CardTitle>
              <Button size="xs" variant="ghost">
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {TRANSACTIONS.map((tx, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full ${tx.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <tx.icon className={`h-3.5 w-3.5 ${tx.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-foreground leading-none mb-1">
                        {tx.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 h-4 ${tx.categoryStyle}`}
                        >
                          {tx.category}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ${
                      tx.positive ? "text-[#50fa7b]" : "text-foreground"
                    }`}
                  >
                    {tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      {/* ── Empty State Card ─────────────────────────────────────── */}
      <Section
        title="Empty State Card"
        subtitle="Zero-data state with icon, message, and CTA"
      >
        <Card className="border-border border-dashed bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-sm font-semibold text-foreground mb-1">
              No transactions yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Connect a bank account or import a CSV file to start tracking your
              income and expenses.
            </p>
            <div className="flex gap-3">
              <Button>
                <Plus />
                Add Transaction
              </Button>
              <Button variant="outline">Import CSV</Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
