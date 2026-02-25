# Architecture Guide

This document describes the structure, conventions, and design decisions of this codebase so that the pattern can be replicated consistently when adding new features.

---

## Stack

| Concern | Library |
|---|---|
| Runtime | Python 3.11 |
| Package manager | Poetry |
| Web framework | FastAPI 0.129 |
| Server | Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Validation | Pydantic 2.0 |
| Config | pydantic-settings |
| Database | PostgreSQL (psycopg2) |
| Testing | pytest + httpx |

---

## Directory Layout

```
src/
└── app/
    ├── main.py          # FastAPI app, CORS, router registration
    ├── api/             # Route handlers (one file per resource)
    ├── models/          # Pydantic request/response schemas (one file per resource)
    ├── services/        # Business logic (one class per resource)
    ├── db/
    │   ├── schema.py    # All SQLAlchemy models and enums
    │   └── session.py   # Engine creation and get_db generator
    └── core/
        ├── config.py    # Pydantic-settings (Settings singleton)
        └── deps.py      # All FastAPI Depends providers and *Dep aliases
```

There is one file per layer per resource. When adding a new resource (`widgets`, for example), you create:

- `app/api/widgets.py`
- `app/models/widget.py`
- `app/services/widgets.py`
- A `Widget` model class in `app/db/schema.py`
- Router registration in `app/main.py`

---

## Layer Responsibilities

### 1. `db/schema.py` — ORM Models

All SQLAlchemy declarative models live in a single file. Every model extends `Base`, which provides:
- `id: UUID` (primary key, auto-generated)
- `created_at: datetime` (timezone-aware)
- `updated_at: datetime` (timezone-aware)

**Soft delete** is the only form of deletion. Every deletable model has:
```python
deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
```

All queries filter with `.filter(Model.deleted_at.is_(None))`. Setting `deleted_at = datetime.now(timezone.utc)` is the delete operation. Physical rows are never removed.

Enums are Python `enum.Enum` (or `IntEnum`) subclasses defined in the same file and mapped with `SAEnum`.

### 2. `models/` — Pydantic Schemas

Each resource has three schema shapes:
- `*Create` — fields required to create the resource (no `id`, no timestamps)
- `*Update` — all fields optional (use `Optional[T] = None`), only set fields are applied
- `*Response` — includes `id`, timestamps, and resolved relationships; always has `model_config = ConfigDict(from_attributes=True)`

Input schemas use `@field_validator` for validation (not-empty checks, format checks). Update methods use `model_dump(exclude_unset=True)` to avoid overwriting fields the caller did not send.

```python
# Standard update pattern in service layer
updates = body.model_dump(exclude_unset=True)
for field, value in updates.items():
    setattr(db_obj, field, value)
session.commit()
session.refresh(db_obj)
```

### 3. `services/` — Business Logic

All services extend `BaseService`:
```python
class BaseService:
    def __init__(self, session: Session) -> None:
        self.session = session
```

Services own all database queries and raise `HTTPException` directly (not in the API layer). Standard HTTP status codes used:
- `404` — resource not found
- `409` — uniqueness conflict
- `400` — bad request (e.g. missing config)
- `422` — validation failure
- `503` — downstream service failure (e.g. AI call)

Services do not know about HTTP routing — they receive parsed Pydantic objects and return ORM instances (FastAPI serialises them via the `response_model`).

**Exception for ReportsService**: it requires additional collaborators (`SettingsService` and an AI client factory) that are injected via `__init__`, not inherited from `BaseService`. Use this pattern when a service has external dependencies.

### 4. `api/` — Route Handlers

Routers own their own dependency injection. Each router file defines a `get_*_service` factory that instantiates the service with a fresh `SessionLocal()`, and passes it to `Depends` directly on the route parameter.

```python
# api/widgets.py
from fastapi import APIRouter, Depends
from app.db.schema import SessionLocal
from app.services.widgets import WidgetService
from app.models.widget import WidgetCreate, WidgetResponse

router = APIRouter(prefix="/widgets", tags=["widgets"])

def get_widget_service() -> WidgetService:
    return WidgetService(session=SessionLocal())

@router.post("/", response_model=WidgetResponse, status_code=201)
def create_widget(body: WidgetCreate, service: WidgetService = Depends(get_widget_service)) -> WidgetResponse:
    return service.create_widget(body)
```

For services with additional collaborators (e.g. `ReportsService`), the factory assembles them inline:

```python
def get_reports_service() -> ReportsService:
    session = SessionLocal()
    return ReportsService(
        session=session,
        settings_service=SettingsService(session),
        ai_client_factory=build_ai_client,
    )
```

Do not add business logic, queries, or conditional branching to routers. Static routes (e.g. `/bulk-complete`, `/reorder`) must be declared **before** parameterised routes (e.g. `/{id}`) to avoid FastAPI treating them as path parameters.

> **Note:** `core/deps.py` exists in the current codebase but is not the pattern going forward. New routers should define their dependencies locally as shown above. Do not add new entries to `deps.py`.

### 5. `core/config.py` — Settings

`pydantic-settings` reads from environment variables (and `.env` via `python-dotenv`). The module exposes a single `settings` instance. Alembic's `env.py` reads `settings.sqlalchemy_database_uri`.

---

## AI Client Architecture

`services/ai_client.py` defines an `AIClient` Protocol with a single method:
```python
async def complete(self, *, system_prompt: str, user_prompt: str) -> str: ...
```

Three concrete implementations exist: `OpenAIClient`, `AnthropicClient`, `OllamaClient`. The `build_ai_client` factory function resolves the correct implementation from the `ai_provider` enum stored in `Settings`.

`ReportsService` receives the factory as a constructor argument (`ai_client_factory: callable`), making it straightforward to substitute in tests without patching module globals.

---

## Database

- Database is PostgreSQL (psycopg2). Set `DATABASE_URL` to a `postgresql://` connection string.
- Schema migrations use **Alembic**. After changing `db/schema.py`, generate a migration with `make db-generate`.
- The `Settings` ORM model is a singleton row: `id = "default"`. `SettingsService.get_or_create_settings()` inserts it on first access.
- `sort_order` is a `Float` column used for client-side drag-and-drop ordering. Tasks have a second `sort_order_board` for board-view ordering.

---

## Testing

Integration tests use `TestClient` with an isolated SQLite database. The `client_with_test_db` fixture in `conftest.py`:
1. Creates a temporary `.db` file
2. Runs `Base.metadata.create_all` against it
3. Overrides `get_db` via `app.dependency_overrides`
4. Deletes the file after the test

```python
def test_create_widget(client_with_test_db):
    resp = client_with_test_db.post("/api/widgets/", json={"name": "Foo"})
    assert resp.status_code == 201
```

---

## Request Flow

```
HTTP Request
    → FastAPI router (api/*.py)
        → Local Depends injects service (services/*.py)
            → Service queries DB via session (db/schema.py)
            → Service raises HTTPException on error
        → Router returns ORM object
    → FastAPI serialises via response_model (models/*.py)
HTTP Response
```

---

## Adding a New Resource — Checklist

1. **`db/schema.py`** — Add ORM model extending `Base`. Add `deleted_at` if soft-deletable. Add enums if needed.
2. **`alembic`** — Run `make db-generate` to create the migration.
3. **`models/<resource>.py`** — Add `*Create`, `*Update`, `*Response` Pydantic schemas.
4. **`services/<resource>.py`** — Add service class extending `BaseService`. Raise `HTTPException` for all error cases.
5. **`api/<resource>.py`** — Add `APIRouter`. Define `get_*_service` and `*ServiceDep` locally at the top of the file. Keep route handlers thin.
7. **`main.py`** — Register the new router with `app.include_router(resource.router, prefix=PREFIX)`.
8. **`tests/integration/test_<resource>_integration.py`** — Add integration tests using `client_with_test_db`.
