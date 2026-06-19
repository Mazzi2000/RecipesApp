

def test_statistics_returns_a_count(client):
    res = client.get("/api/statistics")
    assert res.status_code == 200
    assert res.get_json() == 0          # fresh DB has zero recipes


def test_recipe_tags_is_public_and_returns_a_list(client):
    res = client.get("/api/recipe-tags")
    assert res.status_code == 200
    assert res.get_json() == []


def test_recipes_requires_login(client):
    res = client.get("/api/recipes")
    assert res.status_code == 401       # @login_required kicks in


def test_login_rejects_bad_credentials(client):
    res = client.post("/api/auth/login", json={
        "username": "nope",
        "password": "wrong",
    })
    assert res.status_code == 401


def test_login_requires_username_and_password(client):
    res = client.post("/api/auth/login", json={})
    assert res.status_code == 400