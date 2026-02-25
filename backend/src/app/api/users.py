import uuid

from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.models.user import UserCreate, UserResponse, UserUpdate
from app.services.users import UsersService
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


def get_users_service(db: Session = Depends(get_db)) -> UsersService:
    return UsersService(session=db)


UsersServiceDep = Depends(get_users_service)


@router.get("/", response_model=list[UserResponse])
def list_users(service: UsersService = UsersServiceDep):
    return service.list_users()


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(body: UserCreate, service: UsersService = UsersServiceDep):
    return service.create_user(body)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: uuid.UUID, service: UsersService = UsersServiceDep):
    return service.get_user(user_id)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    service: UsersService = UsersServiceDep,
):
    return service.update_user(user_id, body)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: uuid.UUID, service: UsersService = UsersServiceDep):
    service.delete_user(user_id)
