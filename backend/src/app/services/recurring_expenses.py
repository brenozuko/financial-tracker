import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import joinedload

from app.db.schema import RecurringExpense, Transaction, TransactionType
from app.models.recurring_expense import (
    MarkPaidBody,
    RecurringExpenseCreate,
    RecurringExpenseResponse,
    RecurringExpenseUpdate,
)
from app.services.base import BaseService


class RecurringExpensesService(BaseService):

    def _query(self, user_id: uuid.UUID):
        return (
            self.session.query(RecurringExpense)
            .options(joinedload(RecurringExpense.category))
            .filter(
                RecurringExpense.user_id == user_id,
                RecurringExpense.deleted_at.is_(None),
            )
        )

    def list_recurring_expenses(
        self, user_id: uuid.UUID
    ) -> list[RecurringExpenseResponse]:
        billing_period = datetime.now(timezone.utc).strftime("%Y-%m")
        expenses = self._query(user_id).order_by(RecurringExpense.name).all()

        paid_map: dict[uuid.UUID, uuid.UUID] = {
            t.recurring_expense_id: t.id
            for t in self.session.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.billing_period == billing_period,
                Transaction.recurring_expense_id.isnot(None),
                Transaction.deleted_at.is_(None),
            )
            .all()
        }

        results = []
        for expense in expenses:
            data = {
                "id": expense.id,
                "user_id": expense.user_id,
                "name": expense.name,
                "amount": expense.amount,
                "category_id": expense.category_id,
                "category": expense.category,
                "due_day": expense.due_day,
                "notes": expense.notes,
                "created_at": expense.created_at,
                "updated_at": expense.updated_at,
                "is_paid": expense.id in paid_map,
                "paid_transaction_id": paid_map.get(expense.id),
            }
            results.append(RecurringExpenseResponse.model_validate(data))
        return results

    def get_recurring_expense(
        self, expense_id: uuid.UUID, user_id: uuid.UUID
    ) -> RecurringExpense:
        expense = (
            self._query(user_id).filter(RecurringExpense.id == expense_id).first()
        )
        if not expense:
            raise HTTPException(status_code=404, detail="Recurring expense not found")
        return expense

    def create_recurring_expense(
        self, body: RecurringExpenseCreate, user_id: uuid.UUID
    ) -> RecurringExpenseResponse:
        expense = RecurringExpense(**body.model_dump(), user_id=user_id)
        self.session.add(expense)
        self.session.commit()
        self.session.refresh(expense)
        return self._to_response(expense, is_paid=False, paid_transaction_id=None)

    def update_recurring_expense(
        self,
        expense_id: uuid.UUID,
        user_id: uuid.UUID,
        body: RecurringExpenseUpdate,
    ) -> RecurringExpenseResponse:
        expense = self.get_recurring_expense(expense_id, user_id)
        updates = body.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(expense, field, value)
        self.session.commit()
        self.session.refresh(expense)
        billing_period = datetime.now(timezone.utc).strftime("%Y-%m")
        paid_txn = self._find_paid_transaction(expense_id, user_id, billing_period)
        return self._to_response(
            expense,
            is_paid=paid_txn is not None,
            paid_transaction_id=paid_txn.id if paid_txn else None,
        )

    def delete_recurring_expense(
        self, expense_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        expense = self.get_recurring_expense(expense_id, user_id)
        expense.deleted_at = datetime.now(timezone.utc)
        self.session.commit()

    def mark_paid(
        self, expense_id: uuid.UUID, user_id: uuid.UUID, body: MarkPaidBody
    ) -> Transaction:
        expense = self.get_recurring_expense(expense_id, user_id)
        billing_period = datetime.now(timezone.utc).strftime("%Y-%m")

        existing = self._find_paid_transaction(expense_id, user_id, billing_period)
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Recurring expense already marked as paid for this period",
            )

        transaction = Transaction(
            user_id=user_id,
            type=TransactionType.expense,
            description=expense.name,
            amount=expense.amount,
            date=body.date,
            category_id=expense.category_id,
            notes=expense.notes,
            recurring_expense_id=expense_id,
            billing_period=billing_period,
        )
        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)

        return (
            self.session.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(Transaction.id == transaction.id)
            .first()
        )

    def mark_unpaid(self, expense_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.get_recurring_expense(expense_id, user_id)
        billing_period = datetime.now(timezone.utc).strftime("%Y-%m")

        transaction = self._find_paid_transaction(expense_id, user_id, billing_period)
        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="No paid transaction found for this period",
            )
        transaction.deleted_at = datetime.now(timezone.utc)
        self.session.commit()

    def _find_paid_transaction(
        self, expense_id: uuid.UUID, user_id: uuid.UUID, billing_period: str
    ):
        return (
            self.session.query(Transaction)
            .filter(
                Transaction.recurring_expense_id == expense_id,
                Transaction.user_id == user_id,
                Transaction.billing_period == billing_period,
                Transaction.deleted_at.is_(None),
            )
            .first()
        )

    def _to_response(
        self,
        expense: RecurringExpense,
        is_paid: bool,
        paid_transaction_id,
    ) -> RecurringExpenseResponse:
        data = {
            "id": expense.id,
            "user_id": expense.user_id,
            "name": expense.name,
            "amount": expense.amount,
            "category_id": expense.category_id,
            "category": expense.category,
            "due_day": expense.due_day,
            "notes": expense.notes,
            "created_at": expense.created_at,
            "updated_at": expense.updated_at,
            "is_paid": is_paid,
            "paid_transaction_id": paid_transaction_id,
        }
        return RecurringExpenseResponse.model_validate(data)
