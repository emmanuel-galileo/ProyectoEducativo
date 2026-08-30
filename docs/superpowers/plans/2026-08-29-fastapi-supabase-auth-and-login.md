# FastAPI Supabase Authentication & Multi-App Role Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a FastAPI backend in `/backend` authenticating against Supabase with bcrypt password/PIN verification and JWT issuance, seed test accounts across 4 roles, and integrate a unified Angular login screen with role-mismatch protection in both `panel-docente-admin` and `pwa-alumnos-padres`.

**Architecture:** A lightweight FastAPI server validates credentials against `public.usuarios` in Supabase, tracks active tokens in `public.sesiones`, and returns user role claims. A shared Angular library (`core-shared`) provides a signal-based `AuthService` and a glassmorphic `LoginComponent` with single-input smart recognition, while both apps configure role guards and sibling redirection modals.

**Tech Stack:** Python 3.10+, FastAPI, Uvicorn, Supabase Python Client, Passlib (Bcrypt), Python-Jose (JWT), Angular 22, TypeScript 6, SCSS, Vitest, Pytest.

**Spec:** `docs/superpowers/specs/2026-08-29-fastapi-auth-and-login-design.md`

## Global Constraints
- Target Framework: Angular 22 standalone architecture (no `standalone: true`, default `OnPush`, Signal state management, native `@if`/`@for`).
- Zero placeholders: All implementations, test files, and configurations must be complete and fully functional.
- Supabase Project URL: `https://rftonfanpyofetgbpqzk.supabase.co`
- Allowed roles per app:
  - `panel-docente-admin`: `admin`, `profesor`
  - `pwa-alumnos-padres`: `alumno`, `padre`

---

### Task 1: Backend Scaffolding, Security Layer, and Seed Script

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/security.py`
- Create: `backend/app/db/supabase.py`
- Create: `backend/scripts/seed_users.py`
- Test: `backend/tests/test_security.py`

**Interfaces:**
- Produces: `verify_password(plain, hashed) -> bool`, `get_password_hash(secret) -> str`, `create_access_token(data, expires_delta) -> str`, `get_supabase_client() -> Client`

- [ ] **Step 1: Write the failing security & hashing tests**

```python
# backend/tests/test_security.py
import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

def test_password_hashing_and_verification():
    password = "AdminSecret123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_pin_hashing_and_verification():
    pin = "1234"
    hashed = get_password_hash(pin)
    assert verify_password(pin, hashed) is True
    assert verify_password("0000", hashed) is False

def test_jwt_creation_and_decoding():
    payload = {"sub": "admin-001", "rol": "admin", "nombre": "Carmen"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "admin-001"
    assert decoded["rol"] == "admin"
    assert decoded["nombre"] == "Carmen"
```

- [ ] **Step 2: Create `backend/requirements.txt` and `.env`**

```txt
fastapi>=0.115.0
uvicorn>=0.30.0
pydantic>=2.8.0
pydantic-settings>=2.4.0
supabase>=2.7.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt>=4.0.1
python-dotenv>=1.0.1
pytest>=8.3.0
httpx>=0.27.0
```

```env
SUPABASE_URL=https://rftonfanpyofetgbpqzk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdG9uZmFucHlvZmV0Z2JwcXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjA4NjgsImV4cCI6MjEwMzU5Njg2OH0.qKdpS-Zqk6t4pgabwGMIadOpE1BnMNhvF4UQwjpeDcQ
JWT_SECRET=super-secret-educational-platform-key-2026-adaptativa
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

- [ ] **Step 3: Implement `backend/app/core/config.py`, `backend/app/core/security.py`, and `backend/app/db/supabase.py`**

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://rftonfanpyofetgbpqzk.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-educational-platform-key-2026-adaptativa")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    CORS_ORIGINS: list[str] = [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
    ]

settings = Settings()
```

```python
# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc
```

```python
# backend/app/db/supabase.py
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client
```

- [ ] **Step 4: Implement `backend/scripts/seed_users.py`**

```python
# backend/scripts/seed_users.py
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.security import get_password_hash
from app.db.supabase import get_supabase_client

USERS_TO_SEED = [
    {"id": "admin-001", "type": "password", "value": "Admin123!"},
    {"id": "prof-001", "type": "password", "value": "Profe123!"},
    {"id": "padre-01", "type": "password", "value": "Padre123!"},
    {"id": "a01", "type": "pin", "value": "1234"},
    {"id": "a02", "type": "pin", "value": "1234"},
    {"id": "a03", "type": "pin", "value": "1234"},
    {"id": "a04", "type": "pin", "value": "1234"},
    {"id": "a05", "type": "pin", "value": "1234"},
    {"id": "a06", "type": "pin", "value": "1234"},
    {"id": "a07", "type": "pin", "value": "1234"},
    {"id": "a08", "type": "pin", "value": "1234"},
    {"id": "a09", "type": "pin", "value": "1234"},
    {"id": "a10", "type": "pin", "value": "1234"},
]

def seed_sample_users():
    supabase = get_supabase_client()
    print("🌱 Seeding sample passwords & PINs in Supabase...")
    for user_def in USERS_TO_SEED:
        hashed = get_password_hash(user_def["value"])
        update_data = {}
        if user_def["type"] == "password":
            update_data["password_hash"] = hashed
            update_data["password_temporal"] = False
        else:
            update_data["pin_hash"] = hashed
        
        response = supabase.table("usuarios").update(update_data).eq("id", user_def["id"]).execute()
        print(f"  ✓ User '{user_def['id']}' ({user_def['type']}) updated.")
    print("🎉 All sample users seeded successfully.")

if __name__ == "__main__":
    seed_sample_users()
```

- [ ] **Step 5: Run security tests and seed script**
- Test: `pytest backend/tests/test_security.py`
- Run: `python backend/scripts/seed_users.py`

---

### Task 2: FastAPI Auth Endpoints & Main Application

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/api/v1/auth.py`
- Create: `backend/app/main.py`
- Test: `backend/tests/test_auth_endpoints.py`

**Interfaces:**
- Produces: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`

- [ ] **Step 1: Write integration tests for auth endpoints**

```python
# backend/tests/test_auth_endpoints.py
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
```

- [ ] **Step 2: Implement schemas in `backend/app/schemas/auth.py`**

```python
# backend/app/schemas/auth.py
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
```

- [ ] **Step 3: Implement endpoints in `backend/app/api/v1/auth.py` and `backend/app/main.py`**

```python
# backend/app/api/v1/auth.py
from datetime import datetime, timezone
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Header, status
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
        print(f"Warning inserting session log: {e}")

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
async def logout(authorization: str = Header(...)):
    return LogoutResponse()
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.auth import router as auth_router

app = FastAPI(
    title="Plataforma Educativa Adaptativa API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "plataforma-adaptativa-api"}
```

- [ ] **Step 4: Run unit & integration tests to verify backend passes**
- Run: `pytest backend/tests/ -v`

---

### Task 3: Shared Models and Signal-Based AuthService in `core-shared`

**Files:**
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/models/auth.models.ts`
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/services/auth.service.ts`
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/services/auth.service.spec.ts`
- Modify: `plataforma-adaptativa/projects/core-shared/src/public-api.ts`

**Interfaces:**
- Produces: `AuthService` (`currentUser`, `token`, `isLoading`, `errorMessage`, `mismatchNotice`, `login()`, `logout()`, `clearMismatchNotice()`)

- [ ] **Step 1: Write failing unit test for `AuthService`**

```typescript
// projects/core-shared/src/lib/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle role mismatch without saving token to localStorage', () => {
    const allowedRoles: UserRole[] = ['alumno', 'padre'];
    
    service.login('admin@colegio.edu.gt', 'Admin123!', allowedRoles, {
      portalUrl: 'http://localhost:4200',
      portalName: 'Portal Docente y Administrativo',
      mismatchMessage: 'Esta aplicación está optimizada para alumnos y familias.'
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/v1/auth/login');
    req.flush({
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
      user: {
        id: 'admin-001',
        colegio_id: 'col-001',
        rol: 'admin',
        nombre: 'Carmen',
        apellido: 'Girón',
        correo: 'admin@colegio.edu.gt',
        usuario: null,
        avatar: 'avatar-01'
      }
    });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(service.mismatchNotice()).not.toBeNull();
    expect(service.mismatchNotice()?.userName).toBe('Carmen');
  });
});
```

- [ ] **Step 2: Implement models in `auth.models.ts`**

```typescript
// projects/core-shared/src/lib/models/auth.models.ts
export type UserRole = 'admin' | 'profesor' | 'alumno' | 'padre';

export interface UserProfile {
  id: string;
  colegio_id: string;
  rol: UserRole;
  nombre: string;
  apellido: string;
  correo: string | null;
  usuario: string | null;
  avatar: string;
  foto_url?: string | null;
  activo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface SiblingPortalConfig {
  portalUrl: string;
  portalName: string;
  mismatchMessage: string;
}

export interface RoleMismatchNotice {
  userName: string;
  userRole: UserRole;
  message: string;
  targetPortalUrl: string;
  targetPortalName: string;
}
```

- [ ] **Step 3: Implement `AuthService` in `auth.service.ts`**

```typescript
// projects/core-shared/src/lib/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { AuthResponse, RoleMismatchNotice, SiblingPortalConfig, UserProfile, UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8000/api/v1/auth';

  private readonly tokenKey = 'sp2_access_token';
  private readonly userKey = 'sp2_user_profile';

  // Signals
  readonly currentUser = signal<UserProfile | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly mismatchNotice = signal<RoleMismatchNotice | null>(null);

  // Derived state
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  private getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  login(
    identifier: string,
    secret: string,
    allowedRoles: UserRole[],
    siblingConfig: SiblingPortalConfig
  ): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.mismatchNotice.set(null);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { identifier, secret }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        const userRole = res.user.rol;

        if (!allowedRoles.includes(userRole)) {
          // Role boundary protection: Do not store token
          this.mismatchNotice.set({
            userName: `${res.user.nombre} ${res.user.apellido}`.trim(),
            userRole: userRole,
            message: siblingConfig.mismatchMessage,
            targetPortalUrl: siblingConfig.portalUrl,
            targetPortalName: siblingConfig.portalName,
          });
          return;
        }

        // Allowed role: persist and activate session
        localStorage.setItem(this.tokenKey, res.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.token.set(res.access_token);
        this.currentUser.set(res.user);

        // Navigate to role route
        this.router.navigate([`/${userRole}`]);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail || 'Error al iniciar sesión. Verifique sus credenciales.';
        this.errorMessage.set(detail);
        return throwError(() => new Error(detail));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.currentUser.set(null);
    this.mismatchNotice.set(null);
    this.router.navigate(['/login']);
  }

  clearMismatchNotice(): void {
    this.mismatchNotice.set(null);
  }
}
```

- [ ] **Step 4: Export models and service in `public-api.ts`**

```typescript
// projects/core-shared/src/public-api.ts
export * from './lib/models/auth.models';
export * from './lib/services/auth.service';
export * from './lib/components/login/login.component';
```

- [ ] **Step 5: Run tests for `AuthService`**
- Run: `ng test core-shared` (or Vitest test runner)

---

### Task 4: Shared Glassmorphic LoginComponent UI

**Files:**
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/components/login/login.component.ts`
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/components/login/login.component.html`
- Create: `plataforma-adaptativa/projects/core-shared/src/lib/components/login/login.component.scss`

**Interfaces:**
- Produces: `<lib-login [appName]="..." [portalSubtitle]="..." [allowedRoles]="[...]" [siblingConfig]="..."></lib-login>`

- [ ] **Step 1: Create `login.component.ts`**

```typescript
// projects/core-shared/src/lib/components/login/login.component.ts
import { Component, input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SiblingPortalConfig, UserRole } from '../../models/auth.models';

@Component({
  selector: 'lib-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly auth = inject(AuthService);

  readonly appName = input.required<string>();
  readonly portalSubtitle = input.required<string>();
  readonly allowedRoles = input.required<UserRole[]>();
  readonly siblingConfig = input.required<SiblingPortalConfig>();

  identifier = signal('');
  secret = signal('');
  showSecret = signal(false);

  toggleSecretVisibility(): void {
    this.showSecret.update((v) => !v);
  }

  fillDemo(identifier: string, secret: string): void {
    this.identifier.set(identifier);
    this.secret.set(secret);
  }

  onSubmit(): void {
    if (!this.identifier() || !this.secret()) return;
    this.auth.login(
      this.identifier(),
      this.secret(),
      this.allowedRoles(),
      this.siblingConfig()
    ).subscribe();
  }
}
```

- [ ] **Step 2: Create `login.component.html`**

```html
<!-- projects/core-shared/src/lib/components/login/login.component.html -->
<div class="login-wrapper">
  <div class="glow-orb glow-1"></div>
  <div class="glow-orb glow-2"></div>

  <div class="login-card">
    <!-- Header -->
    <header class="card-header">
      <div class="brand-badge">
        <span class="brand-icon">🎓</span>
        <span class="brand-name">Plataforma Adaptativa</span>
      </div>
      <h1 class="portal-title">{{ appName() }}</h1>
      <p class="portal-subtitle">{{ portalSubtitle() }}</p>
    </header>

    <!-- Error Alert -->
    @if (auth.errorMessage(); as error) {
      <div class="alert alert-error" role="alert">
        <span class="alert-icon">⚠️</span>
        <div class="alert-content">
          <strong>Error de acceso:</strong> {{ error }}
        </div>
      </div>
    }

    <!-- Form -->
    <form (ngSubmit)="onSubmit()" class="login-form">
      <div class="form-group">
        <label for="identifier">Correo Institucional o Usuario</label>
        <div class="input-wrapper">
          <span class="input-icon">👤</span>
          <input
            id="identifier"
            type="text"
            [ngModel]="identifier()"
            (ngModelChange)="identifier.set($event)"
            name="identifier"
            placeholder="ej. maria.lopez@colegio.edu.gt o ana.perez"
            required
            autocomplete="username"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="secret">Contraseña o PIN</label>
        <div class="input-wrapper">
          <span class="input-icon">🔒</span>
          <input
            id="secret"
            [type]="showSecret() ? 'text' : 'password'"
            [ngModel]="secret()"
            (ngModelChange)="secret.set($event)"
            name="secret"
            placeholder="Contraseña o PIN de 4 dígitos"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="toggle-btn"
            (click)="toggleSecretVisibility()"
            [attr.aria-label]="showSecret() ? 'Ocultar contraseña' : 'Ver contraseña'"
          >
            {{ showSecret() ? '👁️' : '🔒' }}
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="submit-btn"
        [disabled]="auth.isLoading() || !identifier() || !secret()"
      >
        @if (auth.isLoading()) {
          <span class="spinner"></span> Validando acceso...
        } @else {
          Ingresar al Portal
        }
      </button>
    </form>

    <!-- Demo Access Chips -->
    <div class="demo-section">
      <div class="divider">
        <span>Cuentas de Prueba</span>
      </div>
      <div class="chip-grid">
        <button
          type="button"
          class="demo-chip chip-admin"
          (click)="fillDemo('admin@colegio.edu.gt', 'Admin123!')"
        >
          <span class="chip-role">Admin</span>
          <span class="chip-hint">Carmen Girón</span>
        </button>
        <button
          type="button"
          class="demo-chip chip-profesor"
          (click)="fillDemo('maria.lopez@colegio.edu.gt', 'Profe123!')"
        >
          <span class="chip-role">Profesor</span>
          <span class="chip-hint">María López</span>
        </button>
        <button
          type="button"
          class="demo-chip chip-alumno"
          (click)="fillDemo('ana.perez', '1234')"
        >
          <span class="chip-role">Alumno</span>
          <span class="chip-hint">Ana Pérez (PIN)</span>
        </button>
        <button
          type="button"
          class="demo-chip chip-padre"
          (click)="fillDemo('carlos.solis@correo.com', 'Padre123!')"
        >
          <span class="chip-role">Padre</span>
          <span class="chip-hint">Carlos Solís</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Role Mismatch Modal / Notification Overlay -->
  @if (auth.mismatchNotice(); as notice) {
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-icon-badge">🔄</div>
        <h2 class="modal-title">Portal Incompatible</h2>
        <p class="modal-greeting">Hola, <strong>{{ notice.userName }}</strong> (Rol: <em>{{ notice.userRole }}</em>)</p>
        <p class="modal-message">{{ notice.message }}</p>
        <div class="modal-actions">
          <a
            [href]="notice.targetPortalUrl"
            class="modal-btn modal-btn-primary"
            target="_self"
          >
            Abrir {{ notice.targetPortalName }} ↗
          </a>
          <button
            type="button"
            class="modal-btn modal-btn-secondary"
            (click)="auth.clearMismatchNotice()"
          >
            Permanecer aquí
          </button>
        </div>
      </div>
    </div>
  }
</div>
```

- [ ] **Step 3: Create `login.component.scss` (Rich Glassmorphic Design)**

```scss
// projects/core-shared/src/lib/components/login/login.component.scss
.login-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: radial-gradient(circle at top left, #0f172a, #020617);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #f8fafc;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.35;
}

.glow-1 {
  width: 380px;
  height: 380px;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  top: -10%;
  left: 10%;
}

.glow-2 {
  width: 420px;
  height: 420px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  bottom: -10%;
  right: 10%;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 460px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.5rem;
  padding: 2.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.card-header {
  text-align: center;
  margin-bottom: 1.75rem;

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.25);
    color: #38bdf8;
    font-size: 0.825rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .portal-title {
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0;
    background: linear-gradient(to right, #ffffff, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .portal-subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.35rem;
  }
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.825rem;
      font-weight: 500;
      color: #cbd5e1;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 0.9rem;
        font-size: 1rem;
        pointer-events: none;
        opacity: 0.7;
      }

      input {
        width: 100%;
        padding: 0.8rem 2.5rem 0.8rem 2.5rem;
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.75rem;
        color: #fff;
        font-size: 0.925rem;
        outline: none;
        transition: all 0.2s ease;

        &:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
          background: rgba(30, 41, 59, 0.9);
        }

        &::placeholder {
          color: #64748b;
          font-size: 0.85rem;
        }
      }

      .toggle-btn {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        opacity: 0.7;
        &:hover { opacity: 1; }
      }
    }
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.85rem;
    border-radius: 0.75rem;
    border: none;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.35);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.demo-section {
  margin-top: 1.75rem;

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.85rem;

    &::before, &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    span { padding: 0 0.5rem; }
  }

  .chip-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;

    .demo-chip {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.5rem 0.75rem;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.6rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;

      .chip-role {
        font-size: 0.75rem;
        font-weight: 700;
      }
      .chip-hint {
        font-size: 0.7rem;
        color: #94a3b8;
      }

      &:hover {
        background: rgba(51, 65, 85, 0.8);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      &.chip-admin .chip-role { color: #f43f5e; }
      &.chip-profesor .chip-role { color: #38bdf8; }
      &.chip-alumno .chip-role { color: #4ade80; }
      &.chip-padre .chip-role { color: #fbbf24; }
    }
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.25rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);

  .modal-icon-badge {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  .modal-title {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0;
    color: #fff;
  }
  .modal-greeting {
    font-size: 0.95rem;
    color: #38bdf8;
    margin: 0.5rem 0 0.75rem;
  }
  .modal-message {
    font-size: 0.875rem;
    color: #cbd5e1;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .modal-btn {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;

      &.modal-btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        border: none;
        &:hover { background: linear-gradient(135deg, #059669, #047857); }
      }
      &.modal-btn-secondary {
        background: transparent;
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        &:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
      }
    }
  }
}
```

---

### Task 5: Portal Integration for `panel-docente-admin`

**Files:**
- Create: `plataforma-adaptativa/projects/panel-docente-admin/src/app/guards/role.guard.ts`
- Create: `plataforma-adaptativa/projects/panel-docente-admin/src/app/pages/login/login-page.component.ts`
- Create: `plataforma-adaptativa/projects/panel-docente-admin/src/app/pages/admin/admin-dashboard.component.ts`
- Create: `plataforma-adaptativa/projects/panel-docente-admin/src/app/pages/profesor/profesor-dashboard.component.ts`
- Modify: `plataforma-adaptativa/projects/panel-docente-admin/src/app/app.routes.ts`
- Modify: `plataforma-adaptativa/projects/panel-docente-admin/src/app/app.ts` & `app.html`

- [ ] **Step 1: Create `role.guard.ts` in `panel-docente-admin`**

```typescript
// projects/panel-docente-admin/src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from 'core-shared';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!auth.isAuthenticated() || !user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.rol)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
};
```

- [ ] **Step 2: Create `login-page.component.ts`, `admin-dashboard.component.ts`, `profesor-dashboard.component.ts` in `panel-docente-admin`**

```typescript
// projects/panel-docente-admin/src/app/pages/login/login-page.component.ts
import { Component } from '@angular/core';
import { LoginComponent, SiblingPortalConfig, UserRole } from 'core-shared';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <lib-login
      appName="Portal Docente y Administrativo"
      portalSubtitle="Gestión académica, configuración curricular y seguimiento grupal"
      [allowedRoles]="allowedRoles"
      [siblingConfig]="siblingConfig"
    />
  `,
})
export class LoginPageComponent {
  readonly allowedRoles: UserRole[] = ['admin', 'profesor'];
  readonly siblingConfig: SiblingPortalConfig = {
    portalUrl: 'http://localhost:4201',
    portalName: 'Aplicación Móvil Alumnos / Padres',
    mismatchMessage: 'Tu cuenta corresponde a un perfil de estudiante o padre de familia. Por favor accede desde la Aplicación Móvil / Tablet.',
  };
}
```

```typescript
// projects/panel-docente-admin/src/app/pages/admin/admin-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-layout">
      <header class="topbar">
        <div class="brand">
          <span class="icon">🏫</span>
          <strong>Colegio Demo &bull; Panel Administrador</strong>
        </div>
        <div class="user-meta">
          <span class="user-name">{{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }} ({{ auth.currentUser()?.rol }})</span>
          <button class="logout-btn" (click)="auth.logout()">Cerrar Sesión</button>
        </div>
      </header>
      <main class="content">
        <div class="welcome-card">
          <h1>Bienvenida, {{ auth.currentUser()?.nombre }} 👋</h1>
          <p>Panel de Control Administrativo: Visualización de colegios, docentes y métricas globales.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { min-height: 100vh; background: #0b1329; color: #fff; font-family: system-ui, sans-serif; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #152243; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .user-meta { display: flex; gap: 1rem; align-items: center; }
    .logout-btn { background: #e11d48; color: #fff; border: none; padding: 0.4rem 0.8rem; border-radius: 0.5rem; cursor: pointer; }
    .content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome-card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1); }
  `]
})
export class AdminDashboardComponent {
  readonly auth = inject(AuthService);
}
```

```typescript
// projects/panel-docente-admin/src/app/pages/profesor/profesor-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-profesor-dashboard',
  template: `
    <div class="dashboard-layout">
      <header class="topbar">
        <div class="brand">
          <span class="icon">📚</span>
          <strong>Colegio Demo &bull; Portal Docente</strong>
        </div>
        <div class="user-meta">
          <span class="user-name">Prof. {{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}</span>
          <button class="logout-btn" (click)="auth.logout()">Cerrar Sesión</button>
        </div>
      </header>
      <main class="content">
        <div class="welcome-card">
          <h1>Bienvenida, Prof. {{ auth.currentUser()?.nombre }} 👩‍🏫</h1>
          <p>Gestión de Cursos, Grafos de Conocimiento, Diagnósticos y Alertas en Tiempo Real.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { min-height: 100vh; background: #0b1329; color: #fff; font-family: system-ui, sans-serif; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #152243; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .user-meta { display: flex; gap: 1rem; align-items: center; }
    .logout-btn { background: #e11d48; color: #fff; border: none; padding: 0.4rem 0.8rem; border-radius: 0.5rem; cursor: pointer; }
    .content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome-card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1); }
  `]
})
export class ProfesorDashboardComponent {
  readonly auth = inject(AuthService);
}
```

- [ ] **Step 3: Update `app.routes.ts` in `panel-docente-admin`**

```typescript
// projects/panel-docente-admin/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'profesor',
    canActivate: [roleGuard(['profesor'])],
    loadComponent: () => import('./pages/profesor/profesor-dashboard.component').then((m) => m.ProfesorDashboardComponent),
  },
  { path: '**', redirectTo: 'login' },
];
```

- [ ] **Step 4: Update `app.ts` and `app.html` in `panel-docente-admin`**

```typescript
// projects/panel-docente-admin/src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `<router-outlet />`,
})
export class App {}
```

---

### Task 6: Portal Integration for `pwa-alumnos-padres`

**Files:**
- Create: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/guards/role.guard.ts`
- Create: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/pages/login/login-page.component.ts`
- Create: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/pages/alumno/alumno-dashboard.component.ts`
- Create: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/pages/padre/padre-dashboard.component.ts`
- Modify: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/app.routes.ts`
- Modify: `plataforma-adaptativa/projects/pwa-alumnos-padres/src/app/app.ts` & `app.html`

- [ ] **Step 1: Create `role.guard.ts` in `pwa-alumnos-padres`**

```typescript
// projects/pwa-alumnos-padres/src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from 'core-shared';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!auth.isAuthenticated() || !user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.rol)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
};
```

- [ ] **Step 2: Create `login-page.component.ts`, `alumno-dashboard.component.ts`, and `padre-dashboard.component.ts`**

```typescript
// projects/pwa-alumnos-padres/src/app/pages/login/login-page.component.ts
import { Component } from '@angular/core';
import { LoginComponent, SiblingPortalConfig, UserRole } from 'core-shared';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <lib-login
      appName="App Estudiantes y Familias"
      portalSubtitle="Ruta de aprendizaje adaptativa, mapa de desafíos y progreso"
      [allowedRoles]="allowedRoles"
      [siblingConfig]="siblingConfig"
    />
  `,
})
export class LoginPageComponent {
  readonly allowedRoles: UserRole[] = ['alumno', 'padre'];
  readonly siblingConfig: SiblingPortalConfig = {
    portalUrl: 'http://localhost:4200',
    portalName: 'Portal Docente y Administrativo',
    mismatchMessage: 'Hola, María. Esta aplicación está optimizada para alumnos y familias. Para gestionar tu aula, abre el Portal Docente y Administrativo.',
  };
}
```

```typescript
// projects/pwa-alumnos-padres/src/app/pages/alumno/alumno-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-alumno-dashboard',
  template: `
    <div class="pwa-layout">
      <header class="pwa-header">
        <div class="user-pill">
          <span class="avatar">🚀</span>
          <div>
            <div class="name">{{ auth.currentUser()?.nombre }}</div>
            <div class="tag">Estudiante</div>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Salir</button>
      </header>
      <main class="pwa-body">
        <div class="card">
          <h2>¡Hola de nuevo, {{ auth.currentUser()?.nombre }}! 🌟</h2>
          <p>Tu ruta adaptativa está lista. Completa tu siguiente reto para subir tu nivel de dominio.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .pwa-layout { min-height: 100vh; background: #020617; color: #fff; font-family: system-ui, sans-serif; padding: 1rem; }
    .pwa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .user-pill { display: flex; align-items: center; gap: 0.75rem; background: #1e293b; padding: 0.5rem 1rem; border-radius: 9999px; }
    .logout-btn { background: #334155; color: #f8fafc; border: none; padding: 0.5rem 1rem; border-radius: 9999px; cursor: pointer; }
    .card { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem; padding: 1.5rem; }
  `]
})
export class AlumnoDashboardComponent {
  readonly auth = inject(AuthService);
}
```

```typescript
// projects/pwa-alumnos-padres/src/app/pages/padre/padre-dashboard.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-padre-dashboard',
  template: `
    <div class="pwa-layout">
      <header class="pwa-header">
        <div class="user-pill">
          <span class="avatar">👨‍👩‍👧</span>
          <div>
            <div class="name">{{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}</div>
            <div class="tag">Familia / Tutor</div>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Salir</button>
      </header>
      <main class="pwa-body">
        <div class="card">
          <h2>Portal de Familia 📊</h2>
          <p>Seguimiento de avance, alertas tempranas y dominio de temas de tus hijos.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .pwa-layout { min-height: 100vh; background: #020617; color: #fff; font-family: system-ui, sans-serif; padding: 1rem; }
    .pwa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .user-pill { display: flex; align-items: center; gap: 0.75rem; background: #1e293b; padding: 0.5rem 1rem; border-radius: 9999px; }
    .logout-btn { background: #334155; color: #f8fafc; border: none; padding: 0.5rem 1rem; border-radius: 9999px; cursor: pointer; }
    .card { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem; padding: 1.5rem; }
  `]
})
export class PadreDashboardComponent {
  readonly auth = inject(AuthService);
}
```

- [ ] **Step 3: Update `app.routes.ts` in `pwa-alumnos-padres`**

```typescript
// projects/pwa-alumnos-padres/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'alumno',
    canActivate: [roleGuard(['alumno'])],
    loadComponent: () => import('./pages/alumno/alumno-dashboard.component').then((m) => m.AlumnoDashboardComponent),
  },
  {
    path: 'padre',
    canActivate: [roleGuard(['padre'])],
    loadComponent: () => import('./pages/padre/padre-dashboard.component').then((m) => m.PadreDashboardComponent),
  },
  { path: '**', redirectTo: 'login' },
];
```

- [ ] **Step 4: Update `app.ts` and `app.html` in `pwa-alumnos-padres`**

```typescript
// projects/pwa-alumnos-padres/src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `<router-outlet />`,
})
export class App {}
```

---

### Task 7: Full System Build & End-to-End Validation

**Files:**
- Test: `backend/tests/test_auth_endpoints.py`
- Build: `plataforma-adaptativa` build command

- [ ] **Step 1: Build Angular shared library & projects**
- Run build to ensure 0 compile/type errors:
  `cd plataforma-adaptativa && npx ng build core-shared && npx ng build panel-docente-admin && npx ng build pwa-alumnos-padres`

- [ ] **Step 2: Run all backend tests**
- Run: `pytest backend/tests/ -v`

- [ ] **Step 3: Verification of all 4 test accounts and role boundary rules**
- Admin (`admin@colegio.edu.gt` / `Admin123!`): Log in to port 4200 -> loads `/admin`. Try logging in to port 4201 -> displays role-mismatch modal.
- Profesor (`maria.lopez@colegio.edu.gt` / `Profe123!`): Log in to port 4200 -> loads `/profesor`. Try logging in to port 4201 -> displays role-mismatch modal.
- Alumno (`ana.perez` / `1234`): Log in to port 4201 -> loads `/alumno`. Try logging in to port 4200 -> displays role-mismatch modal.
- Padre (`carlos.solis@correo.com` / `Padre123!`): Log in to port 4201 -> loads `/padre`. Try logging in to port 4200 -> displays role-mismatch modal.
