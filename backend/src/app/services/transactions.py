import math
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import joinedload

from app.db.schema import Transaction, TransactionType
from app.models.transaction import TransactionCreate, TransactionUpdate
from app.services.base import BaseService
from app.services.filters import FilterSpec, apply_filters

TRANSACTION_FILTERS: list[FilterSpec] = [
    FilterSpec("type", lambda v: Transaction.type == v),
    FilterSpec("category_id", lambda v: Transaction.category_id == v),
    FilterSpec(
        "date_from",
        lambda v: Transaction.date
        >= datetime.combine(v, datetime.min.time(), tzinfo=timezone.utc),
    ),
    FilterSpec(
        "date_to",
        lambda v: Transaction.date
        <= datetime.combine(v, datetime.max.time(), tzinfo=timezone.utc),
    ),
    FilterSpec(
        "search",
        lambda v: Transaction.description.ilike(f"%{v}%"),
        applies=bool,
    ),
]


class TransactionsService(BaseService):

    def _query(self, user_id: uuid.UUID):
        return (
            self.session.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        )

    def list_transactions(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "date",
        sort_order: str = "desc",
        **filters: Any,
    ) -> dict[str, Any]:
        query = self._query(user_id)

        query = apply_filters(query, TRANSACTION_FILTERS, filters)

        total = query.count()

        sort_column = getattr(Transaction, sort_by, Transaction.date)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        page_size = min(page_size, 50)
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if page_size > 0 else 0,
        }

    def get_transaction(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction:
        transaction = (
            self._query(user_id)
            .filter(Transaction.id == transaction_id)
            .first()
        )
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction

    def create_transaction(
        self, body: TransactionCreate, user_id: uuid.UUID
    ) -> Transaction:
        transaction = Transaction(**body.model_dump(), user_id=user_id)
        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)
        return self.get_transaction(transaction.id, user_id)

    def update_transaction(
        self,
        transaction_id: uuid.UUID,
        user_id: uuid.UUID,
        body: TransactionUpdate,
    ) -> Transaction:
        transaction = self.get_transaction(transaction_id, user_id)
        updates = body.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(transaction, field, value)
        self.session.commit()
        self.session.refresh(transaction)
        return self.get_transaction(transaction.id, user_id)

    def delete_transaction(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        transaction = self.get_transaction(transaction_id, user_id)
        transaction.deleted_at = datetime.now(timezone.utc)
        self.session.commit()

    def restore_transaction(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction:
        # Need to find even soft-deleted transactions for restore
        transaction = (
            self.session.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id,
                Transaction.deleted_at.isnot(None),
            )
            .first()
        )
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        transaction.deleted_at = None
        self.session.commit()
        self.session.refresh(transaction)
        return self.get_transaction(transaction.id, user_id)
