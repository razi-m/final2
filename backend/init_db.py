from app.database import engine, Base
from app.models import User, Inspection, Defect, Report

print("Creating database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

# Seed admin user from the environment (no hardcoded default password).
import os
from app.database import SessionLocal
from app.auth import get_password_hash

admin_username = os.getenv("ADMIN_USERNAME", "admin")
admin_password = os.getenv("ADMIN_PASSWORD")

db = SessionLocal()
try:
    if not admin_password:
        print("ADMIN_PASSWORD not set; skipping admin seed. "
              "Set ADMIN_USERNAME/ADMIN_PASSWORD to create an admin.")
    else:
        admin = db.query(User).filter(User.username == admin_username).first()
        if not admin:
            admin_user = User(
                username=admin_username,
                hashed_password=get_password_hash(admin_password),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {admin_username}")
        else:
            print("Admin user already exists")
finally:
    db.close()