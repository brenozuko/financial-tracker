import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.session import get_db
from app.models.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.categories import CategoriesService

router = APIRouter(prefix="/categories", tags=["categories"])


def get_categories_service(db: Session = Depends(get_db)) -> CategoriesService:
    return CategoriesService(session=db)


CategoriesServiceDep = Depends(get_categories_service)


@router.get("/", response_model=list[CategoryResponse])
def list_categories(
    current_user: CurrentUser,
    service: CategoriesService = CategoriesServiceDep,
):
    return service.list_categories(current_user.id)


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    body: CategoryCreate,
    current_user: CurrentUser,
    service: CategoriesService = CategoriesServiceDep,
):
    return service.create_category(body, current_user.id)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: uuid.UUID,
    body: CategoryUpdate,
    current_user: CurrentUser,
    service: CategoriesService = CategoriesServiceDep,
):
    return service.update_category(category_id, current_user.id, body)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: uuid.UUID,
    current_user: CurrentUser,
    service: CategoriesService = CategoriesServiceDep,
):
    service.delete_category(category_id, current_user.id)
