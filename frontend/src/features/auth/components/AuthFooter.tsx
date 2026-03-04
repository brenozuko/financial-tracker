export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border -mx-6 px-6 pt-4 mt-6">
      <p className="text-sm text-center text-muted-foreground">{children}</p>
    </div>
  )
}
