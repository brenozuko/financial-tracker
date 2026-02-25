---
name: design-system
description: Extract a repeated UI pattern into a shared composite component in `components/`. Use this skill when the user asks to create, extract, or promote a component to the design system, or when a UI pattern is duplicated across features.
---

You are extracting or creating a shared UI component for the financial-tracker frontend design system. Follow the project's architecture exactly.

## Context

Read these files before doing anything else:

- `docs/frontend/ARCHITECTURE.md` — directory layout and layer responsibilities
- `docs/frontend/CODING_PATTERNS.md` — section 14 (Design System Usage) for the full rules

## Layer Decision

Before writing code, decide which layer the component belongs to:

| Layer | Path | Rule |
|---|---|---|
| ShadCN primitive | `frontend/src/components/ui/` | Standard UI element that doesn't exist yet → run the CLI, never hand-edit |
| Shared composite | `frontend/src/components/` | Same UI composition appears (or will appear) in 2+ features; feature-agnostic props only |
| Feature component | `frontend/src/features/<resource>/` | UI is specific to one resource and will never be reused |

If the user is asking to add a missing ShadCN primitive, output the install command and stop — do not write the file manually:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Extracting a Shared Composite

When extracting from existing feature code:

1. **Identify the repetition** — find every place the pattern currently appears and note the props that vary between usages.
2. **Define the interface** — use only generic, feature-agnostic prop names. Never accept query hooks, resource-specific types (`Account`, `Transaction`), or mutation functions as props. Pass data as primitives or generic React types (`React.ReactNode`, `string`, `boolean`, etc.).
3. **Create the file** in `frontend/src/components/<ComponentName>.tsx`.
4. **Replace all call sites** — update every feature file that had the duplicated pattern to import from `@/components/<ComponentName>`.
5. **Verify** — the new component must not import from any `features/` directory.

## Component Template

```tsx
// components/<ComponentName>.tsx

import { cn } from "@/lib/utils"
// import only from @/components/ui/* and react

interface <ComponentName>Props {
  // generic props only — no resource-specific types
}

export function <ComponentName>({ ... }: <ComponentName>Props) {
  return (
    // composed from ShadCN primitives + cn()
  )
}
```

## Rules

- **No inline styles** — use `cn()` from `@/lib/utils` for all conditional class merging.
- **Variant and size props over booleans** — prefer `variant: "destructive" | "default"` over `isDestructive: boolean` when the prop maps to visual intent.
- **Slot pattern for variable content** — accept `React.ReactNode` props (e.g. `action`, `footer`, `icon`) instead of trying to enumerate every possible child.
- **No data fetching** — shared composites are pure presentational components. They receive data as props and emit callbacks; they never call `useQuery` or `useMutation`.
- **No feature imports** — a component in `components/` must never import from `features/`.
- **Export named, not default** — always `export function Foo` not `export default function Foo`.

## Common Shared Composites to Consider

| Component | When to extract |
|---|---|
| `PageHeader` | Title + optional description + optional action button appears on 2+ pages |
| `ConfirmDialog` | Destructive confirmation dialog appears for 2+ resources |
| `DataTable` | Table with consistent column/row structure used across multiple features |
| `EmptyState` | Empty list illustration + message + optional CTA used in 2+ list views |
| `StatusBadge` | Colored badge for a status/type field used across multiple resources |
| `SectionCard` | Card wrapper with title, description, and content slot used in 2+ places |

## Output Format

1. State which layer the component belongs to and why.
2. If ShadCN CLI is needed, output the command and stop.
3. Otherwise, write the full component file.
4. List every call site that needs to be updated, with the specific import change.
5. If extracting from existing code, show the before/after diff for one representative call site.
