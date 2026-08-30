import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_admin_login_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "identifier": "admin@colegio.edu.gt",
            "secret": "Admin123!"
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["rol"] == "admin"
    assert data["user"]["correo"] == "admin@colegio.edu.gt"

@pytest.mark.asyncio
async def test_profesor_login_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "identifier": "maria.lopez@colegio.edu.gt",
            "secret": "Profe123!"
        })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["rol"] == "profesor"
    assert data["user"]["nombre"] == "María"

@pytest.mark.asyncio
async def test_padre_login_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "identifier": "carlos.solis@correo.com",
            "secret": "Padre123!"
        })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["rol"] == "padre"
    assert data["user"]["nombre"] == "Carlos"

@pytest.mark.asyncio
async def test_alumno_login_with_username_and_pin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "identifier": "ana.perez",
            "secret": "1234"
        })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["rol"] == "alumno"
    assert data["user"]["usuario"] == "ana.perez"

@pytest.mark.asyncio
async def test_invalid_credentials_returns_401():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "identifier": "admin@colegio.edu.gt",
            "secret": "WrongSecret"
        })
    assert response.status_code == 401
