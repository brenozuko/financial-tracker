"""Seed default categories into the database.

Run via: make db-seed
Idempotent — safe to run multiple times.
"""

from app.db.schema import Category
from app.db.session import SessionLocal

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#EF4444"},
    {"name": "Transport", "color": "#3B82F6"},
    {"name": "Housing", "color": "#8B5CF6"},
    {"name": "Utilities", "color": "#F59E0B"},
    {"name": "Entertainment", "color": "#EC4899"},
    {"name": "Healthcare", "color": "#10B981"},
    {"name": "Shopping", "color": "#F97316"},
    {"name": "Education", "color": "#6366F1"},
    {"name": "Salary/Income", "color": "#22C55E"},
    {"name": "Investments", "color": "#14B8A6"},
    {"name": "Other", "color": "#6B7280"},
]


def seed_default_categories() -> None:
    session = SessionLocal()
    try:
        existing = (
            session.query(Category)
            .filter(Category.is_default.is_(True))
            .count()
        )
        if existing > 0:
            print(f"Default categories already exist ({existing} found). Skipping.")
            return

        for cat in DEFAULT_CATEGORIES:
            session.add(
                Category(
                    name=cat["name"],
                    color=cat["color"],
                    is_default=True,
                    user_id=None,
                )
            )
        session.commit()
        print(f"Seeded {len(DEFAULT_CATEGORIES)} default categories.")
    finally:
        session.close()


if __name__ == "__main__":
    seed_default_categories()
