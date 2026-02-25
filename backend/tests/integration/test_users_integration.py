def test_list_users_empty(client_with_test_db):
    resp = client_with_test_db.get("/api/users/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_user(client_with_test_db):
    resp = client_with_test_db.post(
        "/api/users/",
        json={"email": "alice@example.com", "name": "Alice", "password": "secret123"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"
    assert "hashed_password" not in data


def test_create_user_duplicate_email(client_with_test_db):
    payload = {"email": "bob@example.com", "name": "Bob", "password": "pass"}
    client_with_test_db.post("/api/users/", json=payload)
    resp = client_with_test_db.post("/api/users/", json=payload)
    assert resp.status_code == 409


def test_get_user(client_with_test_db):
    create_resp = client_with_test_db.post(
        "/api/users/",
        json={"email": "carol@example.com", "name": "Carol", "password": "pw"},
    )
    user_id = create_resp.json()["id"]

    resp = client_with_test_db.get(f"/api/users/{user_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id


def test_update_user(client_with_test_db):
    create_resp = client_with_test_db.post(
        "/api/users/",
        json={"email": "dave@example.com", "name": "Dave", "password": "pw"},
    )
    user_id = create_resp.json()["id"]

    resp = client_with_test_db.patch(f"/api/users/{user_id}", json={"name": "David"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "David"


def test_delete_user(client_with_test_db):
    create_resp = client_with_test_db.post(
        "/api/users/",
        json={"email": "eve@example.com", "name": "Eve", "password": "pw"},
    )
    user_id = create_resp.json()["id"]

    resp = client_with_test_db.delete(f"/api/users/{user_id}")
    assert resp.status_code == 204

    resp = client_with_test_db.get(f"/api/users/{user_id}")
    assert resp.status_code == 404


def test_get_user_not_found(client_with_test_db):
    resp = client_with_test_db.get("/api/users/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
