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


def _create_expense(client, headers, **overrides):
    payload = {
        "name": "Netflix",
        "amount": 15.99,
        "due_day": 15,
    }
    payload.update(overrides)
    resp = client.post("/api/recurring-expenses/", json=payload, headers=headers)
    assert resp.status_code == 201
    return resp.json()["id"]


def _create_category(client, headers, name="Entertainment", color="#8B5CF6"):
    resp = client.post(
        "/api/categories/",
        json={"name": name, "color": color},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------


def test_list_recurring_expenses_empty(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


def test_create_recurring_expense(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)

    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Netflix", "amount": 15.99, "due_day": 15},
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Netflix"
    assert data["amount"] == 15.99
    assert data["due_day"] == 15
    assert data["category"] is None
    assert data["notes"] is None
    assert data["is_paid"] is False
    assert data["paid_transaction_id"] is None
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_recurring_expense_with_category(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    cat_id = _create_category(client_with_test_db, headers)

    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Spotify", "amount": 9.99, "due_day": 1, "category_id": cat_id},
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"]["id"] == cat_id


# ---------------------------------------------------------------------------
# Get
# ---------------------------------------------------------------------------


def test_get_recurring_expense(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    resp = client_with_test_db.get(
        f"/api/recurring-expenses/{expense_id}", headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == expense_id


def test_get_recurring_expense_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = client_with_test_db.get(
        f"/api/recurring-expenses/{fake_id}", headers=headers
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# List after create
# ---------------------------------------------------------------------------


def test_list_recurring_expenses_after_create(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    _create_expense(client_with_test_db, headers)

    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------


def test_update_recurring_expense(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    resp = client_with_test_db.patch(
        f"/api/recurring-expenses/{expense_id}",
        json={"name": "Netflix 4K", "amount": 22.99},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Netflix 4K"
    assert data["amount"] == 22.99
    assert data["due_day"] == 15  # unchanged


def test_update_recurring_expense_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = client_with_test_db.patch(
        f"/api/recurring-expenses/{fake_id}",
        json={"name": "Updated"},
        headers=headers,
    )
    assert resp.status_code == 404


def test_partial_update_safe(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(
        client_with_test_db, headers, notes="Monthly subscription"
    )

    # Only update amount — other fields must stay the same
    resp = client_with_test_db.patch(
        f"/api/recurring-expenses/{expense_id}",
        json={"amount": 19.99},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 19.99
    assert data["name"] == "Netflix"
    assert data["due_day"] == 15
    assert data["notes"] == "Monthly subscription"


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------


def test_delete_recurring_expense(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    resp = client_with_test_db.delete(
        f"/api/recurring-expenses/{expense_id}", headers=headers
    )
    assert resp.status_code == 204

    # GET returns 404 after delete
    resp = client_with_test_db.get(
        f"/api/recurring-expenses/{expense_id}", headers=headers
    )
    assert resp.status_code == 404

    # Absent from list
    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    assert resp.json() == []


def test_delete_recurring_expense_not_found(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = client_with_test_db.delete(
        f"/api/recurring-expenses/{fake_id}", headers=headers
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def test_create_recurring_expense_empty_name(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "", "amount": 10.0, "due_day": 15},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_recurring_expense_negative_amount(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Netflix", "amount": -5.0, "due_day": 15},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_recurring_expense_invalid_due_day_zero(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Netflix", "amount": 15.99, "due_day": 0},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_recurring_expense_invalid_due_day_32(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Netflix", "amount": 15.99, "due_day": 32},
        headers=headers,
    )
    assert resp.status_code == 422


def test_create_recurring_expense_missing_required_field(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    # Missing due_day
    resp = client_with_test_db.post(
        "/api/recurring-expenses/",
        json={"name": "Netflix", "amount": 15.99},
        headers=headers,
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Mark Paid / Unpaid
# ---------------------------------------------------------------------------


def test_mark_paid_creates_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    pay_date = "2026-03-15T10:00:00Z"
    resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recurring_expense_id"] == expense_id
    assert data["type"] == "expense"
    assert data["amount"] == 15.99
    assert data["description"] == "Netflix"
    assert "billing_period" in data


def test_mark_paid_with_custom_date(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    pay_date = "2026-03-20T14:30:00Z"
    resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )
    assert resp.status_code == 200
    # Date in response should reflect the user-provided date
    assert "2026-03-20" in resp.json()["date"]


def test_mark_paid_already_paid_returns_409(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    pay_date = datetime.now(timezone.utc).isoformat()
    client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )

    # Second attempt for the same period
    resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )
    assert resp.status_code == 409


def test_mark_unpaid_soft_deletes_transaction(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    pay_date = datetime.now(timezone.utc).isoformat()
    paid_resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )
    transaction_id = paid_resp.json()["id"]

    resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-unpaid",
        headers=headers,
    )
    assert resp.status_code == 204

    # Transaction is soft-deleted — GET returns 404
    resp = client_with_test_db.get(
        f"/api/transactions/{transaction_id}", headers=headers
    )
    assert resp.status_code == 404


def test_mark_unpaid_when_not_paid_returns_404(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    resp = client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-unpaid",
        headers=headers,
    )
    assert resp.status_code == 404


def test_list_includes_is_paid(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    # Before mark-paid
    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    assert resp.json()[0]["is_paid"] is False

    # Mark as paid
    pay_date = datetime.now(timezone.utc).isoformat()
    client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )

    # After mark-paid
    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    item = resp.json()[0]
    assert item["is_paid"] is True
    assert item["paid_transaction_id"] is not None


def test_list_is_paid_after_mark_unpaid(client_with_test_db):
    headers = _register_and_auth(client_with_test_db)
    expense_id = _create_expense(client_with_test_db, headers)

    pay_date = datetime.now(timezone.utc).isoformat()
    client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-paid",
        json={"date": pay_date},
        headers=headers,
    )
    client_with_test_db.post(
        f"/api/recurring-expenses/{expense_id}/mark-unpaid",
        headers=headers,
    )

    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers)
    assert resp.json()[0]["is_paid"] is False
    assert resp.json()[0]["paid_transaction_id"] is None


# ---------------------------------------------------------------------------
# Auth guards
# ---------------------------------------------------------------------------


def test_list_requires_auth(client_with_test_db):
    resp = client_with_test_db.get("/api/recurring-expenses/")
    assert resp.status_code == 401


def test_user_isolation(client_with_test_db):
    headers_a = _register_and_auth(client_with_test_db, email="alice@example.com")
    headers_b = _register_and_auth(client_with_test_db, email="bob@example.com")

    _create_expense(client_with_test_db, headers_a)

    resp = client_with_test_db.get("/api/recurring-expenses/", headers=headers_b)
    assert resp.json() == []
