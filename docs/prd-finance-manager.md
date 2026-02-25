# Feature Breakdown
## Personal Finance Manager

**Stack:** React + Vite · FastAPI · PostgreSQL

---

## F1 — Authentication & User Management

**Back-end**
- [ ] `POST /auth/register` — create user with hashed password
- [ ] `POST /auth/login` — return JWT token (30-day expiry)
- [ ] `POST /auth/password-reset/request` — send reset link via email (1h expiry)
- [ ] `POST /auth/password-reset/confirm` — validate token and update password
- [ ] `DELETE /users/me` — delete account and all associated data

**Front-end**
- [ ] Sign up page
- [ ] Login page
- [ ] Password reset request page
- [ ] Password reset confirmation page
- [ ] Auth guard (redirect unauthenticated users to login)
- [ ] JWT storage and attachment to requests (Axios interceptor)

---

## F2 — Document Upload & Processing

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

## F3 — Transaction Management

**Back-end**
- [ ] `GET /transactions` — paginated list with filters (date range, category, source document)
- [ ] `PATCH /transactions/{id}` — update description, amount, date, or category
- [ ] `DELETE /transactions/{id}` — soft delete
- [ ] `POST /transactions` — manually create a transaction
- [ ] `GET /transactions/duplicates` — return flagged duplicate pairs

**Front-end**
- [ ] Transaction list page (sortable columns, pagination)
- [ ] Filter bar (date range picker, category dropdown, source document)
- [ ] Inline edit for description, amount, date, and category
- [ ] Delete with 5s undo toast
- [ ] Manual transaction form (modal or drawer)
- [ ] Duplicate flags UI — confirm or dismiss per pair

---

## F4 — Automatic Categorization

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

---

## F5 — Dashboard

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

## F6 — Monthly Reports

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

## F7 — Settings & Preferences

**Back-end**
- [ ] `GET /users/me` — return user profile and preferences
- [ ] `PATCH /users/me` — update currency, notification preferences

**Front-end**
- [ ] Settings page
- [ ] Currency selector
- [ ] Email notification toggle
