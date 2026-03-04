import { createFileRoute } from "@tanstack/react-router"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your application preferences.
      </p>

      <Separator className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Choose how Finance Tracker looks for you. The system option follows
            your device preference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const isActive = theme === value
              return (
                <Button
                  key={value}
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
