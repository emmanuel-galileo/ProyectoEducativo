from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.cursos import router as cursos_router

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
app.include_router(cursos_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "plataforma-adaptativa-api"}
