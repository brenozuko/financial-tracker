import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import or_

from app.db.schema import Category
from app.models.category import CategoryCreate, CategoryUpdate
from app.services.base import BaseService


class CategoriesService(BaseService):

    def list_categories(self, user_id: uuid.UUID) -> list[Category]:
        return (
            self.session.query(Category)
            .filter(
                Category.deleted_at.is_(None),
                or_(Category.user_id.is_(None), Category.user_id == user_id),
            )
            .order_by(Category.name)
            .all()
        )

    def get_category(self, category_id: uuid.UUID) -> Category:
        category = (
            self.session.query(Category)
            .filter(Category.id == category_id, Category.deleted_at.is_(None))
            .first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    def create_category(self, body: CategoryCreate, user_id: uuid.UUID) -> Category:
        category = Category(**body.model_dump(), user_id=user_id, is_default=False)
        self.session.add(category)
        self.session.commit()
        self.session.refresh(category)
        return category

    def update_category(
        self, category_id: uuid.UUID, user_id: uuid.UUID, body: CategoryUpdate
    ) -> Category:
        category = self.get_category(category_id)
        if category.is_default or category.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="Cannot modify a default category"
            )
        updates = body.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(category, field, value)
        self.session.commit()
        self.session.refresh(category)
        return category

    def delete_category(
        self, category_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        category = self.get_category(category_id)
        if category.is_default or category.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="Cannot delete a default category"
            )
        category.deleted_at = datetime.now(timezone.utc)
        self.session.commit()
