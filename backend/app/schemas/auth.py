from typing import Optional, Literal
from pydantic import BaseModel, Field

UserRole = Literal["admin", "profesor", "alumno", "padre"]

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or Username", min_length=1)
    secret: str = Field(..., description="Password or PIN", min_length=1)

class UserProfile(BaseModel):
    id: str
    colegio_id: str
    rol: UserRole
    nombre: str
    apellido: str
    correo: Optional[str] = None
    usuario: Optional[str] = None
    avatar: Optional[str] = "avatar-01"
    foto_url: Optional[str] = None
    activo: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

class LogoutResponse(BaseModel):
    message: str = "Sesión cerrada correctamente"
