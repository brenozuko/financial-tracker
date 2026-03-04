import uuid

from fastapi import HTTPException

from app.core.security import hash_password
from app.db.schema import User
from app.models.user import UserCreate, UserUpdate
from app.services.base import BaseService


class UsersService(BaseService):
    def list_users(self) -> list[User]:
        return self.session.query(User).order_by(User.created_at).all()

    def get_user(self, user_id: uuid.UUID) -> User:
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def create_user(self, body: UserCreate) -> User:
        existing = self.session.query(User).filter(User.email == body.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        user = User(
            email=body.email,
            name=body.name,
            hashed_password=hash_password(body.password),
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def update_user(self, user_id: uuid.UUID, body: UserUpdate) -> User:
        user = self.get_user(user_id)
        updates = body.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(user, field, value)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete_user(self, user_id: uuid.UUID) -> None:
        user = self.get_user(user_id)
        self.session.delete(user)
        self.session.commit()
