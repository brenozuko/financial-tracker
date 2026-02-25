import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ThemeProvider } from "@/components/theme-provider"

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </ThemeProvider>
  ),
})
