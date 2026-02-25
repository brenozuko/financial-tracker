import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  return (
    <div className="p-8">
      <h1 className="font-mono text-2xl font-bold text-foreground">Financial Tracker</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <Link to="/styleguide" className="text-primary underline underline-offset-4 hover:text-primary/80">
          View Design System →
        </Link>
      </p>
    </div>
  )
}
