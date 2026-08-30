import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_obtener_cursos_profesor():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/profesores/prof-001/cursos")
    assert response.status_code == 200
    cursos = response.json()
    assert isinstance(cursos, list)
    assert len(cursos) >= 1
    curso = cursos[0]
    assert curso["profesor_id"] == "prof-001"
    assert "codigo_acceso" in curso
    assert "grafo_aprobado" in curso

@pytest.mark.asyncio
async def test_obtener_curso_por_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/cursos/cls-001")
    assert response.status_code == 200
    curso = response.json()
    assert curso["id"] == "cls-001"
    assert curso["materia"] == "Comunicación y Lenguaje" or "nombre" in curso

@pytest.mark.asyncio
async def test_obtener_curso_no_existente_devuelve_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/cursos/curso-ficticio-999")
    assert response.status_code == 404
