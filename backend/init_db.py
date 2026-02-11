from app.database import engine, Base
from app.models import User, Inspection, Defect, Report

print("Creating database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

# Seed admin user
from app.database import SessionLocal
from app.auth import get_password_hash

db = SessionLocal()
try:
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("Default admin user created: admin/admin123")
    else:
        print("Admin user already exists")
finally:
    db.close()