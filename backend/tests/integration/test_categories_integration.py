from app.db.schema import Category
from app.db.session import get_db
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _register_and_auth(client, email="alice@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "name": "Alice", "password": "password123"},
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": "password123"},
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _seed_defaults(client):
    """Insert default categories directly into the test DB."""
    db = next(app.dependency_overrides[get_db]())
    defaults = [
        Category(name="Food & Dining", color="#EF4444", is_default=True, user_id=None),
        Category(name="Transport", color="#3B82F6", is_default=True, user_id=None),
    ]
    for cat in defaults:
        db.add(cat)
    db.commit()


def _create_category(client, headers, name="Custom Cat", color="#FF0000"):
    resp = client.post(
        "/api/categories/",
        json={"name": name, "color": color},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# List (with defaults)
# ---------------------------------------------------------------------------


def test_list_categories_defaults(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _seed_defaults(client_with_test_db)

    resp = client_with_test_db.get("/api/categories/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    names = {c["name"] for c in data}
    assert "Food & Dining" in names
    assert "Transport" in names


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


def test_create_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/categories/",
        json={"name": "Groceries", "color": "#22C55E"},
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Groceries"
    assert data["color"] == "#22C55E"
    assert data["is_default"] is False
    assert "id" in data
    assert "created_at" in data


def test_create_category_empty_name(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/categories/",
        json={"name": "  ", "color": "#000000"},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_category_unauthenticated(client_with_test_db):
    resp = client_with_test_db.post(
        "/api/categories/",
        json={"name": "Test", "color": "#000000"},
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


def test_update_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    cat_id = _create_category(client_with_test_db, headers)

    resp = client_with_test_db.patch(
        f"/api/categories/{cat_id}",
        json={"name": "Updated Name"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"
    # color unchanged
    assert resp.json()["color"] == "#FF0000"


def test_update_default_category_forbidden(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _seed_defaults(client_with_test_db)

    # Get a default category id
    resp = client_with_test_db.get("/api/categories/", headers=headers)
    default_id = resp.json()[0]["id"]

    resp = client_with_test_db.patch(
        f"/api/categories/{default_id}",
        json={"name": "Hacked"},
        headers=headers,
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------


def test_delete_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    cat_id = _create_category(client_with_test_db, headers)

    resp = client_with_test_db.delete(
        f"/api/categories/{cat_id}", headers=headers
    )
    assert resp.status_code == 204

    # No longer in list
    resp = client_with_test_db.get("/api/categories/", headers=headers)
    ids = [c["id"] for c in resp.json()]
    assert cat_id not in ids


def test_delete_default_category_forbidden(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _seed_defaults(client_with_test_db)

    resp = client_with_test_db.get("/api/categories/", headers=headers)
    default_id = resp.json()[0]["id"]

    resp = client_with_test_db.delete(
        f"/api/categories/{default_id}", headers=headers
    )
    assert resp.status_code == 403


def test_delete_category_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.delete(
        "/api/categories/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert resp.status_code == 404
