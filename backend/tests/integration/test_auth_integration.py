
# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _register(client, email="alice@example.com", name="Alice", password="password123"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "name": name, "password": password},
    )


def _login(client, email="alice@example.com", password="password123"):
    return client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )


def _auth_header(client, email="alice@example.com", password="password123"):
    resp = _login(client, email=email, password=password)
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------


def test_register_success(client_with_test_db):
    resp = _register(client_with_test_db)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["name"] == "Alice"
    assert "id" in data["user"]
    assert "hashed_password" not in data["user"]


def test_register_duplicate_email(client_with_test_db):
    _register(client_with_test_db)
    resp = _register(client_with_test_db)
    assert resp.status_code == 409


def test_register_weak_password(client_with_test_db):
    resp = _register(client_with_test_db, password="short")
    assert resp.status_code == 422


def test_register_empty_name(client_with_test_db):
    resp = _register(client_with_test_db, name="   ")
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


def test_login_success(client_with_test_db):
    _register(client_with_test_db)
    resp = _login(client_with_test_db)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client_with_test_db):
    _register(client_with_test_db)
    resp = _login(client_with_test_db, password="wrongpassword")
    assert resp.status_code == 401


def test_login_unknown_email(client_with_test_db):
    resp = _login(client_with_test_db, email="nobody@example.com")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# DELETE /users/me
# ---------------------------------------------------------------------------


def test_delete_me_success(client_with_test_db):
    _register(client_with_test_db)
    headers = _auth_header(client_with_test_db)

    resp = client_with_test_db.delete("/api/users/me", headers=headers)
    assert resp.status_code == 204

    # Login should fail after deletion
    resp = _login(client_with_test_db)
    assert resp.status_code == 401


def test_delete_me_unauthenticated(client_with_test_db):
    resp = client_with_test_db.delete("/api/users/me")
    assert resp.status_code == 401
