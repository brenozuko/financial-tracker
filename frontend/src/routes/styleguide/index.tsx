import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createFileRoute } from "@tanstack/react-router"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Info,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react"

export const Route = createFileRoute("/styleguide/")({
  component: StyleguideTokensPage,
})

// ─── Color swatch data ──────────────────────────────────────────────────────

const CATPPUCCIN_PALETTE = [
  { name: "Blue", hex: "#89b4fa", var: "--chart-1", cls: "bg-[#89b4fa]" },
  { name: "Green", hex: "#a6e3a1", var: "--chart-2", cls: "bg-[#a6e3a1]" },
  { name: "Mauve", hex: "#cba6f7", var: "--chart-3", cls: "bg-[#cba6f7]" },
  { name: "Pink", hex: "#f5c2e7", var: "--chart-4", cls: "bg-[#f5c2e7]" },
  { name: "Peach", hex: "#fab387", var: "--chart-5", cls: "bg-[#fab387]" },
  { name: "Red", hex: "#f38ba8", var: "--destructive", cls: "bg-[#f38ba8]" },
  { name: "Yellow", hex: "#f9e2af", var: "—", cls: "bg-[#f9e2af]" },
]

const SURFACE_PALETTE = [
  { name: "Sidebar", token: "--sidebar", cls: "bg-sidebar", hex: "#181825" },
  { name: "Background", token: "--background", cls: "bg-background", hex: "#1e1e2e" },
  { name: "Card", token: "--card", cls: "bg-card", hex: "#313244" },
  { name: "Popover", token: "--popover", cls: "bg-popover", hex: "#45475a" },
  { name: "Secondary", token: "--secondary", cls: "bg-secondary", hex: "#45475a" },
  { name: "Muted", token: "--muted", cls: "bg-muted", hex: "#313244" },
]

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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

// ─── Color swatch ────────────────────────────────────────────────────────────

function Swatch({
  label,
  hex,
  token,
  colorClass,
}: {
  label: string
  hex: string
  token?: string
  colorClass: string
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div
        className={`h-16 w-full ${colorClass} transition-transform group-hover:scale-y-110 origin-bottom`}
      />
      <div className="px-3 py-2.5">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{hex}</p>
        {token && (
          <p className="font-mono text-[10px] text-accent mt-0.5">{token}</p>
        )}
      </div>
    </div>
  )
}

// ─── Typography specimen ─────────────────────────────────────────────────────

function TypeSpecimen({
  family,
  label,
  sample,
  mono = false,
  size,
  weight,
}: {
  family: string
  label: string
  sample: string
  mono?: boolean
  size: string
  weight: string
}) {
  return (
    <div className="border border-border rounded-lg bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{family}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">{label} · {size} · {weight}</p>
        </div>
      </div>
      <p
        className={`text-foreground/90 leading-snug ${mono ? "font-mono" : ""}`}
        style={{ fontSize: size, fontWeight: weight }}
      >
        {sample}
      </p>
    </div>
  )
}

// ─── Radius demo ─────────────────────────────────────────────────────────────

function RadiusDemo({ label, cls }: { label: string; cls: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-14 w-24 bg-primary/20 border-2 border-primary/60 ${cls}`}
      />
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

// ─── Stat card demo ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
}: {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs text-muted-foreground">{label}</CardDescription>
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-mono text-2xl font-semibold text-foreground">{value}</p>
        <p className={`text-xs mt-1 font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? "↑" : "↓"} {change} vs last month
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function StyleguideTokensPage() {
  return (
    <div className="px-10 py-10 max-w-5xl">
      {/* Page header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
            Catppuccin Mocha
          </span>
        </div>
        <h1 className="font-mono text-4xl font-bold text-foreground tracking-tight leading-none">
          Design Tokens
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          The complete token reference for the Financial Tracker design system,
          built on the Catppuccin Mocha palette with{" "}
          <code className="text-primary text-sm">JetBrains Mono</code> +{" "}
          <span className="text-accent font-medium">Outfit</span>.
        </p>
      </div>

      {/* ── Chromatic palette ─────────────────────────────────────── */}
      <Section title="Chromatic Palette" subtitle="The seven Catppuccin Mocha accent colors">
        <div className="grid grid-cols-7 gap-3">
          {CATPPUCCIN_PALETTE.map((c) => (
            <Swatch
              key={c.name}
              label={c.name}
              hex={c.hex}
              token={c.var !== "—" ? c.var : undefined}
              colorClass={c.cls}
            />
          ))}
        </div>
      </Section>

      {/* ── Surface palette ───────────────────────────────────────── */}
      <Section title="Surface Palette" subtitle="Dark surfaces layered from deepest to most elevated">
        <div className="grid grid-cols-6 gap-3">
          {SURFACE_PALETTE.map((s) => (
            <Swatch
              key={s.name}
              label={s.name}
              hex={s.hex}
              token={s.token}
              colorClass={s.cls}
            />
          ))}
        </div>
      </Section>

      {/* ── Semantic colors ───────────────────────────────────────── */}
      <Section title="Semantic Colors" subtitle="Status and meaning — derived from the Catppuccin Mocha palette">
        <div className="grid grid-cols-2 gap-3">
          <Alert className="border-primary/40 bg-primary/8">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary text-sm font-semibold font-mono">Primary — Blue</AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              <code>#89b4fa</code> · oklch(0.750 0.123 268) · Focus rings, CTAs, active states
            </AlertDescription>
          </Alert>

          <Alert className="border-success/40 bg-success/8">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success text-sm font-semibold font-mono">Success — Green</AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              <code>#a6e3a1</code> · oklch(0.860 0.094 147) · Positive changes, confirmed states
            </AlertDescription>
          </Alert>

          <Alert className="border-warning/40 bg-warning/8">
            <TriangleAlert className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning text-sm font-semibold font-mono">Warning — Peach</AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              <code>#fab387</code> · oklch(0.786 0.110 58) · Caution, pending, attention needed
            </AlertDescription>
          </Alert>

          <Alert className="border-destructive/40 bg-destructive/8">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive text-sm font-semibold font-mono">Destructive — Red</AlertTitle>
            <AlertDescription className="text-muted-foreground text-xs">
              <code>#f38ba8</code> · oklch(0.724 0.132 10) · Errors, deletions, irreversible actions
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ── Typography ────────────────────────────────────────────── */}
      <Section title="Typography" subtitle="JetBrains Mono for data & code · Outfit for UI copy">
        <div className="space-y-3">
          <TypeSpecimen
            family="JetBrains Mono"
            label="Display / Data"
            sample="$23,242.37"
            mono
            size="2.5rem"
            weight="700"
          />
          <TypeSpecimen
            family="JetBrains Mono"
            label="Heading"
            sample="Financial Overview — Q2 2026"
            mono
            size="1.5rem"
            weight="600"
          />
          <TypeSpecimen
            family="JetBrains Mono"
            label="Label / Token"
            sample="--color-primary: oklch(0.750 0.123 268)"
            mono
            size="0.875rem"
            weight="400"
          />
          <TypeSpecimen
            family="Outfit"
            label="Body / UI"
            sample="Your spending on SaaS &amp; Software has gone up significantly in the last 30 days."
            size="1rem"
            weight="400"
          />
          <TypeSpecimen
            family="Outfit"
            label="Subheading"
            sample="Accounts · Transactions · Cards · Accounting"
            size="0.875rem"
            weight="500"
          />
        </div>
      </Section>

      {/* ── Border radius ─────────────────────────────────────────── */}
      <Section title="Border Radius" subtitle="Base radius 0.5rem — harmonically scaled">
        <div className="flex items-end gap-8">
          <RadiusDemo label="none" cls="rounded-none" />
          <RadiusDemo label="radius-sm (2px)" cls="rounded-sm" />
          <RadiusDemo label="radius-md (4px)" cls="rounded-md" />
          <RadiusDemo label="radius-lg (8px)" cls="rounded-lg" />
          <RadiusDemo label="radius-xl (12px)" cls="rounded-xl" />
          <RadiusDemo label="radius-2xl (16px)" cls="rounded-2xl" />
          <RadiusDemo label="full" cls="rounded-full" />
        </div>
      </Section>

      {/* ── Buttons ───────────────────────────────────────────────── */}
      <Section title="Buttons" subtitle="All shadcn/ui button variants using Catppuccin tokens">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">
            <Zap className="mr-1.5 h-4 w-4" />
            Large
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      {/* ── Badges ────────────────────────────────────────────────── */}
      <Section title="Badges" subtitle="Compact status indicators">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          {/* custom semantic badges */}
          <Badge className="bg-success/15 text-success border-success/30 border">+21% Income</Badge>
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 border">-0.7% Spend</Badge>
          <Badge className="bg-warning/15 text-warning border-warning/30 border">Pending</Badge>
          <Badge className="bg-accent/15 text-accent border-accent/30 border">Pro Plan</Badge>
        </div>
      </Section>

      {/* ── Cards — real finance widgets ──────────────────────────── */}
      <Section title="Cards" subtitle="Financial stat cards using the token system">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Revenue today"
            value="$1,036"
            change="21%"
            positive
            icon={TrendingUp}
          />
          <StatCard
            label="Avg customer spend"
            value="$244"
            change="0.7%"
            positive={false}
            icon={DollarSign}
          />
          <StatCard
            label="Potential savings"
            value="$1,870"
            change="12%"
            positive
            icon={Zap}
          />
          <StatCard
            label="Monthly activity"
            value="72%"
            change="8%"
            positive
            icon={Activity}
          />
        </div>

        {/* Feature card */}
        <Card className="mt-4 border-primary/20 bg-linear-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono text-base text-foreground">
                Income vs Expenses
              </CardTitle>
              <div className="flex gap-2">
                <Badge className="font-mono text-[10px] bg-secondary text-muted-foreground">7d</Badge>
                <Badge className="font-mono text-[10px] bg-secondary text-muted-foreground">30d</Badge>
                <Badge className="font-mono text-[10px] bg-primary/20 text-primary border border-primary/30">90d</Badge>
              </div>
            </div>
            <CardDescription>Last 4 weeks — Jun 8 → Jul 5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8 mb-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Income</p>
                <p className="font-mono text-2xl font-bold text-foreground">
                  $23,242<span className="text-muted-foreground text-sm">.37</span>
                </p>
                <div className="h-0.5 w-full bg-primary/60 mt-2 rounded-full" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Expenses</p>
                <p className="font-mono text-2xl font-bold text-foreground">
                  $4,597<span className="text-muted-foreground text-sm">.55</span>
                </p>
                <div className="h-0.5 w-full bg-destructive/60 mt-2 rounded-full" />
              </div>
            </div>
            {/* Simulated sparkline bars */}
            <div className="flex items-end gap-1 h-16">
              {[30, 45, 55, 40, 65, 80, 72, 90, 85, 95, 78, 88, 70, 82, 92, 85, 78, 95, 88, 100, 90, 95, 82, 88].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/30 hover:bg-primary/60 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-muted-foreground">Jun 8</span>
              <span className="font-mono text-[10px] text-muted-foreground">Jul 5</span>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Chart colors ──────────────────────────────────────────── */}
      <Section title="Chart Colors" subtitle="Five harmonious Catppuccin Mocha colors for data visualization">
        <div className="flex gap-3">
          {[
            { label: "chart-1", var: "--chart-1", name: "Blue / Sapphire" },
            { label: "chart-2", var: "--chart-2", name: "Green" },
            { label: "chart-3", var: "--chart-3", name: "Mauve" },
            { label: "chart-4", var: "--chart-4", name: "Pink" },
            { label: "chart-5", var: "--chart-5", name: "Peach" },
          ].map((c) => (
            <div key={c.label} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md"
                style={{ height: "48px", backgroundColor: `var(${c.var})` }}
              />
              <div className="text-center">
                <p className="font-mono text-[10px] text-muted-foreground">{c.label}</p>
                <p className="text-[10px] text-foreground/60">{c.name}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Stacked bar preview */}
        <div className="mt-4 h-3 rounded-full overflow-hidden flex">
          <div className="h-full flex-3 bg-[--chart-1]" />
          <div className="h-full flex-2 bg-[--chart-2]" />
          <div className="h-full flex-1.5 bg-[--chart-3]" />
          <div className="h-full flex-1 bg-[--chart-4]" />
          <div className="h-full flex-0.8 bg-[--chart-5]" />
        </div>
      </Section>

      {/* ── Design summary ────────────────────────────────────────── */}
      <Section title="Design Summary">
        <Card className="border-accent/20 bg-linear-to-br from-card via-card to-accent/5">
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 font-mono text-sm">
              {[
                ["Primary color", "#89b4fa — Mocha Blue"],
                ["Accent color", "#cba6f7 — Mocha Mauve"],
                ["Background", "#1e1e2e — Mocha Base"],
                ["Display font", "JetBrains Mono"],
                ["Body font", "Outfit"],
                ["Border radius", "0.5rem (8px)"],
                ["Style", "Soft-dark, readable, data-driven"],
                ["Overall feel", "Comfortable clarity for long sessions"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <span className="text-muted-foreground text-xs shrink-0">{k}:</span>
                  <span className="text-foreground text-xs truncate">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
