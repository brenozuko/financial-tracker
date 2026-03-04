import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.session import get_db
from app.models.transaction import (
    PaginatedTransactionResponse,
    TransactionCreate,
    TransactionFilters,
    TransactionResponse,
    TransactionUpdate,
)
from app.services.transactions import TransactionsService

router = APIRouter(prefix="/transactions", tags=["transactions"])


def get_transactions_service(db: Session = Depends(get_db)) -> TransactionsService:
    return TransactionsService(session=db)


TransactionsServiceDep = Depends(get_transactions_service)


@router.get("/", response_model=PaginatedTransactionResponse)
def list_transactions(
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    filters: TransactionFilters = Depends(),
    service: TransactionsService = TransactionsServiceDep,
):
    return service.list_transactions(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        **filters.model_dump(),
    )


@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(
    body: TransactionCreate,
    current_user: CurrentUser,
    service: TransactionsService = TransactionsServiceDep,
):
    return service.create_transaction(body, current_user.id)


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: uuid.UUID,
    current_user: CurrentUser,
    service: TransactionsService = TransactionsServiceDep,
):
    return service.get_transaction(transaction_id, current_user.id)


@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: uuid.UUID,
    body: TransactionUpdate,
    current_user: CurrentUser,
    service: TransactionsService = TransactionsServiceDep,
):
    return service.update_transaction(transaction_id, current_user.id, body)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: CurrentUser,
    service: TransactionsService = TransactionsServiceDep,
):
    service.delete_transaction(transaction_id, current_user.id)


@router.post("/{transaction_id}/restore", response_model=TransactionResponse)
def restore_transaction(
    transaction_id: uuid.UUID,
    current_user: CurrentUser,
    service: TransactionsService = TransactionsServiceDep,
):
    return service.restore_transaction(transaction_id, current_user.id)
