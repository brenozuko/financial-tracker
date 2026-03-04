export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      {message}
    </div>
  )
}
