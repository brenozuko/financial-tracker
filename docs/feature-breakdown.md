# Feature Breakdown

## Personal Finance Manager

**Stack:** React + Vite · FastAPI · PostgreSQL

---

## F1 — Authentication & User Management

**Back-end**

- [x] `POST /auth/register` — create user with hashed password
- [x] `POST /auth/login` — return JWT token (30-day expiry)
- [x] `DELETE /users/me` — delete account and all associated data

**Front-end**

- [x] Sign up page
- [x] Login page
- [x] Auth guard (redirect unauthenticated users to login)
- [x] JWT storage and attachment to requests (Axios interceptor)

---

## F2 — Transaction Management

**Back-end**

- [x] `POST /transactions` — create a transaction (income or expense)
- [x] `GET /transactions` — paginated list with filters (date range, category, type, search) and sorting
- [x] `GET /transactions/{id}` — single transaction by ID
- [x] `PATCH /transactions/{id}` — update description, amount, date, category, notes, recurring
- [x] `DELETE /transactions/{id}` — soft delete
- [x] `POST /transactions/{id}/restore` — undo soft delete
- [x] `GET /categories` — list all categories (system defaults + user custom)
- [x] `POST /categories` — create custom category
- [x] `PATCH /categories/{id}` — update custom category name/color
- [x] `DELETE /categories/{id}` — delete custom category

**Front-end**

- [x] Top navbar (logo, Transactions link, Dashboard disabled, user menu)
- [x] Transaction list page (sortable columns, page-number pagination, 10/page)
- [x] Filter bar (date range, category, type, search, clear filters)
- [x] Transaction modal (create & edit — click row to edit)
- [x] Delete with 5s undo toast (optimistic update + restore endpoint)
- [x] Inline category creation from transaction modal

---

## F3 — Recurring Expenses

**Back-end**

- [x] `POST /recurring-expenses` — create a recurring expense (name, amount, category, due day of month, notes)
- [x] `GET /recurring-expenses` — list all recurring expenses with paid status for the current billing period
- [x] `GET /recurring-expenses/{id}` — single recurring expense by ID
- [x] `PATCH /recurring-expenses/{id}` — update name, amount, category, due day, notes
- [x] `DELETE /recurring-expenses/{id}` — delete a recurring expense
- [x] `POST /recurring-expenses/{id}/mark-paid` — mark as paid for current period; creates and returns a transaction
- [x] `POST /recurring-expenses/{id}/mark-unpaid` — undo paid status; soft-deletes the generated transaction

**Front-end**

- [x] Recurring expenses page — card/list layout showing name, amount, category, due day, and paid status
- [x] Visual overdue indicator — highlight expenses past their due day that are still unpaid
- [x] "Mark as paid" toggle — one click marks paid and creates a transaction; second click reverts
- [x] Create/edit modal (name, amount, category, due day of month, optional notes)
- [x] Delete recurring expense with confirmation dialog
- [x] Monthly summary strip — total recurring committed vs. total paid this period

---

## F4 — Dashboard

**Back-end**

- [ ] `GET /analytics/summary` — total spent, income, net for a given period
- [ ] `GET /analytics/by-category` — spending per category for a given period
- [ ] `GET /analytics/daily` — daily totals for the past N days
- [ ] `GET /analytics/top-merchants` — top 5 merchants by total spend
- [ ] `GET /analytics/month-comparison` — current vs. previous month per category
- [ ] All endpoints accept `start_date` / `end_date` query params

**Front-end**

- [ ] Dashboard page layout
- [ ] Hero KPI card (total spending this month)
- [ ] Donut chart — spending by category (click to filter transactions)
- [ ] Line chart — daily spending trend (30 days)
- [ ] Top merchants list
- [ ] Month-over-month comparison table/cards
- [ ] Date range filter (all widgets update reactively)

---

## F5 — Monthly Reports

**Back-end**

- [ ] Celery beat job — auto-generate monthly report on 1st of each month
- [ ] `GET /reports` — list all generated reports
- [ ] `GET /reports/{id}` — return report data (income, expenses, net, breakdown)
- [ ] `GET /reports/{id}/export/pdf` — generate and return PDF
- [ ] `GET /transactions/export/csv` — export filtered transactions as CSV

**Front-end**

- [ ] Reports archive page (list by month)
- [ ] Report detail view (income vs. expenses, category breakdown, transaction list)
- [ ] Export PDF button
- [ ] Export CSV button

---

## F6 — Settings & Preferences

**Back-end**

- [ ] `GET /users/me` — return user profile and preferences
- [ ] `PATCH /users/me` — update currency, notification preferences

**Front-end**

- [ ] Settings page
- [ ] Currency selector
- [ ] Email notification toggle

---

## F7 — Document Upload & Processing

**Back-end**

- [ ] `POST /documents` — accept file upload, store in S3, enqueue Celery job, return `job_id`
- [ ] `GET /documents` — list all documents with status and metadata
- [ ] `GET /documents/{id}/status` — return current processing status
- [ ] Celery worker: extract pages/image from PDF or screenshot
- [ ] Celery worker: send file to LLM Vision API, parse structured transactions
- [ ] Celery worker: validate output with Pydantic schema, persist to DB
- [ ] Celery worker: update document status (`queued → processing → done / failed`)
- [ ] Duplicate detection logic on transaction insert

**Front-end**

- [ ] File upload component (drag & drop + file picker, accept PDF/JPG/PNG)
- [ ] Upload progress indicator
- [ ] Processing status polling (React Query `refetchInterval` on `job_id`)
- [ ] In-app notification when processing completes
- [ ] Document history list (filename, date, status, # transactions)

---

## F8 — Automatic Categorization

**Back-end**

- [ ] LLM-based categorization on transaction extraction (part of Celery worker)
- [ ] Persist merchant→category mapping table
- [ ] Apply saved mappings before LLM call on future imports
- [ ] `GET /categories` — list all categories (default + custom)
- [ ] `POST /categories` — create custom category
- [ ] `PATCH /categories/{id}` — rename or update color
- [ ] `DELETE /categories/{id}` — hide/remove custom category

**Front-end**

- [ ] Category dropdown in transaction list (inline update)
- [ ] Category management page (list, add, rename, reorder, delete)
- [ ] Color picker for custom categories
- [ ] Default category set displayed on first use
