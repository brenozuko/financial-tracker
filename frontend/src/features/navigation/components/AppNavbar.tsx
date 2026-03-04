import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Link, useRouter, useRouterState } from "@tanstack/react-router"
import {
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  RefreshCw,
  Settings,
  Sun,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

export function AppNavbar() {
  const router = useRouter()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  function handleLogout() {
    localStorage.removeItem("token")
    router.navigate({ to: "/auth/login" })
  }

  const isTransactionsActive = currentPath.startsWith("/transactions")
  const isDashboardActive = currentPath === "/"
  const isRecurringActive = currentPath.startsWith("/recurring-expenses")

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Finance Tracker</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">

          <Button
            variant={isDashboardActive ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            variant={isTransactionsActive ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              Transactions
            </Link>
          </Button>

          <Button
            variant={isRecurringActive ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/recurring-expenses" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recurring
            </Link>
          </Button>

        </div>

        {/* Right: User menu + mobile toggle */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  U
                </div>
                <span className="hidden sm:inline">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2"
                onSelect={(e) => e.preventDefault()}
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4" />
                <span className="flex-1">Dark mode</span>
                <Switch checked={resolvedTheme === "dark"} />
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-2 md:hidden">
          <Button
            variant={isTransactionsActive ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2"
            asChild
            onClick={() => setMobileOpen(false)}
          >
            <Link to="/transactions">
              <Receipt className="h-4 w-4" />
              Transactions
            </Link>
          </Button>
          <Button
            variant={isDashboardActive ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2"
            asChild
            onClick={() => setMobileOpen(false)}
          >
            <Link to="/">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={isRecurringActive ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start gap-2"
            asChild
            onClick={() => setMobileOpen(false)}
          >
            <Link to="/recurring-expenses">
              <RefreshCw className="h-4 w-4" />
              Recurring
            </Link>
          </Button>
        </div>
      )}
    </nav>
  )
}
