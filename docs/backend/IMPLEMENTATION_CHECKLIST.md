# Backend Implementation Checklist

Use this checklist when adding a new resource or feature. Work through every section in order. **The implementation is not done until `make test` passes.**

For patterns and code examples, see [CODING_PATTERNS.md](CODING_PATTERNS.md). For architectural rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Adding a New Resource

### 1. ORM Model (`db/schema.py`)

- [ ] Model extends `Base` — never define your own `id`, `created_at`, or `updated_at`
- [ ] `deleted_at: Mapped[Optional[datetime]]` added for every soft-deletable model
- [ ] Enums defined at top of file, before any model that references them
- [ ] `mapped_column()` used only when extra config is needed (length, timezone, enum name, FK, default) — never for `nullable` alone
- [ ] Relationships use `back_populates`
- [ ] No business logic or validation in ORM models

### 2. Database Migration

- [ ] Run `make db-generate msg="add <resource>"` — never write migration files by hand
- [ ] Run `make db-upgrade` to apply
- [ ] Verify the generated file in `alembic/versions/` looks correct

### 3. Pydantic Schemas (`models/<resource>.py`)

- [ ] `*Create` — required fields only; `@field_validator` for non-empty string checks
- [ ] `*Update` — every field `Optional[T] = None`; validators check `if v is not None` before validating
- [ ] `*Response` — includes `id`, `created_at`, `updated_at`; has `model_config = ConfigDict(from_attributes=True)`
- [ ] Nested `*Response` shapes for any eager-loaded relationships

### 4. Service (`services/<resource>.py`)

- [ ] Extends `BaseService`
- [ ] `list_*` method filters `.filter(Model.deleted_at.is_(None))` and orders by `sort_order`
- [ ] `get_*` raises `HTTPException(status_code=404)` if row not found
- [ ] All other methods call `get_*` first to resolve the object
- [ ] Create: `Model(**body.model_dump())` → `add` → `commit` → `refresh`
- [ ] Update: `body.model_dump(exclude_unset=True)` → `setattr` loop → `commit` → `refresh`
- [ ] Delete: set `deleted_at = datetime.now(timezone.utc)` → `commit` — never hard-delete
- [ ] Unique constraint violations: wrap `commit` in `try/except IntegrityError`, rollback, raise `HTTPException(409)`
- [ ] No knowledge of HTTP routing — no `Request`, no `Response`, no path params

### 5. Router (`api/<resource>.py`)

- [ ] `get_*_service()` factory and `*ServiceDep` alias defined locally in this file — not in `core/deps.py`
- [ ] Route handlers contain zero logic — one line calling the service method
- [ ] Every route has `response_model` and `status_code`
- [ ] Standard codes: `200` GET/PATCH, `201` POST, `204` DELETE
- [ ] Static routes (e.g. `/summary`, `/bulk`) declared **before** parameterised routes (`/{id}`)

### 6. Router Registration (`main.py`)

- [ ] `app.include_router(<resource>.router, prefix=PREFIX)`

---

## Integration Tests (`tests/integration/test_<resource>_integration.py`)

Tests are **mandatory**. The suite must pass before the implementation is considered complete.

### Required test cases

**Happy paths**

- [ ] `test_list_<resource>_empty` — GET list on empty DB returns `200` and `[]`
- [ ] `test_create_<resource>` — POST returns `201`; response contains all required fields with correct values
- [ ] `test_get_<resource>` — GET by ID returns `200` with correct fields
- [ ] `test_list_<resource>_after_create` — created item appears in list
- [ ] `test_update_<resource>` — PATCH returns `200` with updated field value
- [ ] `test_delete_<resource>` — DELETE returns `204`; subsequent GET returns `404`

**Error cases**

- [ ] `test_get_<resource>_not_found` — GET with unknown UUID returns `404`
- [ ] `test_update_<resource>_not_found` — PATCH with unknown UUID returns `404`
- [ ] `test_delete_<resource>_not_found` — DELETE with unknown UUID returns `404`

**Validation**

- [ ] `test_create_<resource>_empty_name` — POST with `"name": ""` returns `422`
- [ ] `test_create_<resource>_missing_required_field` — POST omitting a required field returns `422`

**Conflict (if the resource has unique constraints)**

- [ ] `test_create_duplicate_<resource>` — creating a duplicate returns `409`

### Regression guards

These assertions lock in behaviour that is easy to break accidentally:

- [ ] **Soft delete is real**: after DELETE, the item is absent from the list (`GET /`) AND returns `404` on `GET /{id}`
- [ ] **Partial update is safe**: PATCH with one field does NOT overwrite fields that were not sent
- [ ] **Response shape**: assert every field declared in `*Response` is present and correctly typed in the response body

### Test helpers

Use a private helper when a resource must exist as a prerequisite to keep tests readable:

```python
def _create_<resource>(client, **overrides) -> str:
    payload = {"name": "Test", ...}
    payload.update(overrides)
    resp = client.post("/api/<resource>/", json=payload)
    assert resp.status_code == 201
    return resp.json()["id"]
```

### Running tests

```bash
make test                                                                    # full suite
poetry run pytest tests/integration/test_<resource>_integration.py -v       # single file
poetry run pytest -k "test_create_<resource>" -v                             # single test by name
```

**The implementation is blocked if `make test` does not pass.**

---

## Refactoring

A refactor changes structure without changing observable behaviour. **If `make test` breaks after your change, the refactor introduced a bug — stop and fix it before continuing.**

### Before you start

- [ ] Run `make test` and record the result — it must be green before you touch anything
- [ ] Read every file you plan to change; understand what it does before modifying it
- [ ] Identify the single concern you are addressing (rename, move, extract, simplify) — do not mix concerns in one change

### Layer discipline

- [ ] Business logic that has crept into a router handler → move it to the service; router stays one-line
- [ ] HTTP exceptions raised inside `models/` or `db/schema.py` → move them to the service layer
- [ ] DB queries in a router or schema file → move them to the service
- [ ] After moving, confirm the originating file no longer imports `HTTPException`, `Session`, or any DB model it should not own

### Service changes

- [ ] If a service method is doing two distinct things, split it into two methods — each with a focused name
- [ ] New service collaborators (e.g. a second service needed by an existing service) must be injected via `__init__`, not instantiated inline
- [ ] `BaseService` is closed for modification — add behaviour in subclasses only; never add generic helpers to `BaseService` itself
- [ ] After splitting or extracting a method, verify all existing callers (other service methods and routers) are updated

### Schema / ORM changes

- [ ] Any column rename, type change, or relationship change requires a new migration: `make db-generate msg="..."` — never edit `alembic/versions/` by hand
- [ ] Renaming a Pydantic field that is part of a `*Response` schema is a breaking API change — confirm no frontend code depends on the old field name before renaming
- [ ] `*Update` schemas always keep every field optional; never tighten a field from `Optional` to required during a refactor

### Naming and imports

- [ ] After renaming a class, function, or module, search for all import sites and update them
- [ ] Service file names match the class they contain: `services/accounts.py` → `AccountsService`
- [ ] Router file names match the resource prefix: `api/accounts.py` → `prefix="/accounts"`

### Verification

- [ ] `make test` passes — identical result to the baseline you recorded before starting
- [ ] No new `import` added that violates layer boundaries (e.g. `api/` importing from `services/` is fine; `services/` importing from `api/` is not)
- [ ] If `models/` changed, `pnpm build` on the frontend confirms `types/api.ts` is still in sync

---

## Checklist Summary

```
[ ] db/schema.py           — ORM model + enums
[ ] make db-generate       — generate migration
[ ] make db-upgrade        — apply migration
[ ] models/<resource>.py   — Create, Update, Response schemas
[ ] services/<resource>.py — extend BaseService, all CRUD methods
[ ] api/<resource>.py      — thin router, local factory
[ ] main.py                — router registered
[ ] tests/integration/...  — all required cases above
[ ] make test              — full suite passes
[ ] pnpm build (frontend)  — if types/api.ts was updated
```
