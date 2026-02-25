# Frontend Coding Patterns

Concrete, copy-paste patterns to follow when adding new features. For architectural decisions and rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. Types (`types/api.ts`)

Mirror backend Pydantic `*Response` schemas exactly. Use `string` for UUIDs and ISO date strings.

```typescript
// types/api.ts

export type AccountType = "checking" | "savings" | "credit_card" | "cash" | "other"

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  type: "income" | "expense"
  amount: number
  description: string | null
  date: string
  is_reconciled: boolean
  account: Account
  category: Category | null
  created_at: string
  updated_at: string
}
```

**Rules:**
- One interface per backend resource. Match field names exactly (snake_case).
- Nullable backend fields → `T | null` (not `T | undefined`).
- Enums → string union types.
- Never import these types from the backend — maintain a copy here as the frontend contract.

---

## 2. API Client (`lib/api-client.ts`)

One base client. All `api.ts` files use it — never call `fetch` directly.

```typescript
// lib/api-client.ts

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
}
```

---

## 3. API Functions (`features/<resource>/api.ts`)

Typed wrappers over `apiClient`. No hooks, no React — plain async functions.

```typescript
// features/accounts/api.ts

import { apiClient } from "@/lib/api-client"
import type { Account } from "@/types/api"

export interface CreateAccountBody {
  name: string
  type: string
  balance?: number
  currency?: string
  description?: string
}

export interface UpdateAccountBody {
  name?: string
  type?: string
  balance?: number
  description?: string
}

export const accountsApi = {
  list: () =>
    apiClient.get<Account[]>("/accounts/"),

  get: (id: string) =>
    apiClient.get<Account>(`/accounts/${id}`),

  create: (body: CreateAccountBody) =>
    apiClient.post<Account>("/accounts/", body),

  update: (id: string, body: UpdateAccountBody) =>
    apiClient.patch<Account>(`/accounts/${id}`, body),

  delete: (id: string) =>
    apiClient.delete(`/accounts/${id}`),
}
```

**Rules:**
- Export a single object (`accountsApi`) with named methods — not individual exported functions.
- Input body types are defined here (not in `types/api.ts`, which is for responses only).
- All methods return the promise from `apiClient` directly — no try/catch here.

---

## 4. Query Key Factory + Hooks (`features/<resource>/queries.ts`)

Query keys are the single source of truth for cache identity. Define them as a factory object so they can be referenced consistently for invalidation.

```typescript
// features/accounts/queries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { accountsApi, type CreateAccountBody, type UpdateAccountBody } from "./api"
import type { Account } from "@/types/api"

// ── Query Key Factory ──────────────────────────────────────────────────────

export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  detail: (id: string) => [...accountKeys.all, "detail", id] as const,
}

// ── Queries ────────────────────────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: accountsApi.list,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountsApi.get(id),
  })
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountBody) => accountsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateAccountBody) => accountsApi.update(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData<Account>(accountKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: accountKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}
```

**Rules:**
- Always define `*Keys` factory in the same file as the hooks.
- `invalidateQueries` uses the key factory — never hardcode string arrays.
- On update, call `setQueryData` on the detail key **and** invalidate the list.
- On delete, call `removeQueries` on the detail key and invalidate the list.
- Never call `refetchQueries` — prefer `invalidateQueries` (it refetches only active queries).

---

## 5. Dependent Queries

When a query needs data from a previous query, gate it with `enabled`. Never chain `.then()` inside `queryFn` to fan out further queries.

```typescript
// features/transactions/queries.ts

export function useTransactionsByAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.byAccount(accountId ?? ""),
    queryFn:  () => transactionsApi.byAccount(accountId!),
    enabled:  !!accountId,   // query stays idle until accountId is available
  })
}
```

`fetchStatus === "idle"` when `enabled` is false; the component receives `data: undefined` and `isPending: false` — handle both states explicitly.

---

## 6. Data Selection / Transformation

Use `select` to derive values from cached data without changing what is stored. Memoize with `useCallback` so the selector reference stays stable.

```typescript
// Derive a count from the accounts list cache — same queryFn, different shape
export function useAccountCount() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn:  accountsApi.list,
    select:   useCallback((accounts: Account[]) => accounts.length, []),
  })
}

// Extract a single item from the list cache by id
export function useAccountFromList(id: string) {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn:  accountsApi.list,
    select:   useCallback(
      (accounts: Account[]) => accounts.find((a) => a.id === id),
      [id],
    ),
  })
}
```

Both hooks above share the same cache entry (`accountKeys.lists()`). Only the rendered value differs.

---

## 7. Optimistic Updates

Apply the mutation result to the cache immediately in `onMutate`, then roll back on `onError` and always invalidate on `onSettled` to sync with the server.

```typescript
// features/accounts/queries.ts

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateAccountBody) => accountsApi.update(id, body),

    onMutate: async (body) => {
      // 1. Cancel in-flight refetches to avoid overwriting the optimistic value
      await queryClient.cancelQueries({ queryKey: accountKeys.detail(id) })

      // 2. Snapshot the current value for rollback
      const previous = queryClient.getQueryData<Account>(accountKeys.detail(id))

      // 3. Immediately apply the change to the cache
      queryClient.setQueryData<Account>(accountKeys.detail(id), (old) =>
        old ? { ...old, ...body } : old,
      )

      return { previous }
    },

    onError: (_err, _body, ctx) => {
      // Roll back to snapshot
      if (ctx?.previous) {
        queryClient.setQueryData(accountKeys.detail(id), ctx.previous)
      }
    },

    onSettled: () => {
      // Always refetch to ensure cache is consistent with server
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}
```

**Rules:**
- `onMutate` → cancel, snapshot, apply optimistic update, return snapshot.
- `onError` → restore snapshot.
- `onSettled` (runs after both success and error) → invalidate to sync server state.
- Only use optimistic updates when the latency is noticeable and the rollback UX is acceptable.

---

## 8. Prefetching

Populate the cache before a component mounts to eliminate loading states on navigation. Common places: link hover handlers, parent route loaders, or `<Link onMouseEnter>`.

```typescript
// Prefetch account detail on hover — call this in your link component
export function usePrefetchAccount() {
  const queryClient = useQueryClient()
  return (id: string) =>
    queryClient.prefetchQuery({
      queryKey: accountKeys.detail(id),
      queryFn:  () => accountsApi.get(id),
      // Do not refetch if cached data is less than 30 seconds old
      staleTime: 30_000,
    })
}
```

```tsx
// Usage in a list item
const prefetchAccount = usePrefetchAccount()

<button onMouseEnter={() => prefetchAccount(account.id)}>
  View account
</button>
```

`prefetchQuery` returns `Promise<void>` — it is safe to fire and forget.

---

## 9. Suspense Mode (`useSuspenseQuery`)

`useSuspenseQuery` removes the need for `isPending` checks — `data` is always defined at render time. Wrap the component in `<Suspense>` for loading and `QueryErrorResetBoundary` + `<ErrorBoundary>` for errors.

```tsx
// features/accounts/AccountDetail.tsx (suspense variant)

import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { accountKeys } from "./queries"
import { accountsApi } from "./api"

function AccountDetailContent({ accountId }: { accountId: string }) {
  // data is always defined here — no isPending check needed
  const { data: account } = useSuspenseQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn:  () => accountsApi.get(accountId),
  })

  return <div>{account.name}</div>
}

export function AccountDetail({ accountId }: { accountId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <div>
              <p className="text-destructive">{error.message}</p>
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          <Suspense fallback={<AccountDetailSkeleton />}>
            <AccountDetailContent accountId={accountId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

**When to use suspense mode:**
- Leaf data-display components where simpler render logic outweighs the boundary boilerplate.
- Parallel data requirements (use `useSuspenseQueries` — all fire simultaneously, none waterfalls):

```tsx
import { useSuspenseQueries } from "@tanstack/react-query"

const [accountQuery, transactionsQuery] = useSuspenseQueries({
  queries: [
    { queryKey: accountKeys.detail(id), queryFn: () => accountsApi.get(id) },
    { queryKey: transactionKeys.byAccount(id), queryFn: () => transactionsApi.byAccount(id) },
  ],
})
```

**When NOT to use:** forms or components that conditionally fetch — stick with `useQuery` + `enabled`.

---

## 10. Forms (React Hook Form)

All forms use **React Hook Form** (`react-hook-form`). Never manage form state with `useState` per-field.

### Basic pattern

```tsx
import { useForm } from "react-hook-form"

interface FormValues {
  name: string
  type: AccountType
  balance: number
  description: string
}

function AccountForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { balance: 0 },
  })

  function onSubmit(values: FormValues) { /* call mutate */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name", { required: "Name is required" })} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>Save</Button>
    </form>
  )
}
```

### `Controller` for ShadCN Select / Checkbox / other controlled primitives

ShadCN's `Select`, `Checkbox`, and similar components do not forward a native `ref`, so `register()` won't work. Use `Controller` instead:

```tsx
import { useForm, Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormValues {
  type: AccountType
}

function AccountTypeField({ control }: { control: Control<FormValues> }) {
  return (
    <Controller
      name="type"
      control={control}
      rules={{ required: "Account type is required" }}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )}
    />
  )
}
```

**Rule of thumb:** use `register` for `<Input>`, `<Textarea>`, and native `<input>` / `<select>` elements; use `Controller` for any ShadCN component that controls its own state internally.

### Edit forms — pre-populate from query data

Pass `defaultValues` from the query result to show existing data. Reset when the dialog opens so stale values are cleared:

```tsx
const { data: account } = useAccount(accountId)

const { register, handleSubmit, reset } = useForm<FormValues>({
  defaultValues: {
    name:        account?.name ?? "",
    type:        account?.type ?? "checking",
    description: account?.description ?? "",
  },
})

// Reset to fresh server data whenever the dialog re-opens
useEffect(() => {
  if (open && account) reset({ name: account.name, type: account.type, description: account.description ?? "" })
}, [open, account, reset])
```

### Wiring to a mutation

Call `mutate` inside `onSubmit`. Close/reset the form only in `onSuccess` — not before:

```tsx
const { mutate: createAccount, isPending } = useCreateAccount()
const { register, handleSubmit, reset } = useForm<FormValues>()

function onSubmit(values: FormValues) {
  createAccount(values, {
    onSuccess: () => {
      reset()
      onOpenChange(false)
    },
  })
}
```

**Rules:**
- Always type `FormValues` as a dedicated interface — never use `any`.
- `defaultValues` must be provided for every field to prevent uncontrolled → controlled warnings.
- Use `errors.<field>.message` for inline validation messages. Always show them adjacent to the field, not only in a toast.
- Disable the submit button with `disabled={isPending}` — never `isSubmitting` from RHF when the async work is inside a mutation (the form considers itself submitted before the network call finishes).
- Put cache-level side effects (`invalidateQueries`, `setQueryData`) in `queries.ts`; put UI-level side effects (`reset`, `onOpenChange`) in the `onSuccess` callback passed to `mutate()`.

---

## 11. QueryClient Setup (`routes/__root.tsx`)

`QueryClientProvider` lives at the root so all routes share a single cache.

```tsx
// routes/__root.tsx

import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 minute — avoid refetching on every mount
      retry: 1,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </QueryClientProvider>
  ),
})
```

---

## 12. Route Components (`routes/<resource>/index.tsx`)

Routes are thin. Read params, render feature components. No data-fetching logic here.

```tsx
// routes/accounts/index.tsx

import { createFileRoute } from "@tanstack/react-router"
import { AccountList } from "@/features/accounts/AccountList"

export const Route = createFileRoute("/accounts/")({
  component: AccountsPage,
})

function AccountsPage() {
  return (
    <div className="p-6">
      <AccountList />
    </div>
  )
}
```

For routes with path params:

```tsx
// routes/accounts/$accountId.tsx

import { createFileRoute } from "@tanstack/react-router"
import { AccountDetail } from "@/features/accounts/AccountDetail"

export const Route = createFileRoute("/accounts/$accountId")({
  component: AccountDetailPage,
})

function AccountDetailPage() {
  const { accountId } = Route.useParams()
  return <AccountDetail accountId={accountId} />
}
```

---

## 13. Feature Components

Feature components consume query hooks and render ShadCN primitives.

### List component

```tsx
// features/accounts/AccountList.tsx

import { useAccounts } from "./queries"
import { AccountCard } from "./AccountCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function AccountList() {
  const { data: accounts, isPending, isError } = useAccounts()

  if (isPending) return <AccountListSkeleton />
  if (isError) return <p className="text-destructive">Failed to load accounts.</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button>Add account</Button>
      </div>
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">No accounts yet.</p>
      ) : (
        <div className="grid gap-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}

function AccountListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}
```

**Rules:**
- Always handle `isPending` and `isError` explicitly — never skip them.
- Render a `Skeleton` while loading (not a spinner for list views).
- Render a plain, readable error message on `isError` — do not throw.
- Empty state must be handled separately from loading state.

### Mutation with form

See [section 10](#10-forms-react-hook-form) for the full React Hook Form patterns, including `Controller` usage for ShadCN Select/Checkbox and edit-form pre-population.

Quick reminder of the wiring between a dialog and a mutation:

```tsx
// features/accounts/CreateAccountDialog.tsx

export function CreateAccountDialog({ open, onOpenChange }: Props) {
  const { mutate: createAccount, isPending } = useCreateAccount()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  function onSubmit(values: FormValues) {
    createAccount(values, {
      onSuccess: () => { reset(); onOpenChange(false) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

---

## 14. Design System Usage

### Prefer the design system at every layer

Reach for an existing component before writing raw HTML. The hierarchy is:

1. **ShadCN primitive** (`components/ui/`) — the default building block for any standard UI element.
2. **Shared composite** (`components/`) — a project-level component built on top of ShadCN primitives. Use when the same composition of primitives appears in more than one feature.
3. **Feature component** (`features/<resource>/`) — only when the UI is genuinely specific to one resource and will never be reused.

Never reach for raw HTML (`<div>`, `<button>`, `<input>`) when a ShadCN primitive already exists for that element.

### ShadCN primitives (`components/ui/`)

Auto-generated by the CLI — **never hand-edit these files.**

```bash
pnpm dlx shadcn@latest add <component>   # e.g. button, dialog, input, select, badge
```

Compose with `className` using `cn()`. Never use inline `style` props:

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ✅ Variant prop for semantic intent
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>

// ✅ cn() for conditional classes
<Button className={cn("w-full", isLoading && "opacity-50")} />

// ❌ Inline styles bypass the design system
<Button style={{ backgroundColor: "red" }}>Delete</Button>
```

**Available variant props (Button):** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Available size props (Button):** `default`, `sm`, `lg`, `icon`

### Extracting shared composites (`components/`)

When the **same composition of primitives appears in two or more places**, extract it into `components/`. This is the rule of three: the first time, write it inline; the second time, note the duplication; the third time (or when it appears in a second feature), extract it.

Shared composites are feature-agnostic — they accept only generic props, never query hooks or feature-specific types:

```tsx
// components/PageHeader.tsx — used by any page, knows nothing about accounts/transactions
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode   // slot for a feature-specific button
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
```

```tsx
// components/ConfirmDialog.tsx — generic destructive action confirmation
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  isPending?: boolean
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, isPending }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Extraction checklist:**
- Does this exact UI appear (or will appear) in more than one feature? → extract to `components/`
- Does it need to know which resource it belongs to? → keep it in `features/<resource>/`
- Does it wrap a single ShadCN primitive with only minor additions? → just use `cn()` at the call site, no extraction needed

Use `cn()` (from `lib/utils.ts`) whenever you need to merge conditional classes:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("rounded-lg border p-4", isActive && "border-primary bg-primary/5")} />
```

### Prefer Tailwind v4 syntax

This project uses Tailwind CSS v4. Always use the v4 canonical utility name — never fall back to v3 aliases.

Key renames:

| v3 (avoid)            | v4 (use)              |
|-----------------------|-----------------------|
| `bg-gradient-to-br`   | `bg-linear-to-br`     |
| `bg-gradient-to-tr`   | `bg-linear-to-tr`     |
| `bg-gradient-to-r`    | `bg-linear-to-r`      |
| `shadow-sm`           | `shadow-xs`           |
| `ring-offset-*`       | `outline-offset-*`    |

### Prefer canonical Tailwind classes over arbitrary values

Use the canonical class when Tailwind provides one — avoid arbitrary value syntax for values that have a direct equivalent.

```tsx
// ✅ Canonical
<div className="flex-3" />
```

Never write `flex-[3]` when `flex-3` exists. This applies to any utility that accepts a numeric scale (`flex-*`, `order-*`, `col-span-*`, etc.). Reserve `[...]` for values with no canonical class (e.g. `w-[372px]`, `grid-cols-[1fr_2fr]`).

---

## 15. Error Handling

Errors from mutations surface via the `error` property returned by `useMutation`. Display them near the relevant UI:

```tsx
const { mutate, isPending, error } = useCreateAccount()

{error instanceof ApiError && error.status === 409 && (
  <p className="text-sm text-destructive">An account with this name already exists.</p>
)}
```

For unexpected errors, use a toast (when a toast component is wired up):

```tsx
const { mutate } = useCreateAccount()

mutate(values, {
  onError: (err) => {
    toast.error(err instanceof ApiError ? err.message : "Something went wrong")
  },
})
```

---

## Quick Checklist for a New Resource

1. `types/api.ts` — Add response interface(s)
2. `features/<resource>/api.ts` — Add `<resource>Api` object with typed methods
3. `features/<resource>/queries.ts` — Add `<resource>Keys` factory, `use*` query/mutation hooks; add `enabled`, `select`, or `onMutate`/`onSettled` where needed
4. `features/<resource>/<Component>.tsx` — Build list, detail, and form components; handle `isPending`, `isError`, and empty state
5. `routes/` — Add a route file if a dedicated page is needed
6. `components/ui/` — Run `pnpm dlx shadcn@latest add <component>` for any new primitives
