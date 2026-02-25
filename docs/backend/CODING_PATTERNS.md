# Coding Patterns

Concrete, copy-paste patterns extracted from the existing codebase. Follow these exactly when adding new resources. For architectural decisions and rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. ORM Model (`db/schema.py`)

All models live in a single file. Extend `Base` — never define your own `id`, `created_at`, or `updated_at`.

```python
class Transaction(Base):
    __tablename__ = "transactions"

    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id"))
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("categories.id"))
    type: Mapped[TransactionType] = mapped_column(SAEnum(TransactionType, name="transactiontype"))
    amount: Mapped[float]                                        # no mapped_column — type fully inferred
    description: Mapped[Optional[str]] = mapped_column(Text)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_reconciled: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[float] = mapped_column(default=0.0)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    account: Mapped["Account"] = relationship("Account", back_populates="transactions")
    category: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="transactions"
    )
```

### `Mapped` type inference rules

`Mapped[T]` already encodes nullability — never repeat it in `mapped_column()`:

| Annotation | Implied | So drop... |
|---|---|---|
| `Mapped[str]` | NOT NULL | `nullable=False` |
| `Mapped[Optional[str]]` | NULL | `nullable=True` |
| `Mapped[float]` | FLOAT, NOT NULL | `Float`, `nullable=False` |
| `Mapped[bool]` | BOOLEAN, NOT NULL | `Boolean`, `nullable=False` |
| `Mapped[int]` | INTEGER, NOT NULL | `Integer`, `nullable=False` |

Use `mapped_column()` **only** when extra configuration is required:

| Needs `mapped_column()`? | Why |
|---|---|
| `String(128)` | length constraint |
| `Text` | unbounded text (distinct from `VARCHAR`) |
| `DateTime(timezone=True)` | timezone-aware datetime |
| `SAEnum(MyEnum, name="...")` | enum mapping + Postgres type name |
| `ForeignKey("table.id")` | foreign key reference |
| `default=...` | Python-side column default |
| `primary_key=True` | primary key designation |

If `mapped_column()` would only contain `nullable=True` or `nullable=False`, omit it entirely.

**Other rules:**
- Add `deleted_at` to every soft-deletable model.
- Enums are `str, enum.Enum` subclasses so they serialize to JSON as strings.
- Map enums with `SAEnum(MyEnum, name="myenum")` — the `name` must be unique in Postgres.
- Relationships use `back_populates` for bidirectional navigation.

### Enums

```python
class AccountType(str, enum.Enum):
    checking = "checking"
    savings = "savings"
    credit_card = "credit_card"
    cash = "cash"
    other = "other"
```

Define enums at the top of `schema.py`, before any model that references them.

---

## 2. Pydantic Schemas (`models/<resource>.py`)

Three shapes per resource. No exceptions.

### `*Create`

```python
class AccountCreate(BaseModel):
    name: str
    type: AccountType
    balance: float = 0.0
    currency: str = "USD"
    description: Optional[str] = None
    sort_order: float = 0.0

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be empty")
        return v.strip()
```

### `*Update`

```python
class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    balance: Optional[float] = None
    description: Optional[str] = None
    sort_order: Optional[float] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("name must not be empty")
        return v.strip() if v else v
```

**Rules:**
- Every field is `Optional[T] = None`.
- Validators check `if v is not None` before validating so omitted fields pass through.

### `*Response`

```python
class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    type: AccountType
    balance: float
    currency: str
    description: Optional[str]
    sort_order: float
    created_at: datetime
    updated_at: datetime
```

**Rules:**
- Always include `model_config = ConfigDict(from_attributes=True)`.
- Always include `id`, `created_at`, `updated_at`.
- Nest related `*Response` models for eager-loaded relationships (see transactions example below).

### Nested responses (for relationships)

```python
class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    account_id: uuid.UUID
    type: TransactionType
    amount: float
    date: datetime
    # ...
    account: AccountResponse          # eager-loaded relationship
    category: Optional[CategoryResponse]
```

---

## 3. Service (`services/<resource>.py`)

```python
class AccountsService(BaseService):

    def list_accounts(self) -> list[Account]:
        return (
            self.session.query(Account)
            .filter(Account.deleted_at.is_(None))
            .order_by(Account.sort_order)
            .all()
        )

    def get_account(self, account_id: uuid.UUID) -> Account:
        account = (
            self.session.query(Account)
            .filter(Account.id == account_id, Account.deleted_at.is_(None))
            .first()
        )
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account

    def create_account(self, body: AccountCreate) -> Account:
        account = Account(**body.model_dump())
        self.session.add(account)
        self.session.commit()
        self.session.refresh(account)
        return account

    def update_account(self, account_id: uuid.UUID, body: AccountUpdate) -> Account:
        account = self.get_account(account_id)
        updates = body.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(account, field, value)
        self.session.commit()
        self.session.refresh(account)
        return account

    def delete_account(self, account_id: uuid.UUID) -> None:
        account = self.get_account(account_id)
        account.deleted_at = datetime.now(timezone.utc)
        self.session.commit()
```

**Rules:**
- Extend `BaseService`. Never define `__init__` unless you need extra collaborators.
- Every list query filters `deleted_at.is_(None)` and orders by `sort_order`.
- `get_*` raises `HTTPException(404)` if not found. All other methods call `get_*` first.
- Create: `Model(**body.model_dump())` → `add` → `commit` → `refresh`.
- Update: `body.model_dump(exclude_unset=True)` → iterate → `setattr` → `commit` → `refresh`.
- Delete: set `deleted_at = datetime.now(timezone.utc)` → `commit`. Never hard-delete.
- Raise `HTTPException` directly in the service — never in the router.

### Eager loading relationships

When the response model includes nested objects, use a `_query()` helper:

```python
class TransactionsService(BaseService):

    def _query(self):
        return (
            self.session.query(Transaction)
            .options(joinedload(Transaction.account), joinedload(Transaction.category))
            .filter(Transaction.deleted_at.is_(None))
        )

    def get_transaction(self, transaction_id: uuid.UUID) -> Transaction:
        transaction = (
            self._query()
            .filter(Transaction.id == transaction_id)
            .first()
        )
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction

    def create_transaction(self, body: TransactionCreate) -> Transaction:
        transaction = Transaction(**body.model_dump())
        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)
        return self.get_transaction(transaction.id)   # re-fetch to load relationships
```

After create/update, call `get_*` (not `refresh`) to ensure relationships are populated.

### Conflict handling

Wrap commits that may violate unique constraints:

```python
def create_category(self, body: CategoryCreate) -> Category:
    category = Category(**body.model_dump())
    self.session.add(category)
    try:
        self.session.commit()
    except IntegrityError:
        self.session.rollback()
        raise HTTPException(
            status_code=409,
            detail="A category with this name and type already exists",
        )
    self.session.refresh(category)
    return category
```

### Singleton resource

```python
class SettingsService(BaseService):

    def get_or_create_settings(self) -> Settings:
        settings = self.session.get(Settings, "default")
        if not settings:
            settings = Settings(id="default")
            self.session.add(settings)
            self.session.commit()
            self.session.refresh(settings)
        return settings
```

---

## 4. Router (`api/<resource>.py`)

```python
router = APIRouter(prefix="/accounts", tags=["accounts"])


def get_accounts_service() -> AccountsService:
    return AccountsService(session=SessionLocal())


AccountsServiceDep = Depends(get_accounts_service)


@router.get("/", response_model=list[AccountResponse])
def list_accounts(service: AccountsService = AccountsServiceDep):
    return service.list_accounts()


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(body: AccountCreate, service: AccountsService = AccountsServiceDep):
    return service.create_account(body)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: uuid.UUID, service: AccountsService = AccountsServiceDep):
    return service.get_account(account_id)


@router.patch("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: uuid.UUID,
    body: AccountUpdate,
    service: AccountsService = AccountsServiceDep,
):
    return service.update_account(account_id, body)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: uuid.UUID, service: AccountsService = AccountsServiceDep):
    service.delete_account(account_id)
```

**Rules:**
- Define `get_*_service()` and `*ServiceDep` locally in the file. Do not use `core/deps.py`.
- Route handlers contain zero logic — one line calling the service method.
- `response_model` and `status_code` always specified.
- Standard status codes: `200` GET/PATCH, `201` POST, `204` DELETE.
- Declare static routes (e.g. `/summary`, `/bulk`) **before** parameterized routes (`/{id}`).

### Router registration (`main.py`)

```python
PREFIX = "/api"

app.include_router(accounts.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)
app.include_router(transactions.router, prefix=PREFIX)
app.include_router(settings.router, prefix=PREFIX)
```

---

## 5. Integration Tests (`tests/integration/test_<resource>_integration.py`)

### Fixture (already in `conftest.py` — do not redefine)

```python
@pytest.fixture
def client_with_test_db():
    # Creates isolated SQLite DB per test, overrides get_db, tears down after.
    ...
```

### Test structure

```python
def test_list_accounts_empty(client_with_test_db):
    resp = client_with_test_db.get("/api/accounts/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_account(client_with_test_db):
    resp = client_with_test_db.post(
        "/api/accounts/",
        json={"name": "Checking", "type": "checking", "balance": 1000.0},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Checking"
    assert data["type"] == "checking"
    assert data["balance"] == 1000.0


def test_get_account_not_found(client_with_test_db):
    resp = client_with_test_db.get("/api/accounts/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_update_account(client_with_test_db):
    create_resp = client_with_test_db.post(
        "/api/accounts/",
        json={"name": "Cash", "type": "cash"},
    )
    account_id = create_resp.json()["id"]

    resp = client_with_test_db.patch(
        f"/api/accounts/{account_id}", json={"balance": 500.0}
    )
    assert resp.status_code == 200
    assert resp.json()["balance"] == 500.0


def test_delete_account(client_with_test_db):
    create_resp = client_with_test_db.post(
        "/api/accounts/",
        json={"name": "Old Account", "type": "other"},
    )
    account_id = create_resp.json()["id"]

    client_with_test_db.delete(f"/api/accounts/{account_id}")

    resp = client_with_test_db.get(f"/api/accounts/{account_id}")
    assert resp.status_code == 404   # soft delete verified
```

**Rules:**
- One test function per scenario. Each test is fully independent.
- Assert status code first, then response fields.
- Always test the not-found (404) case.
- Verify soft delete by confirming GET returns 404 after DELETE.
- Use a private helper (e.g. `_create_account(client)`) when a resource must exist as a prerequisite.

### Helper pattern for prerequisite resources

```python
def _create_account(client, name="Test Account", account_type="checking") -> str:
    resp = client.post(
        "/api/accounts/",
        json={"name": name, "type": account_type},
    )
    assert resp.status_code == 201
    return resp.json()["id"]


def test_create_transaction(client_with_test_db):
    account_id = _create_account(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "account_id": account_id,
            "type": "expense",
            "amount": 50.0,
            "date": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert resp.status_code == 201
```

---

## 6. SOLID Principles

These principles are not abstract — they have direct, concrete implications for every layer of this codebase.

### S — Single Responsibility

Each layer owns exactly one concern. Never let concerns bleed across layers.

| Layer | Its one job | What it must NOT do |
|---|---|---|
| `api/` | Parse HTTP, call service, return result | Query the DB, raise business errors |
| `services/` | Business logic, DB queries, error raising | Know about HTTP request/response shapes |
| `models/` | Validate and serialize data | Query the DB or contain business logic |
| `db/schema.py` | Describe persistence structure | Contain validation or business rules |

If a service method is doing two distinct things, split it into two methods.

### O — Open/Closed

`BaseService` is **closed for modification** — extend it, never change it. New behaviour goes in a new subclass or a new method on the subclass.

```python
# Correct: extend, don't modify BaseService
class AccountsService(BaseService):
    def archive_old_accounts(self) -> int:
        ...

# Wrong: adding generic helpers to BaseService itself
class BaseService:
    def soft_delete(self, obj):   # ← don't do this
        ...
```

### L — Liskov Substitution

All service subclasses must honour `BaseService`'s contract: a `Session` is the only required constructor argument. Services with extra dependencies extend the signature — they don't replace it.

```python
# Correct: super().__init__ called, extra args are additive
class ReportsService(BaseService):
    def __init__(
        self,
        session: Session,
        settings_service: SettingsService,
        ai_client_factory: Callable,
    ) -> None:
        super().__init__(session)
        self.settings_service = settings_service
        self.ai_client_factory = ai_client_factory
```

### I — Interface Segregation

Services expose only methods for their own resource. If a service needs data from another resource, it receives the other service as a collaborator — it does not grow unrelated methods.

```python
# Wrong: TransactionsService reaching into Account territory
class TransactionsService(BaseService):
    def get_account_balance(self, account_id):  # ← doesn't belong here
        ...

# Correct: inject AccountsService as a collaborator when needed
class ReportsService(BaseService):
    def __init__(self, session, accounts_service: AccountsService, ...):
        super().__init__(session)
        self.accounts_service = accounts_service
```

### D — Dependency Inversion

High-level modules depend on abstractions, not concretions. External collaborators (AI providers, third-party clients) are abstracted via `Protocol` and injected — never instantiated inside a service.

```python
# Protocol as abstraction (already used for AI clients)
class AIClient(Protocol):
    async def complete(self, *, system_prompt: str, user_prompt: str) -> str: ...

# Service receives the factory, not a concrete client
class ReportsService(BaseService):
    def __init__(self, ..., ai_client_factory: Callable[[AIProvider, str], AIClient]):
        self.ai_client_factory = ai_client_factory

# Router wires up the concrete implementation
def get_reports_service() -> ReportsService:
    session = SessionLocal()
    return ReportsService(
        session=session,
        settings_service=SettingsService(session),
        ai_client_factory=build_ai_client,  # concrete factory injected here
    )
```

---

## Quick checklist for a new resource

1. `db/schema.py` — ORM model + enums
2. `make db-generate msg="add <resource>"` — generate migration
3. `make db-upgrade` — apply migration
4. `models/<resource>.py` — `*Create`, `*Update`, `*Response`
5. `services/<resource>.py` — extend `BaseService`
6. `api/<resource>.py` — `APIRouter`, local factory, thin handlers
7. `main.py` — `app.include_router(<resource>.router, prefix=PREFIX)`
8. `tests/integration/test_<resource>_integration.py` — CRUD + edge cases
