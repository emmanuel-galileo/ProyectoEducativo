from typing import Optional
from pydantic import BaseModel, Field

class CursoRespuesta(BaseModel):
    id: str
    colegio_id: str
    profesor_id: str
    nombre: str
    materia: str
    grado: str
    seccion: str
    ciclo: int = 2026
    codigo_acceso: str
    aula_filas: int = 2
    aula_columnas: int = 5
    grafo_aprobado: bool = False
    activo: bool = True
