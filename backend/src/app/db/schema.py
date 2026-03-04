import enum
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class RecurrenceFrequency(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    hashed_password: Mapped[str] = mapped_column(String(256))


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------


class Category(Base):
    __tablename__ = "categories"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(50))
    color: Mapped[str] = mapped_column(String(7))
    is_default: Mapped[bool] = mapped_column(default=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="category"
    )


# ---------------------------------------------------------------------------
# RecurringExpense
# ---------------------------------------------------------------------------


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float]
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("categories.id"))
    due_day: Mapped[int]
    notes: Mapped[Optional[str]] = mapped_column(Text)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    category: Mapped[Optional["Category"]] = relationship("Category")


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------


class Transaction(Base):
    __tablename__ = "transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    type: Mapped[TransactionType] = mapped_column(
        SAEnum(TransactionType, name="transactiontype")
    )
    description: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float]
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("categories.id")
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    is_recurring: Mapped[bool] = mapped_column(default=False)
    recurrence_frequency: Mapped[Optional[RecurrenceFrequency]] = mapped_column(
        SAEnum(RecurrenceFrequency, name="recurrencefrequency")
    )
    recurring_expense_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("recurring_expenses.id")
    )
    billing_period: Mapped[Optional[str]] = mapped_column(String(7))
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    category: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="transactions"
    )
