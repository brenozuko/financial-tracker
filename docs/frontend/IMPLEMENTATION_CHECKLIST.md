# Frontend Implementation Checklist

Use this checklist when adding a new resource or feature. Work through every section in order. **The implementation is not done until `pnpm build` and `pnpm test:e2e` pass.**

For patterns and code examples, see [CODING_PATTERNS.md](CODING_PATTERNS.md). For architectural rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## E2E Test Infrastructure Setup (first-time only)

If the project does not yet have Playwright installed, set it up before writing tests:

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

Create `playwright.config.ts` at the repo root:

```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
})
```

Add to `package.json` scripts:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

---

## Adding a New Resource

### 1. Types (`types/api.ts`)

- [ ] Response interface mirrors backend `*Response` schema exactly (snake_case field names)
- [ ] Nullable backend fields typed as `T | null` — not `T | undefined`
- [ ] Enums as string union types, not TypeScript `enum`
- [ ] `id`, `created_at`, `updated_at` always present on response types

### 2. API Functions (`features/<resource>/api.ts`)

- [ ] Single exported object (`<resource>Api`) with named methods
- [ ] All methods delegate to `apiClient` — never call `fetch` directly
- [ ] Request body types (`Create*Body`, `Update*Body`) defined in this file — not in `types/api.ts`
- [ ] No React, no hooks — plain async functions only

### 3. Query Key Factory + Hooks (`features/<resource>/queries.ts`)

- [ ] `<resource>Keys` factory object with `all`, `lists()`, and `detail(id)` keys
- [ ] `use<Resource>s()` — list query using `<resource>Keys.lists()`
- [ ] `use<Resource>(id)` — detail query using `<resource>Keys.detail(id)`
- [ ] `useCreate<Resource>()` — mutation; `onSuccess` invalidates `lists()`
- [ ] `useUpdate<Resource>(id)` — mutation; `onSuccess` calls `setQueryData` on detail key AND invalidates `lists()`
- [ ] `useDelete<Resource>()` — mutation; `onSuccess` calls `removeQueries` on detail key AND invalidates `lists()`
- [ ] No hardcoded query key strings — always reference the factory
- [ ] Dependent queries use `enabled` — never chain `.then()` inside `queryFn`

### 4. Feature Components (`features/<resource>/`)

- [ ] List component handles `isPending` (skeleton), `isError` (error message), and empty state
- [ ] `Skeleton` used for loading state in list views (not a spinner)
- [ ] Form uses React Hook Form — never `useState` per field
- [ ] `register` for native `<input>` / `<textarea>`; `Controller` for ShadCN Select, Checkbox, and other controlled primitives
- [ ] `defaultValues` provided for every field
- [ ] Submit button disabled with `isPending` from mutation (not `isSubmitting` from RHF)
- [ ] Cache side effects (`invalidateQueries`, `setQueryData`) in `queries.ts`; UI side effects (`reset`, `onOpenChange`) in the `onSuccess` callback passed to `mutate()`
- [ ] `ApiError` checked for status-specific inline error messages
- [ ] No raw `<div>`, `<button>`, or `<input>` when a ShadCN primitive exists for that element

### 5. Route (`routes/`)

- [ ] Route file uses `createFileRoute`
- [ ] Route component is thin — reads params, renders feature component, no data-fetching logic
- [ ] Route added to the file-based router (file creation triggers auto-generation of `routeTree.gen.ts`)

### 6. ShadCN Primitives

- [ ] Any new ShadCN primitive added via CLI — never hand-edit `components/ui/`

```bash
pnpm dlx shadcn@latest add <component>
```

---

## E2E Tests

E2E tests cover **critical paths only** — the flows a user must be able to complete for the feature to be considered working. Do not write E2E tests for error states, loading states, or edge cases; those are verified by `pnpm build` (type safety) and backend integration tests.

Tests live in `e2e/<resource>.spec.ts`. Each spec runs against the real dev server and real backend — no mocking.

### Critical paths to cover

**1. List loads**

```ts
// e2e/accounts.spec.ts
import { test, expect } from "@playwright/test"

test("accounts page loads and shows list", async ({ page }) => {
  await page.goto("/accounts")
  await expect(page.getByRole("heading", { name: /accounts/i })).toBeVisible()
  // If seeded data exists, assert at least one item; otherwise assert empty state
})
```

**2. Create**

```ts
test("user can create an account", async ({ page }) => {
  await page.goto("/accounts")

  await page.getByRole("button", { name: /add account/i }).click()
  await page.getByLabel(/name/i).fill("My Checking")
  await page.getByRole("combobox", { name: /type/i }).selectOption("checking")
  await page.getByRole("button", { name: /create/i }).click()

  // Item appears in the list without a page reload — confirms cache invalidation works
  await expect(page.getByText("My Checking")).toBeVisible()
})
```

**3. Delete**

```ts
test("user can delete an account", async ({ page }) => {
  // Create the item first so the test is self-contained
  await page.goto("/accounts")
  await page.getByRole("button", { name: /add account/i }).click()
  await page.getByLabel(/name/i).fill("To Delete")
  await page.getByRole("button", { name: /create/i }).click()
  await expect(page.getByText("To Delete")).toBeVisible()

  // Delete it
  await page.getByRole("row", { name: /to delete/i }).getByRole("button", { name: /delete/i }).click()
  await page.getByRole("button", { name: /confirm/i }).click()

  // Item disappears — confirms soft delete reflected in UI
  await expect(page.getByText("To Delete")).not.toBeVisible()
})
```

### Required cases per resource

- [ ] List page navigates and renders without error
- [ ] Create: form submit → item appears in list (no reload)
- [ ] Delete: confirm dialog → item disappears from list (no reload)
- [ ] Update (if the resource has an edit flow): edit form submit → updated value visible in list

### Running tests

```bash
pnpm test:e2e          # run all E2E tests (headless)
pnpm test:e2e:ui       # Playwright UI mode for debugging
pnpm build             # must pass — catches TypeScript errors
pnpm lint              # must pass — catches linting errors
```

**The implementation is blocked if `pnpm test:e2e` or `pnpm build` does not pass.**

---

## Refactoring

A refactor changes structure without changing observable behaviour. **If `pnpm test:e2e` or `pnpm build` breaks after your change, the refactor introduced a bug — stop and fix it before continuing.**

### Before you start

- [ ] Run `pnpm test:e2e` and `pnpm build` — both must be green before you touch anything
- [ ] Read every file you plan to change; understand what it does before modifying it
- [ ] Identify the single concern you are addressing (rename, extract, move, simplify) — do not mix concerns in one change

### Layer discipline

- [ ] Data-fetching logic (`useQuery`, `useMutation`) that has crept into a route or component → move it to `queries.ts`
- [ ] Raw `fetch` calls inside a component or hook → move them to `api.ts` via `apiClient`
- [ ] Shared UI that appears in more than one feature → extract to `components/` (feature-agnostic props only, no query hooks)
- [ ] After moving, confirm the originating file no longer directly imports `apiClient`, `useQuery`, or `useMutation`

### Query key changes

- [ ] When renaming a resource or restructuring its key factory, update every `invalidateQueries`, `removeQueries`, and `setQueryData` call site that references the old keys — hardcoded string arrays here cause silent cache bugs with no TypeScript error
- [ ] Verify the renamed keys with a test: assert that list re-fetches after a mutation

### Component extraction

- [ ] Before extracting to `components/`, confirm the new component accepts only generic props — no feature-specific types, no query hooks
- [ ] After extraction, the original feature file must not change rendering behaviour — run existing component tests to confirm
- [ ] Never extract into `components/ui/` — that directory is owned by the ShadCN CLI; add extracted composites to `components/` directly

### ShadCN and styling

- [ ] Never migrate a component away from a ShadCN primitive during a refactor
- [ ] Never hand-edit `components/ui/` — if a primitive needs updating, re-run `pnpm dlx shadcn@latest add <component>`
- [ ] Replace any inline `style` props introduced by previous code with `cn()` and Tailwind classes

### Type changes (`types/api.ts`)

- [ ] Renaming or removing a field in `types/api.ts` is a breaking change — run `pnpm build` immediately after to catch all downstream usages before declaring done
- [ ] Field names must remain snake_case to match backend `*Response` schemas — never rename to camelCase here
- [ ] Nullable fields remain `T | null`; never tighten to non-nullable during a refactor unless the backend schema changed

### Naming and imports

- [ ] After renaming a function, hook, or file, search for all import sites and update them
- [ ] Query hook names follow the convention: `use<Resource>s` (list), `use<Resource>` (detail), `useCreate<Resource>`, `useUpdate<Resource>`, `useDelete<Resource>`
- [ ] Key factory names follow: `<resource>Keys` co-located in `queries.ts`

### Verification

- [ ] `pnpm test:e2e` passes — identical result to the baseline recorded before starting
- [ ] `pnpm build` passes — no new TypeScript errors
- [ ] `pnpm lint` passes — no new lint warnings

---

## Checklist Summary

```
[ ] types/api.ts                         — response interfaces
[ ] features/<resource>/api.ts           — apiClient wrappers
[ ] features/<resource>/queries.ts       — key factory + hooks
[ ] features/<resource>/<Component>.tsx  — list, detail, form components
[ ] routes/<resource>/                   — thin route file(s)
[ ] components/ui/                       — pnpm dlx shadcn if needed
[ ] e2e/<resource>.spec.ts               — list loads, create, delete, update
[ ] pnpm test:e2e                        — E2E suite passes
[ ] pnpm build                           — type-check passes
[ ] pnpm lint                            — linting passes
```
