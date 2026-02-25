import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  Settings,
  Zap,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Download,
  Trash2,
} from "lucide-react"

export const Route = createFileRoute("/styleguide/buttons")({
  component: StyleguideButtonsPage,
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

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="mt-4 rounded-lg bg-muted px-4 py-3 border border-border/50">
      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
        {children}
      </pre>
    </div>
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
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="font-mono text-[10px] text-muted-foreground text-center">
        {label}
      </span>
    </div>
  )
}

function StyleguideButtonsPage() {
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
          Buttons
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          All button variants, sizes, and interaction states built on{" "}
          <code className="text-primary text-sm">shadcn/ui</code> with Dracula
          tokens.
        </p>
      </div>

      {/* ── Variants ─────────────────────────────────────────────── */}
      <Section
        title="Variants"
        subtitle="Six semantic variants for every context"
      >
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label="default">
            <Button>Default</Button>
          </LabeledItem>
          <LabeledItem label="secondary">
            <Button variant="secondary">Secondary</Button>
          </LabeledItem>
          <LabeledItem label="outline">
            <Button variant="outline">Outline</Button>
          </LabeledItem>
          <LabeledItem label="ghost">
            <Button variant="ghost">Ghost</Button>
          </LabeledItem>
          <LabeledItem label="destructive">
            <Button variant="destructive">Destructive</Button>
          </LabeledItem>
          <LabeledItem label="link">
            <Button variant="link">Link</Button>
          </LabeledItem>
        </div>
        <CodeBlock>{`<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}</CodeBlock>
      </Section>

      {/* ── Sizes ────────────────────────────────────────────────── */}
      <Section title="Sizes" subtitle="Four text button sizes — xs through lg">
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label='size="xs"'>
            <Button size="xs">Extra Small</Button>
          </LabeledItem>
          <LabeledItem label='size="sm"'>
            <Button size="sm">Small</Button>
          </LabeledItem>
          <LabeledItem label="default size">
            <Button>Default</Button>
          </LabeledItem>
          <LabeledItem label='size="lg"'>
            <Button size="lg">Large</Button>
          </LabeledItem>
        </div>
        <CodeBlock>{`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>`}</CodeBlock>
      </Section>

      {/* ── Icon Buttons ─────────────────────────────────────────── */}
      <Section
        title="Icon Buttons"
        subtitle="Square icon-only variants at every size"
      >
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label='size="icon-xs"'>
            <Button size="icon-xs" variant="outline">
              <Plus />
            </Button>
          </LabeledItem>
          <LabeledItem label='size="icon-sm"'>
            <Button size="icon-sm" variant="outline">
              <Search />
            </Button>
          </LabeledItem>
          <LabeledItem label='size="icon" (default)'>
            <Button size="icon" variant="outline">
              <Settings />
            </Button>
          </LabeledItem>
          <LabeledItem label='size="icon-lg"'>
            <Button size="icon-lg" variant="outline">
              <Zap />
            </Button>
          </LabeledItem>
          <LabeledItem label="icon — primary">
            <Button size="icon">
              <Plus />
            </Button>
          </LabeledItem>
          <LabeledItem label="icon — ghost">
            <Button size="icon" variant="ghost">
              <Settings />
            </Button>
          </LabeledItem>
        </div>
        <CodeBlock>{`<Button size="icon-xs" variant="outline"><Plus /></Button>
<Button size="icon-sm" variant="outline"><Search /></Button>
<Button size="icon"><Plus /></Button>
<Button size="icon-lg" variant="outline"><Zap /></Button>`}</CodeBlock>
      </Section>

      {/* ── With Icons ───────────────────────────────────────────── */}
      <Section
        title="With Icons"
        subtitle="Text buttons with leading or trailing icons"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Download />
            Export CSV
          </Button>
          <Button variant="outline">
            New Transaction
            <ArrowRight />
          </Button>
          <Button variant="secondary">
            <Plus />
            Add Account
          </Button>
          <Button variant="ghost">
            <Search />
            Search
          </Button>
          <Button disabled>
            <Loader2 className="animate-spin" />
            Saving…
          </Button>
          <Button variant="destructive">
            <Trash2 />
            Delete
          </Button>
        </div>
        <CodeBlock>{`{/* Leading icon */}
<Button><Download /> Export CSV</Button>

{/* Trailing icon */}
<Button variant="outline">New Transaction <ArrowRight /></Button>

{/* Loading state */}
<Button disabled><Loader2 className="animate-spin" /> Saving…</Button>`}</CodeBlock>
      </Section>

      {/* ── States ───────────────────────────────────────────────── */}
      <Section
        title="States"
        subtitle="Normal, focused, disabled, and loading — default variant"
      >
        <div className="flex flex-wrap items-end gap-8">
          <LabeledItem label="normal">
            <Button>Pay Now</Button>
          </LabeledItem>
          <LabeledItem label="focus-visible (ring)">
            <Button className="ring-[3px] ring-ring/50 border-ring">
              Pay Now
            </Button>
          </LabeledItem>
          <LabeledItem label="disabled">
            <Button disabled>Pay Now</Button>
          </LabeledItem>
          <LabeledItem label="loading + disabled">
            <Button disabled>
              <Loader2 className="animate-spin" />
              Processing…
            </Button>
          </LabeledItem>
          <LabeledItem label="outline — disabled">
            <Button variant="outline" disabled>
              Cancel
            </Button>
          </LabeledItem>
          <LabeledItem label="ghost — disabled">
            <Button variant="ghost" disabled>
              View
            </Button>
          </LabeledItem>
        </div>
        <CodeBlock>{`{/* Disabled */}
<Button disabled>Pay Now</Button>

{/* Loading */}
<Button disabled>
  <Loader2 className="animate-spin" />
  Processing…
</Button>`}</CodeBlock>
      </Section>

      {/* ── Danger Zone ──────────────────────────────────────────── */}
      <Section
        title="Danger Zone"
        subtitle="Destructive actions at every size — always pair with a confirmation"
      >
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <p className="font-mono text-xs text-destructive/70 uppercase tracking-widest mb-5">
            Irreversible actions
          </p>
          <div className="flex flex-wrap items-end gap-8">
            <LabeledItem label='size="xs"'>
              <Button size="xs" variant="destructive">
                <AlertTriangle />
                Remove
              </Button>
            </LabeledItem>
            <LabeledItem label='size="sm"'>
              <Button size="sm" variant="destructive">
                <AlertTriangle />
                Delete
              </Button>
            </LabeledItem>
            <LabeledItem label="default size">
              <Button variant="destructive">
                <AlertTriangle />
                Delete Account
              </Button>
            </LabeledItem>
            <LabeledItem label='size="lg"'>
              <Button size="lg" variant="destructive">
                <AlertTriangle />
                Permanently Delete
              </Button>
            </LabeledItem>
            <LabeledItem label="icon — destructive">
              <Button size="icon" variant="destructive">
                <Trash2 />
              </Button>
            </LabeledItem>
            <LabeledItem label="outline — danger">
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
              >
                <Trash2 />
                Remove
              </Button>
            </LabeledItem>
          </div>
        </div>
        <CodeBlock>{`<Button variant="destructive">
  <AlertTriangle />
  Delete Account
</Button>

{/* Outline danger (custom) */}
<Button
  variant="outline"
  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
>
  <Trash2 /> Remove
</Button>`}</CodeBlock>
      </Section>
    </div>
  )
}
