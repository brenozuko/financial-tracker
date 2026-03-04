from app.core.security import create_access_token, hash_password, verify_password
from app.db.schema import User
from app.models.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services.base import BaseService
from fastapi import HTTPException, status


class AuthService(BaseService):
    def register(self, body: RegisterRequest) -> RegisterResponse:
        existing = self.session.query(User).filter(User.email == body.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user = User(
            email=body.email,
            name=body.name,
            hashed_password=hash_password(body.password),
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return RegisterResponse(
            access_token=create_access_token(user.id),
            user=user,
        )

    def login(self, body: LoginRequest) -> LoginResponse:
        user = self.session.query(User).filter(User.email == body.email).first()
        if not user or not verify_password(body.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return LoginResponse(access_token=create_access_token(user.id))

