import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.category import CategoryResponse


class RecurringExpenseCreate(BaseModel):
    name: str
    amount: float
    due_day: int
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be empty")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be greater than zero")
        return v

    @field_validator("due_day")
    @classmethod
    def due_day_valid(cls, v: int) -> int:
        if v < 1 or v > 31:
            raise ValueError("due_day must be between 1 and 31")
        return v


class RecurringExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    due_day: Optional[int] = None
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("name must not be empty")
        return v.strip() if v else v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("amount must be greater than zero")
        return v

    @field_validator("due_day")
    @classmethod
    def due_day_valid(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 31):
            raise ValueError("due_day must be between 1 and 31")
        return v


class RecurringExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    amount: float
    category_id: Optional[uuid.UUID]
    category: Optional[CategoryResponse]
    due_day: int
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_paid: bool = False
    paid_transaction_id: Optional[uuid.UUID] = None


class MarkPaidBody(BaseModel):
    date: datetime
