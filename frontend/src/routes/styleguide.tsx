import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export const Route = createFileRoute("/styleguide")({
  component: StyleguideLayout,
})

const NAV = [
  {
    section: "Foundation",
    items: [{ label: "Design Tokens", href: "/styleguide" }],
  },
  {
    section: "Components",
    items: [
      { label: "Buttons", href: "/styleguide/buttons" },
      { label: "Cards", href: "/styleguide/cards" },
      { label: "Badges & Alerts", href: "/styleguide/badges" },
    ],
  },
]

function StyleguideLayout() {
  const { location } = useRouterState()
  const pathname = location.pathname

  const { theme, setTheme } = useTheme()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <Link to="/styleguide" className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7h10M7 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Design System
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/styleguide"
                      ? pathname === "/styleguide" || pathname === "/styleguide/"
                      : pathname.startsWith(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href as "/styleguide"}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-primary font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        )}
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <span className={active ? "" : "pl-[14px]"}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer — theme toggle */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent p-1">
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all duration-150",
                theme === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="h-3 w-3 shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Dark</span>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all duration-150",
                theme === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sun className="h-3 w-3 shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Light</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
