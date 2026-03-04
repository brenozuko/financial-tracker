# Financial Tracker

A personal finance app for tracking transactions, recurring expenses, and spending habits.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for the database)
- [Python 3.13+](https://www.python.org/) + [Poetry](https://python-poetry.org/)
- [Node.js 20+](https://nodejs.org/) + [pnpm](https://pnpm.io/)

## Getting Started

### 1. Start the database

```bash
docker compose up -d
```

### 2. Set up the backend

```bash
cd backend
poetry install
cp .env.example .env   # or create .env manually (see below)
make db-upgrade        # run migrations
make run               # starts on http://localhost:8000
```

**Minimal `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/financial_tracker
SECRET_KEY=change-me-in-development
```

### 3. Set up the frontend

```bash
cd frontend
pnpm install
pnpm dev               # starts on http://localhost:5173
```

## Development Commands

### Backend (`backend/`)

| Command | Description |
|---|---|
| `make run` | Start dev server with hot-reload |
| `make test` | Run test suite |
| `make db-upgrade` | Apply pending migrations |
| `make db-downgrade` | Roll back one migration |
| `make db-generate msg="..."` | Generate migration from model changes |
| `make db-seed` | Seed the database with sample data |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check + production build |
| `pnpm lint` | Run ESLint |

## Project Structure

```
financial-tracker/
├── backend/        # FastAPI + SQLAlchemy + Alembic
├── frontend/       # React + Vite + TanStack Router
├── docs/           # Architecture and implementation guides
└── docker-compose.yml
```
