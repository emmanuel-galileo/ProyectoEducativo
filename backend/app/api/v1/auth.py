from datetime import datetime, timezone
import hashlib
from fastapi import APIRouter, HTTPException, Header, status
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile, LogoutResponse
from app.core.security import verify_password, create_access_token, decode_access_token
from app.db.supabase import get_supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    identifier = req.identifier.strip().lower()
    secret = req.secret.strip()
    supabase = get_supabase_client()

    # Search user by correo OR usuario
    res = supabase.table("usuarios").select("*").or_(f"correo.eq.{identifier},usuario.eq.{identifier}").execute()
    users = res.data or []
    if not users:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    user_record = users[0]
    if not user_record.get("activo", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta inactiva. Contacte al administrador.")

    role = user_record["rol"]
    is_valid = False

    if role == "alumno":
        # Check pin_hash
        is_valid = verify_password(secret, user_record.get("pin_hash") or "")
    else:
        # Check password_hash
        is_valid = verify_password(secret, user_record.get("password_hash") or "")

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    # Generate token
    token_data = {
        "sub": user_record["id"],
        "user_id": user_record["id"],
        "rol": role,
        "colegio_id": user_record["colegio_id"],
        "nombre": user_record["nombre"],
        "apellido": user_record["apellido"],
        "avatar": user_record.get("avatar", "avatar-01")
    }
    access_token = create_access_token(token_data)
    token_hash = hashlib.sha256(access_token.encode()).hexdigest()

    # Register session and update ultimo_acceso
    try:
        supabase.table("sesiones").insert({
            "usuario_id": user_record["id"],
            "token_hash": token_hash,
            "expira_en": (datetime.now(timezone.utc)).isoformat(),
            "revocada": False
        }).execute()
        supabase.table("usuarios").update({
            "ultimo_acceso": datetime.now(timezone.utc).isoformat()
        }).eq("id", user_record["id"]).execute()
    except Exception as e:
        print(f"Warning updating session/access timestamp: {e}")

    profile = UserProfile(
        id=user_record["id"],
        colegio_id=user_record["colegio_id"],
        rol=user_record["rol"],
        nombre=user_record["nombre"],
        apellido=user_record["apellido"],
        correo=user_record.get("correo"),
        usuario=user_record.get("usuario"),
        avatar=user_record.get("avatar") or "avatar-01",
        foto_url=user_record.get("foto_url"),
        activo=user_record.get("activo", True)
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=profile)

@router.get("/me", response_model=UserProfile)
async def get_me(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token no proporcionado")
    token = authorization.split(" ")[1]
    try:
        decoded = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    
    supabase = get_supabase_client()
    res = supabase.table("usuarios").select("*").eq("id", decoded["sub"]).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    
    user = res.data[0]
    return UserProfile(
        id=user["id"],
        colegio_id=user["colegio_id"],
        rol=user["rol"],
        nombre=user["nombre"],
        apellido=user["apellido"],
        correo=user.get("correo"),
        usuario=user.get("usuario"),
        avatar=user.get("avatar") or "avatar-01",
        foto_url=user.get("foto_url"),
        activo=user.get("activo", True)
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(authorization: str = Header(default="")):
    return LogoutResponse()
