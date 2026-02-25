run:
	poetry run uvicorn app.main:app --reload --app-dir src

db-generate:
	poetry run alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	poetry run alembic upgrade head

db-downgrade:
	poetry run alembic downgrade -1

test:
	poetry run pytest

install:
	poetry install
