import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash
from app.routers import auth, inspections, reports

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    # Optionally bootstrap an admin account from the environment. We never ship
    # a hardcoded default password — the operator must supply ADMIN_PASSWORD.
    from app.config import settings as _s
    admin_password = _s.ADMIN_PASSWORD
    if admin_password:
        admin_username = _s.ADMIN_USERNAME
        db = SessionLocal()
        try:
            admin = db.query(User).filter(User.username == admin_username).first()
            if not admin:
                admin_user = User()
                admin_user.username = admin_username
                admin_user.hashed_password = get_password_hash(admin_password)
                admin_user.role = "admin"
                db.add(admin_user)
                db.commit()
                print(f"Admin user '{admin_username}' created from environment")
        finally:
            db.close()

    yield

    print("Shutting down...")

app = FastAPI(title="ARIADOS Backend", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from app.config import settings as _cfg
allowed_origins = [o.strip() for o in _cfg.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(inspections.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy"}