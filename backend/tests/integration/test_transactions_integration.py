from datetime import datetime, timezone

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


def _create_transaction(client, headers, **overrides):
    payload = {
        "type": "expense",
        "description": "Grocery shopping",
        "amount": 50.0,
        "date": datetime.now(timezone.utc).isoformat(),
    }
    payload.update(overrides)
    resp = client.post("/api/transactions/", json=payload, headers=headers)
    assert resp.status_code == 201
    return resp.json()["id"]


def _create_category(client, headers, name="Food", color="#EF4444"):
    resp = client.post(
        "/api/categories/",
        json={"name": name, "color": color},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


def test_create_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "expense",
            "description": "Coffee",
            "amount": 4.5,
            "date": "2026-01-15T10:00:00Z",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["description"] == "Coffee"
    assert data["amount"] == 4.5
    assert data["type"] == "expense"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    assert data["category"] is None


def test_create_transaction_with_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    cat_id = _create_category(client_with_test_db, headers)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "expense",
            "description": "Lunch",
            "amount": 15.0,
            "date": "2026-01-15T12:00:00Z",
            "category_id": cat_id,
        },
        headers=headers,
    )
    assert resp.status_code == 201
    assert resp.json()["category"]["id"] == cat_id


def test_create_transaction_recurring(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "income",
            "description": "Salary",
            "amount": 5000.0,
            "date": "2026-01-01T00:00:00Z",
            "is_recurring": True,
            "recurrence_frequency": "monthly",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    assert resp.json()["is_recurring"] is True
    assert resp.json()["recurrence_frequency"] == "monthly"


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------


def test_list_transactions_empty(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.get("/api/transactions/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


def test_list_transactions_after_create(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_transaction(client_with_test_db, headers)

    resp = client_with_test_db.get("/api/transactions/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


# ---------------------------------------------------------------------------
# Get
# ---------------------------------------------------------------------------


def test_get_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    txn_id = _create_transaction(client_with_test_db, headers)

    resp = client_with_test_db.get(
        f"/api/transactions/{txn_id}", headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == txn_id


def test_get_transaction_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.get(
        "/api/transactions/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert resp.status_code == 404


def test_get_transaction_wrong_user(client_with_test_db):
    headers_alice = _register_and_auth(client_with_test_db, email="alice@example.com")
    txn_id = _create_transaction(client_with_test_db, headers_alice)

    headers_bob = _register_and_auth(client_with_test_db, email="bob@example.com")
    resp = client_with_test_db.get(
        f"/api/transactions/{txn_id}", headers=headers_bob
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


def test_update_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    txn_id = _create_transaction(client_with_test_db, headers)

    resp = client_with_test_db.patch(
        f"/api/transactions/{txn_id}",
        json={"description": "Updated description", "amount": 99.99},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["description"] == "Updated description"
    assert data["amount"] == 99.99
    # type unchanged
    assert data["type"] == "expense"


def test_update_transaction_partial(client_with_test_db):
    """PATCH with one field does NOT overwrite other fields."""
    headers = _register_and_auth(client_with_test_db)
    txn_id = _create_transaction(
        client_with_test_db, headers, description="Original", amount=25.0
    )

    resp = client_with_test_db.patch(
        f"/api/transactions/{txn_id}",
        json={"amount": 30.0},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["description"] == "Original"
    assert resp.json()["amount"] == 30.0


def test_update_transaction_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.patch(
        "/api/transactions/00000000-0000-0000-0000-000000000000",
        json={"description": "Nope"},
        headers=headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Delete & Restore
# ---------------------------------------------------------------------------


def test_delete_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    txn_id = _create_transaction(client_with_test_db, headers)

    resp = client_with_test_db.delete(
        f"/api/transactions/{txn_id}", headers=headers
    )
    assert resp.status_code == 204

    # GET returns 404 after soft delete
    resp = client_with_test_db.get(
        f"/api/transactions/{txn_id}", headers=headers
    )
    assert resp.status_code == 404

    # Not in list either
    resp = client_with_test_db.get("/api/transactions/", headers=headers)
    assert resp.json()["total"] == 0


def test_delete_transaction_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.delete(
        "/api/transactions/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert resp.status_code == 404


def test_restore_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    txn_id = _create_transaction(client_with_test_db, headers)

    # Delete
    client_with_test_db.delete(f"/api/transactions/{txn_id}", headers=headers)

    # Restore
    resp = client_with_test_db.post(
        f"/api/transactions/{txn_id}/restore", headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == txn_id

    # GET works again
    resp = client_with_test_db.get(
        f"/api/transactions/{txn_id}", headers=headers
    )
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def test_create_transaction_empty_description(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "expense",
            "description": "  ",
            "amount": 10.0,
            "date": "2026-01-01T00:00:00Z",
        },
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_transaction_negative_amount(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "expense",
            "description": "Bad",
            "amount": -5.0,
            "date": "2026-01-01T00:00:00Z",
        },
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_transaction_missing_required(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/transactions/",
        json={"type": "expense"},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_transaction_unauthenticated(client_with_test_db):
    resp = client_with_test_db.post(
        "/api/transactions/",
        json={
            "type": "expense",
            "description": "Test",
            "amount": 10.0,
            "date": "2026-01-01T00:00:00Z",
        },
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------


def test_list_transactions_pagination(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    # Create 15 transactions
    for i in range(15):
        _create_transaction(
            client_with_test_db,
            headers,
            description=f"Item {i}",
            amount=float(i + 1),
        )

    # Page 1 (default page_size=10)
    resp = client_with_test_db.get("/api/transactions/", headers=headers)
    data = resp.json()
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_pages"] == 2
    assert len(data["items"]) == 10

    # Page 2
    resp = client_with_test_db.get(
        "/api/transactions/?page=2", headers=headers
    )
    data = resp.json()
    assert len(data["items"]) == 5
    assert data["page"] == 2


# ---------------------------------------------------------------------------
# Filtering
# ---------------------------------------------------------------------------


def test_list_transactions_filter_by_type(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_transaction(client_with_test_db, headers, type="income", description="Salary", amount=5000)
    _create_transaction(client_with_test_db, headers, type="expense", description="Coffee", amount=5)

    resp = client_with_test_db.get(
        "/api/transactions/?type=income", headers=headers
    )
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["type"] == "income"


def test_list_transactions_filter_by_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    cat_id = _create_category(client_with_test_db, headers)
    _create_transaction(client_with_test_db, headers, category_id=cat_id)
    _create_transaction(client_with_test_db, headers, description="No category")

    resp = client_with_test_db.get(
        f"/api/transactions/?category_id={cat_id}", headers=headers
    )
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["category"]["id"] == cat_id


def test_list_transactions_filter_by_date_range(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_transaction(
        client_with_test_db, headers,
        description="Jan", date="2026-01-15T00:00:00Z"
    )
    _create_transaction(
        client_with_test_db, headers,
        description="Mar", date="2026-03-15T00:00:00Z"
    )

    resp = client_with_test_db.get(
        "/api/transactions/?date_from=2026-03-01&date_to=2026-03-31",
        headers=headers,
    )
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["description"] == "Mar"


def test_list_transactions_search(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_transaction(client_with_test_db, headers, description="Weekly groceries")
    _create_transaction(client_with_test_db, headers, description="Coffee shop")

    resp = client_with_test_db.get(
        "/api/transactions/?search=grocer", headers=headers
    )
    data = resp.json()
    assert data["total"] == 1
    assert "groceries" in data["items"][0]["description"].lower()


def test_list_transactions_sort_by_amount(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_transaction(client_with_test_db, headers, amount=100.0, description="Big")
    _create_transaction(client_with_test_db, headers, amount=5.0, description="Small")

    resp = client_with_test_db.get(
        "/api/transactions/?sort_by=amount&sort_order=asc", headers=headers
    )
    items = resp.json()["items"]
    assert items[0]["amount"] == 5.0
    assert items[1]["amount"] == 100.0
