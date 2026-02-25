# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Which document to read

Read only the documents that match your current task. Do not read all docs upfront.

| Task | Read this |
|---|---|
| Adding a new backend resource (end-to-end) | [`docs/backend/IMPLEMENTATION_CHECKLIST.md`](docs/backend/IMPLEMENTATION_CHECKLIST.md) |
| Adding a new frontend resource (end-to-end) | [`docs/frontend/IMPLEMENTATION_CHECKLIST.md`](docs/frontend/IMPLEMENTATION_CHECKLIST.md) |
| Refactoring backend code | [`docs/backend/IMPLEMENTATION_CHECKLIST.md § Refactoring`](docs/backend/IMPLEMENTATION_CHECKLIST.md) |
| Refactoring frontend code | [`docs/frontend/IMPLEMENTATION_CHECKLIST.md § Refactoring`](docs/frontend/IMPLEMENTATION_CHECKLIST.md) |
| Understanding backend layer responsibilities or data flow | [`docs/backend/ARCHITECTURE.md`](docs/backend/ARCHITECTURE.md) |
| Understanding frontend layer responsibilities or data flow | [`docs/frontend/ARCHITECTURE.md`](docs/frontend/ARCHITECTURE.md) |
| Looking up a specific backend coding pattern (ORM, service, router, test) | [`docs/backend/CODING_PATTERNS.md`](docs/backend/CODING_PATTERNS.md) |
| Looking up a specific frontend coding pattern (queries, forms, components) | [`docs/frontend/CODING_PATTERNS.md`](docs/frontend/CODING_PATTERNS.md) |

**Rule of thumb:** start with the checklist when building a feature; open ARCHITECTURE or CODING_PATTERNS only when the checklist references them or you need to understand the rationale behind a decision.

---

# General Rules

## Context7

Always use Context7 when you need code generation, setup or configuration steps, or library/API documentation. Use the Context7 MCP tools to resolve library IDs and fetch docs automatically — do not wait to be asked.

## Writing Implementation Plans

Write high-quality, maintainable code while avoiding over-engineering. Be pragmatic and follow the guidelines in the docs first before blindly following industry standards.

Implementation plans must always include build, lint, and integration tests when necessary. Provide explicit test commands covering happy paths and edge cases.

## Implementation and Testing

Always include integration tests to cover important paths. Test suites must cover happy paths and edge cases. Tests should give high confidence while keeping coverage meaningful over exhaustive.

## Database Entities and Migrations

Never create migrations manually — always generate them from ORM model changes:

```bash
make db-generate msg="describe change"   # autogenerate migration from db/schema.py changes
make db-upgrade                          # apply all pending migrations
make db-downgrade                        # roll back one migration
```

---

# Frontend (`frontend/`)

> All frontend work lives in `frontend/`. To implement a full feature end-to-end see [`docs/frontend/IMPLEMENTATION_CHECKLIST.md`](docs/frontend/IMPLEMENTATION_CHECKLIST.md). For architecture details see [`docs/frontend/ARCHITECTURE.md`](docs/frontend/ARCHITECTURE.md). For concrete coding patterns see [`docs/frontend/CODING_PATTERNS.md`](docs/frontend/CODING_PATTERNS.md).

## Package Manager

Always use **pnpm** — never use npm or yarn for the frontend.

```bash
pnpm install                # install dependencies
pnpm add <package>          # add a runtime dependency
pnpm add -D <package>       # add a dev-only dependency
pnpm remove <package>       # remove a dependency
```

## Adding ShadCN Components

Never hand-edit files in `frontend/src/components/ui/`. Add new primitives with the CLI:

```bash
pnpm dlx shadcn@latest add <component>   # e.g. button, dialog, input, select
```

## Development

```bash
pnpm dev       # Vite dev server with hot-reload
pnpm build     # type-check + production build
pnpm lint      # ESLint
```

---

# Backend (`backend/`)

> All backend work lives in `backend/`. To implement a full feature end-to-end see [`docs/backend/IMPLEMENTATION_CHECKLIST.md`](docs/backend/IMPLEMENTATION_CHECKLIST.md). For architecture details see [`docs/backend/ARCHITECTURE.md`](docs/backend/ARCHITECTURE.md). For concrete coding patterns see [`docs/backend/CODING_PATTERNS.md`](docs/backend/CODING_PATTERNS.md).

## Commands

### Dependencies

Always use the Poetry CLI — never edit `pyproject.toml` manually for dependencies.

```bash
poetry install --no-root          # install all dependencies (initial setup)
poetry add <package>              # add a runtime dependency
poetry add --group dev <package>  # add a dev-only dependency
poetry remove <package>           # remove a dependency
```

### Development

```bash
make run              # uvicorn dev server (hot-reload)
make test             # run all tests
```

Run a single test file:

```bash
poetry run pytest tests/integration/test_accounts_integration.py -v
```

Run a single test by name:

```bash
poetry run pytest -k "test_create_account" -v
```
