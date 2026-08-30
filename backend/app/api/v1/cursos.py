from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.curso import CursoRespuesta
from app.db.supabase import get_supabase_client

router = APIRouter(tags=["cursos"])

@router.get("/profesores/{profesor_id}/cursos", response_model=List[CursoRespuesta])
async def obtener_cursos_profesor(profesor_id: str):
    supabase = get_supabase_client()
    res = (
        supabase.table("cursos")
        .select("*")
        .eq("profesor_id", profesor_id)
        .eq("activo", True)
        .order("nombre")
        .execute()
    )
    return res.data or []

@router.get("/cursos/{id}", response_model=CursoRespuesta)
async def obtener_curso(id: str):
    supabase = get_supabase_client()
    res = supabase.table("cursos").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso no encontrado."
        )
    return res.data[0]

@router.get("/clases/{id}", response_model=CursoRespuesta)
async def obtener_clase_alias(id: str):
    return await obtener_curso(id)
