run:
	uvicorn app.main:app --reload --app-dir src

db-generate:
	cd src && alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	cd src && alembic upgrade head

db-downgrade:
	cd src && alembic downgrade -1

test:
	pytest

install:
	poetry install
