# Coding Patterns

Concrete, copy-paste patterns extracted from the existing codebase. Follow these exactly when adding new resources. For architectural decisions and rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Quick Reference (For LLMs)

**When to use this doc**: Implementing models, schemas, services, routers, or any backend resource end-to-end.

**Style**: Lean routers, all logic in services, SOLID principles, quality is paramount.

**Key rules**:

- DO: Extend `Base` for ORM models — never define `id`, `created_at`, `updated_at`
- DO: Create exactly three Pydantic shapes per resource: `*Create`, `*Update`, `*Response`
- DO: Put all business logic, queries, and error raising in services
- DO: Keep route handlers to a single service call — zero logic
- DON'T: Add `nullable=True/False` to `mapped_column()` — `Mapped[T]` handles it
- DON'T: Raise `HTTPException` in routers — only in services
- DON'T: Hard-delete rows — always soft-delete via `deleted_at`
- DON'T: Reuse a `*Response` model across endpoints with different data needs

**Detection commands**:

```bash
# Business logic leaking into routers (if/for/try in api/ files)
grep -rn "if \|for \|try:" src/app/api/ --include="*.py" | grep -v "def \|import\|#"

# Missing soft-delete filter
grep -rn "\.query(" src/app/services/ --include="*.py" | grep -v "deleted_at"

# Hard deletes (should not exist)
grep -rn "\.delete(" src/app/services/ --include="*.py"
```

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

### Rules

- DO: Let `Mapped[T]` encode nullability — `Mapped[str]` = NOT NULL, `Mapped[Optional[str]]` = NULL
- DO: Use `mapped_column()` only when extra config is needed (see table below)
- DO: Add `deleted_at` to every soft-deletable model
- DO: Define enums as `str, enum.Enum` subclasses at the top of `schema.py`
- DO: Map enums with `SAEnum(MyEnum, name="myenum")` — name must be unique in Postgres
- DO: Use `back_populates` for bidirectional relationships
- DON'T: Pass `nullable=True` or `nullable=False` to `mapped_column()` — `Mapped[T]` handles it
- DON'T: Add redundant type columns like `Float`, `Boolean`, `Integer` — `Mapped[T]` infers them

### When `mapped_column()` is required

| Needs it? | Why |
|---|---|
| `String(128)` | length constraint |
| `Text` | unbounded text (distinct from `VARCHAR`) |
| `DateTime(timezone=True)` | timezone-aware datetime |
| `SAEnum(MyEnum, name="...")` | enum mapping + Postgres type name |
| `ForeignKey("table.id")` | foreign key reference |
| `default=...` | Python-side column default |
| `primary_key=True` | primary key designation |

If `mapped_column()` would only contain `nullable=True` or `nullable=False`, omit it entirely.

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

### Rules

- DO: Always include `model_config = ConfigDict(from_attributes=True)` in `*Response`
- DO: Always include `id`, `created_at`, `updated_at` in `*Response`
- DO: Make every `*Update` field `Optional[T] = None`
- DO: Guard `*Update` validators with `if v is not None` so omitted fields pass through
- DO: Nest related `*Response` models for eager-loaded relationships
- DON'T: Reuse a response model across endpoints that return different data — one model per endpoint

---

## 3. Service (`services/<resource>.py`)

### Standard CRUD service

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

### Rules

- DO: Extend `BaseService` — never define `__init__` unless you need extra collaborators
- DO: Filter `deleted_at.is_(None)` and order by `sort_order` in every list query
- DO: Raise `HTTPException(404)` in `get_*` if not found — all other methods call `get_*` first
- DO: Create with `Model(**body.model_dump())` then `add` / `commit` / `refresh`
- DO: Update with `body.model_dump(exclude_unset=True)` then `setattr` loop / `commit` / `refresh`
- DO: Soft-delete by setting `deleted_at = datetime.now(timezone.utc)` then `commit`
- DON'T: Hard-delete — never call `session.delete()`
- DON'T: Raise `HTTPException` in routers — always in services

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

### Rules

- DO: Define `get_*_service()` and `*ServiceDep` locally in each router file
- DO: Keep every handler to a single service call — zero logic
- DO: Always specify `response_model` and `status_code`
- DO: Use standard status codes: `200` GET/PATCH, `201` POST, `204` DELETE
- DO: Declare static routes (`/summary`, `/bulk`) **before** parameterized routes (`/{id}`)
- DON'T: Add `if`, `for`, `try`, or any branching to route handlers
- DON'T: Add new entries to `core/deps.py` — each router owns its dependencies

### Router registration (`main.py`)

```python
PREFIX = "/api"

app.include_router(accounts.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)
app.include_router(transactions.router, prefix=PREFIX)
app.include_router(settings.router, prefix=PREFIX)
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
