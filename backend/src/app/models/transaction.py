import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from app.db.schema import RecurrenceFrequency, TransactionType
from app.models.category import CategoryResponse


class TransactionFilters(BaseModel):
    type: Optional[TransactionType] = None
    category_id: Optional[uuid.UUID] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    search: Optional[str] = None


class TransactionCreate(BaseModel):
    type: TransactionType
    description: str
    amount: float
    date: datetime
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    is_recurring: bool = False
    recurrence_frequency: Optional[RecurrenceFrequency] = None

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("description must not be empty")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be greater than zero")
        return v

    @model_validator(mode="after")
    def recurrence_frequency_required_when_recurring(self) -> "TransactionCreate":
        if self.is_recurring and self.recurrence_frequency is None:
            raise ValueError(
                "recurrence_frequency is required when is_recurring is true"
            )
        if not self.is_recurring:
            self.recurrence_frequency = None
        return self


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_frequency: Optional[RecurrenceFrequency] = None

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("description must not be empty")
        return v.strip() if v else v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("amount must be greater than zero")
        return v


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    type: TransactionType
    description: str
    amount: float
    date: datetime
    category_id: Optional[uuid.UUID]
    category: Optional[CategoryResponse]
    notes: Optional[str]
    is_recurring: bool
    recurrence_frequency: Optional[RecurrenceFrequency]
    recurring_expense_id: Optional[uuid.UUID]
    billing_period: Optional[str]
    created_at: datetime
    updated_at: datetime


class PaginatedTransactionResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
