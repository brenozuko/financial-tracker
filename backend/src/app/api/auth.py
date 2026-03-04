from app.db.session import get_db
from app.models.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.services.auth import AuthService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(session=db)


AuthServiceDep = Depends(get_auth_service)


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(body: RegisterRequest, service: AuthService = AuthServiceDep):
    return service.register(body)


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, service: AuthService = AuthServiceDep):
    return service.login(body)
