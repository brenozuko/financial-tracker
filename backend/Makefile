VENV := .venv/bin

run:
	$(VENV)/uvicorn app.main:app --reload --app-dir src

db-generate:
	$(VENV)/alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	$(VENV)/alembic upgrade head

db-downgrade:
	$(VENV)/alembic downgrade -1

test:
	$(VENV)/pytest

db-seed:
	cd src && $(CURDIR)/$(VENV)/python -m app.db.seed

install:
	poetry install
