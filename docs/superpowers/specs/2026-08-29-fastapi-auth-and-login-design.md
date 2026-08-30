# FastAPI Supabase Authentication & Multi-App Role Routing Design Spec

**Date**: 2026-08-29  
**Status**: Approved  
**Author**: Antigravity  

---

## 1. Overview & Objective

The objective is to implement a centralized authentication and role-based access management system for the educational platform consisting of:
1. A **FastAPI backend** located in `/backend` that authenticates users against a Supabase PostgreSQL database (`sp2-plataforma`), manages sessions in `public.sesiones`, and issues JWT access tokens.
2. A database **seeding script** that configures known credentials for test users across all four primary roles (`admin`, `profesor`, `alumno`, `padre`).
3. A **shared Angular library** (`projects/core-shared`) housing the reactive Signal-based `AuthService` and a modern `LoginComponent` with single smart input identifier recognition.
4. Seamless **role-boundary handling** between the two Angular frontends:
   - `panel-docente-admin` (allowed roles: `admin`, `profesor`)
   - `pwa-alumnos-padres` (allowed roles: `alumno`, `padre`)
   - When a user logs in from the wrong portal, a friendly role-mismatch modal displays without persisting the token, pointing the user directly to their respective application.

---

## 2. Architecture & Components

```mermaid
graph TD
    subgraph Frontend Applications
        PDA[panel-docente-admin :4200]
        PWA[pwa-alumnos-padres :4201]
    end

    subgraph Core Shared Library
        CS_AuthService[AuthService (Signals)]
        CS_Login[LoginComponent]
        CS_Guard[RoleGuard / AuthGuard]
    end

    subgraph FastAPI Backend :8000
        API_Auth[POST /api/v1/auth/login]
        API_Me[GET /api/v1/auth/me]
        API_Logout[POST /api/v1/auth/logout]
        Core_Sec[JWT + Passlib Bcrypt]
    end

    subgraph Supabase Database
        DB_Users[(public.usuarios)]
        DB_Sessions[(public.sesiones)]
        DB_Schools[(public.colegios)]
    end

    PDA --> CS_Login
    PWA --> CS_Login
    CS_Login --> CS_AuthService
    CS_AuthService --> API_Auth
    API_Auth --> Core_Sec
    API_Auth --> DB_Users
    API_Auth --> DB_Sessions
```

---

## 3. Detailed Specifications

### 3.1 Backend Service (`/backend`)

#### Directory Layout
```
ProyectoEducativo/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── auth.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── supabase.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── auth.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── scripts/
│   │   └── seed_users.py
│   ├── .env
│   ├── .gitignore
│   └── requirements.txt
```

#### API Endpoints
1. **`POST /api/v1/auth/login`**:
   - Request Body:
     ```json
     {
       "identifier": "admin@colegio.edu.gt",
       "secret": "Admin123!"
     }
     ```
   - Logic:
     - Normalizes `identifier` (lowercase, trim).
     - Queries `public.usuarios` matching `correo = identifier` OR `usuario = identifier`.
     - Checks user `activo == true`.
     - Validates `secret` against `password_hash` (for admin/profesor/padre) or `pin_hash` (for alumno) using bcrypt.
     - Generates JWT Access Token with claims: `sub`, `user_id`, `rol`, `colegio_id`, `nombre`, `apellido`, `avatar`.
     - Inserts record into `public.sesiones` with token hash, expiration time, and `revocada = false`.
     - Updates `ultimo_acceso = now()` in `public.usuarios`.
   - Response Body (200 OK):
     ```json
     {
       "access_token": "<jwt_string>",
       "token_type": "bearer",
       "user": {
         "id": "admin-001",
         "colegio_id": "col-001",
         "rol": "admin",
         "nombre": "Carmen",
         "apellido": "Girón",
         "correo": "admin@colegio.edu.gt",
         "usuario": null,
         "avatar": "avatar-01"
       }
     }
     ```

2. **`GET /api/v1/auth/me`**:
   - Headers: `Authorization: Bearer <jwt>`
   - Validates active token against `public.sesiones` and returns user profile.

3. **`POST /api/v1/auth/logout`**:
   - Marks current session as `revocada = true` in `public.sesiones`.

#### Test User Seed Script (`scripts/seed_users.py`)
Configures hashes in Supabase with standard test credentials:
- **Admin**: `admin@colegio.edu.gt` / `Admin123!`
- **Profesor**: `maria.lopez@colegio.edu.gt` / `Profe123!`
- **Padre**: `carlos.solis@correo.com` / `Padre123!`
- **Alumno**: `ana.perez` / `1234` (4-digit PIN)

---

### 3.2 Frontend Core Library (`projects/core-shared`)

#### Auth Models (`src/lib/models/auth.models.ts`)
- `UserRole`: `'admin' | 'profesor' | 'alumno' | 'padre'`
- `UserProfile`: User information container.
- `AuthResponse`: API response schema.
- `RoleMismatchNotice`: State structure for wrong portal notices.

#### AuthService (`src/lib/services/auth.service.ts`)
- Utilizes Angular Signals for reactive state:
  - `currentUser = signal<UserProfile | null>(initialUser)`
  - `token = signal<string | null>(initialToken)`
  - `isLoading = signal<boolean>(false)`
  - `errorMessage = signal<string | null>(null)`
  - `mismatchNotice = signal<RoleMismatchNotice | null>(null)`
  - `isAuthenticated = computed(() => !!this.currentUser())`
  - `userRole = computed(() => this.currentUser()?.rol ?? null)`
- Core method `login(identifier, secret, allowedRoles, siblingPortalConfig)`:
  - Executes login API call.
  - If returned `rol` is not permitted in `allowedRoles`:
    - Discards token (no persistence).
    - Sets `mismatchNotice` signal.
  - If returned `rol` is permitted:
    - Persists token and profile to `localStorage`.
    - Navigates to corresponding role route.

#### LoginComponent (`src/lib/components/login/login.component.ts`)
- Premium educational UI with glassmorphic cards, responsive container, and accessibility compliance (WCAG AA).
- **Single Smart Input**: Accepts either Email or Username.
- **Secret Input**: Accepts password or 4-digit PIN with reveal toggle.
- **Quick Demo Credentials Toolbar**: Clickable chips for instant credential testing.
- **Role Mismatch Modal**: Displays customized warning with clean link button to sibling portal.

---

### 3.3 Application Portals & Routing

#### `panel-docente-admin` (Port 4200)
- **Allowed Roles**: `['admin', 'profesor']`
- **Sibling Portal**: `http://localhost:4201`
- **Mismatched Message**: *"Tu cuenta corresponde a un perfil de estudiante o padre de familia. Por favor accede desde la Aplicación Móvil / Tablet."*
- **Role Dashboards**:
  - `/admin`: Administration panel (user stats, school overview, system controls).
  - `/profesor`: Teacher workspace (course list, adaptive graph management, student alerts).

#### `pwa-alumnos-padres` (Port 4201)
- **Allowed Roles**: `['alumno', 'padre']`
- **Sibling Portal**: `http://localhost:4200`
- **Mismatched Message**: *"Hola, {nombre}. Esta aplicación está optimizada para alumnos y familias. Para gestionar tu aula, abre el Portal Docente y Administrativo."*
- **Role Dashboards**:
  - `/alumno`: Student learning path, exercise map, current topic mastery.
  - `/padre`: Family overview, child progress report, alerts.

---

## 4. Verification Plan

1. **Backend Verification**:
   - Run `seed_users.py` and verify database updates.
   - Start FastAPI (`uvicorn app.main:app --port 8000`).
   - Test login with curl / test script for all 4 test accounts.
2. **Frontend Verification**:
   - Build `core-shared` library.
   - Start `panel-docente-admin` on port 4200 and `pwa-alumnos-padres` on port 4201.
   - Test successful logins:
     - Admin login on 4200 -> routes to `/admin`.
     - Profesor login on 4200 -> routes to `/profesor`.
     - Alumno login on 4201 -> routes to `/alumno`.
     - Padre login on 4201 -> routes to `/padre`.
   - Test mismatched logins:
     - Alumno login on 4200 -> displays mismatched modal pointing to 4201 without storing token.
     - Profesor login on 4201 -> displays mismatched modal pointing to 4200 without storing token.
