# Architecture Guide

This document describes the structure and layer responsibilities of the backend.

---

## Directory Layout

```
backend/
├── src/app/
│   ├── main.py          # FastAPI app, CORS, router registration
│   ├── api/             # Route handlers (one file per resource)
│   ├── models/          # Pydantic request/response schemas (one file per resource)
│   ├── services/        # Business logic (one file per resource)
│   │   ├── base.py      # BaseService base class
│   │   └── filters.py   # Generic filter utility (FilterSpec + apply_filters)
│   ├── db/
│   │   ├── schema.py    # All SQLAlchemy models and enums
│   │   ├── session.py   # Engine creation and get_db generator
│   │   └── seed.py      # Default data seeding (idempotent)
│   └── core/
│       ├── config.py    # pydantic-settings (Settings singleton)
│       └── security.py  # JWT creation/validation, password hashing, CurrentUser dep
├── tests/
│   ├── conftest.py      # client_with_test_db fixture
│   ├── unit/            # Pure logic tests (no DB or HTTP)
│   └── integration/     # Full HTTP tests via TestClient
└── alembic/
    ├── env.py           # Alembic configuration
    └── versions/        # Auto-generated migration files
```

There is one file per layer per resource. When adding a new resource (`widgets`, for example), you create:

- `app/api/widgets.py`
- `app/models/widget.py`
- `app/services/widgets.py`
- A `Widget` ORM model in `app/db/schema.py`
- Router registration in `app/main.py`

---

## Layer Responsibilities

### `db/schema.py` — ORM Models

All SQLAlchemy declarative models live in a single file. Every model extends `Base`, which provides `id` (UUID PK), `created_at`, and `updated_at` (timezone-aware UTC).

Soft delete is the only form of deletion for user-owned data — models carry a `deleted_at` column and are filtered with `.filter(Model.deleted_at.is_(None))`. Physical rows are never removed.

Enums are `str, enum.Enum` subclasses mapped with `SAEnum`. Relationships use `relationship()` with `back_populates`; always eager-load via `joinedload()` to avoid N+1 queries.

### `models/` — Pydantic Schemas

Each resource defines three shapes: `*Create` (required fields), `*Update` (all optional, partial updates via `model_dump(exclude_unset=True)`), and `*Response` (includes `id`, timestamps, relationships; always uses `ConfigDict(from_attributes=True)`). Add a `Paginated*Response` wrapper for paginated list endpoints.

Input schemas validate with `@field_validator` (field-level) and `@model_validator(mode="after")` (cross-field).

### `services/` — Business Logic

All services extend `BaseService`, which holds the SQLAlchemy `session`. Services own all queries, enforce ownership by scoping queries to `user_id`, and raise `HTTPException` directly (`404` not found, `403` wrong owner, `409` conflict). They never know about routing — they receive Pydantic objects and return ORM instances.

`filters.py` provides a reusable `FilterSpec` + `apply_filters()` utility for services that support query-string filtering.

### `api/` — Route Handlers

Each router defines a local `get_*_service(db: Session = Depends(get_db))` factory and a module-level `*ServiceDep = Depends(...)` alias. Route handlers are thin — one call into the service, no business logic. Authenticated routes declare `current_user: CurrentUser`; always pass `current_user.id` (not the full object) into service methods. Static sub-routes (e.g. `/stats`) must be declared before parameterised routes (e.g. `/{id}`).

### `core/security.py` — Auth

Exposes `CurrentUser` (`Annotated[User, Depends(get_current_user)]`), the `create_access_token`, `hash_password`, and `verify_password` helpers. `get_current_user` decodes the JWT Bearer token and fetches the user from the DB — raises `401` on any failure.

### `core/config.py` — Settings

Single `settings` instance loaded from environment / `.env` via `pydantic-settings`. Alembic reads `settings.sqlalchemy_database_uri`.
