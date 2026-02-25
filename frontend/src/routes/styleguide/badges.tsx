import { createFileRoute } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ShoppingCart,
  Coffee,
  Wifi,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

export const Route = createFileRoute("/styleguide/badges")({
  component: StyleguideBadgesPage,
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

function LabeledItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

const INLINE_TRANSACTIONS = [
  {
    icon: ShoppingCart,
    iconBg: "bg-[#8be9fd]/15",
    iconColor: "text-[#8be9fd]",
    label: "Shopify — monthly plan",
    status: "Scheduled",
    statusStyle:
      "bg-[#bd93f9]/15 text-[#bd93f9] border-[#bd93f9]/30 border text-[10px]",
    category: "SaaS",
    categoryStyle:
      "bg-[#8be9fd]/15 text-[#8be9fd] border-[#8be9fd]/30 border text-[10px]",
    amount: "-$79.00",
    positive: false,
  },
  {
    icon: ArrowUpRight,
    iconBg: "bg-[#50fa7b]/15",
    iconColor: "text-[#50fa7b]",
    label: "Client payment — Acme Co.",
    status: "Confirmed",
    statusStyle:
      "bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border text-[10px]",
    category: "Income",
    categoryStyle:
      "bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border text-[10px]",
    amount: "+$3,200.00",
    positive: true,
  },
  {
    icon: Coffee,
    iconBg: "bg-[#ffb86c]/15",
    iconColor: "text-[#ffb86c]",
    label: "Blue Bottle Coffee",
    status: "Pending",
    statusStyle:
      "bg-[#ffb86c]/15 text-[#ffb86c] border-[#ffb86c]/30 border text-[10px]",
    category: "Food & Drink",
    categoryStyle:
      "bg-[#ffb86c]/15 text-[#ffb86c] border-[#ffb86c]/30 border text-[10px]",
    amount: "-$6.50",
    positive: false,
  },
  {
    icon: Wifi,
    iconBg: "bg-[#bd93f9]/15",
    iconColor: "text-[#bd93f9]",
    label: "Vercel Pro subscription",
    status: "Overdue",
    statusStyle:
      "bg-destructive/15 text-destructive border-destructive/30 border text-[10px]",
    category: "Infra",
    categoryStyle:
      "bg-[#bd93f9]/15 text-[#bd93f9] border-[#bd93f9]/30 border text-[10px]",
    amount: "-$20.00",
    positive: false,
  },
  {
    icon: ArrowDownLeft,
    iconBg: "bg-[#ff79c6]/15",
    iconColor: "text-[#ff79c6]",
    label: "Refund — AWS credits",
    status: "Confirmed",
    statusStyle:
      "bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border text-[10px]",
    category: "Refund",
    categoryStyle:
      "bg-[#ff79c6]/15 text-[#ff79c6] border-[#ff79c6]/30 border text-[10px]",
    amount: "+$120.00",
    positive: true,
  },
]

function StyleguideBadgesPage() {
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
          Badges &amp; Alerts
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Compact status indicators and contextual messages built on{" "}
          <code className="text-primary text-sm">shadcn/ui Badge</code> and{" "}
          <code className="text-primary text-sm">Alert</code>.
        </p>
      </div>

      {/* ── Badge Variants ───────────────────────────────────────── */}
      <Section
        title="Badge Variants"
        subtitle="All six shadcn/ui variants using Dracula tokens"
      >
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label="default">
            <Badge>Default</Badge>
          </LabeledItem>
          <LabeledItem label="secondary">
            <Badge variant="secondary">Secondary</Badge>
          </LabeledItem>
          <LabeledItem label="outline">
            <Badge variant="outline">Outline</Badge>
          </LabeledItem>
          <LabeledItem label="destructive">
            <Badge variant="destructive">Destructive</Badge>
          </LabeledItem>
          <LabeledItem label="ghost">
            <Badge variant="ghost">Ghost</Badge>
          </LabeledItem>
          <LabeledItem label="link">
            <Badge variant="link">Link</Badge>
          </LabeledItem>
        </div>
      </Section>

      {/* ── Semantic Badges ──────────────────────────────────────── */}
      <Section
        title="Semantic Badges"
        subtitle="Custom financial status badges via className overrides"
      >
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label="Income">
            <Badge className="bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border">
              Income
            </Badge>
          </LabeledItem>
          <LabeledItem label="Expense">
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border">
              Expense
            </Badge>
          </LabeledItem>
          <LabeledItem label="Pending">
            <Badge className="bg-[#ffb86c]/15 text-[#ffb86c] border-[#ffb86c]/30 border">
              Pending
            </Badge>
          </LabeledItem>
          <LabeledItem label="Scheduled">
            <Badge className="bg-[#bd93f9]/15 text-[#bd93f9] border-[#bd93f9]/30 border">
              Scheduled
            </Badge>
          </LabeledItem>
          <LabeledItem label="Pro Plan">
            <Badge className="bg-primary/15 text-primary border-primary/30 border">
              Pro Plan
            </Badge>
          </LabeledItem>
          <LabeledItem label="Overdue">
            <Badge className="bg-destructive/15 text-destructive border-destructive/40 border font-semibold">
              Overdue
            </Badge>
          </LabeledItem>
        </div>
      </Section>

      {/* ── With Icons ───────────────────────────────────────────── */}
      <Section
        title="With Icons"
        subtitle="Badges combining a 3×3 lucide icon with status text"
      >
        <div className="flex flex-wrap items-end gap-6">
          <LabeledItem label="Income">
            <Badge className="bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border gap-1">
              <TrendingUp className="h-3 w-3" />
              +21% Income
            </Badge>
          </LabeledItem>
          <LabeledItem label="Expense">
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border gap-1">
              <TrendingDown className="h-3 w-3" />
              -0.7% Spend
            </Badge>
          </LabeledItem>
          <LabeledItem label="Pending">
            <Badge className="bg-[#ffb86c]/15 text-[#ffb86c] border-[#ffb86c]/30 border gap-1">
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          </LabeledItem>
          <LabeledItem label="Confirmed">
            <Badge className="bg-[#50fa7b]/15 text-[#50fa7b] border-[#50fa7b]/30 border gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Confirmed
            </Badge>
          </LabeledItem>
          <LabeledItem label="Overdue">
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          </LabeledItem>
        </div>
      </Section>

      {/* ── Alert Variants ───────────────────────────────────────── */}
      <Section
        title="Alert Variants"
        subtitle="System feedback messages — default, destructive, success, warning"
      >
        <div className="space-y-3">
          {/* shadcn default */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold font-mono">
              Default Alert
            </AlertTitle>
            <AlertDescription className="text-xs">
              Your session will expire in 30 minutes. Save your work to avoid
              losing changes.
            </AlertDescription>
          </Alert>

          {/* shadcn destructive */}
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold font-mono">
              Payment Failed
            </AlertTitle>
            <AlertDescription className="text-xs">
              We couldn't charge your card ending in 4242. Please update your
              billing information.
            </AlertDescription>
          </Alert>

          {/* custom success */}
          <Alert className="border-[#50fa7b]/40 bg-[#50fa7b]/8">
            <CheckCircle2 className="h-4 w-4 text-[#50fa7b]" />
            <AlertTitle className="text-[#50fa7b] text-sm font-semibold font-mono">
              Transaction Confirmed
            </AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              $3,200.00 from Acme Co. has been deposited into your checking
              account.
            </AlertDescription>
          </Alert>

          {/* custom warning */}
          <Alert className="border-[#ffb86c]/40 bg-[#ffb86c]/8">
            <AlertTriangle className="h-4 w-4 text-[#ffb86c]" />
            <AlertTitle className="text-[#ffb86c] text-sm font-semibold font-mono">
              High Spending Detected
            </AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              Your SaaS spend is 42% above your monthly budget. Review your
              subscriptions to stay on track.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ── Inline Usage ─────────────────────────────────────────── */}
      <Section
        title="Inline Usage"
        subtitle="Real transaction list combining status and category badges in context"
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
              {INLINE_TRANSACTIONS.map((tx, i) => (
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
                      <p className="text-sm text-foreground leading-none mb-1.5">
                        {tx.label}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Badge className={tx.statusStyle}>{tx.status}</Badge>
                        <Badge className={tx.categoryStyle}>
                          {tx.category}
                        </Badge>
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
    </div>
  )
}
