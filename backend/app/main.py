from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash
from app.routers import auth, inspections, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_user = User()
            admin_user.username = "admin"
            admin_user.hashed_password = get_password_hash("admin123")
            admin_user.role = "admin"
            db.add(admin_user)
            db.commit()
            print("Default admin user created")
    finally:
        db.close()
    
    yield
    
    print("Shutting down...")

app = FastAPI(title="HackSav Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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