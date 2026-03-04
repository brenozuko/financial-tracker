import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.session import get_db
from app.models.recurring_expense import (
    MarkPaidBody,
    RecurringExpenseCreate,
    RecurringExpenseResponse,
    RecurringExpenseUpdate,
)
from app.models.transaction import TransactionResponse
from app.services.recurring_expenses import RecurringExpensesService

router = APIRouter(prefix="/recurring-expenses", tags=["recurring-expenses"])


def get_recurring_expenses_service(
    db: Session = Depends(get_db),
) -> RecurringExpensesService:
    return RecurringExpensesService(session=db)


RecurringExpensesServiceDep = Depends(get_recurring_expenses_service)


@router.get("/", response_model=list[RecurringExpenseResponse])
def list_recurring_expenses(
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    return service.list_recurring_expenses(current_user.id)


@router.post("/", response_model=RecurringExpenseResponse, status_code=201)
def create_recurring_expense(
    body: RecurringExpenseCreate,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    return service.create_recurring_expense(body, current_user.id)


@router.get("/{expense_id}", response_model=RecurringExpenseResponse)
def get_recurring_expense(
    expense_id: uuid.UUID,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    expense = service.get_recurring_expense(expense_id, current_user.id)
    return service._to_response(expense, is_paid=False, paid_transaction_id=None)


@router.patch("/{expense_id}", response_model=RecurringExpenseResponse)
def update_recurring_expense(
    expense_id: uuid.UUID,
    body: RecurringExpenseUpdate,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    return service.update_recurring_expense(expense_id, current_user.id, body)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring_expense(
    expense_id: uuid.UUID,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    service.delete_recurring_expense(expense_id, current_user.id)


@router.post("/{expense_id}/mark-paid", response_model=TransactionResponse)
def mark_paid(
    expense_id: uuid.UUID,
    body: MarkPaidBody,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    return service.mark_paid(expense_id, current_user.id, body)


@router.post("/{expense_id}/mark-unpaid", status_code=status.HTTP_204_NO_CONTENT)
def mark_unpaid(
    expense_id: uuid.UUID,
    current_user: CurrentUser,
    service: RecurringExpensesService = RecurringExpensesServiceDep,
):
    service.mark_unpaid(expense_id, current_user.id)
