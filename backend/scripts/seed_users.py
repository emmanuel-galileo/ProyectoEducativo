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
    {"id": "prof-002", "type": "password", "value": "Profe123!"},
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
        
        supabase.table("usuarios").update(update_data).eq("id", user_def["id"]).execute()
        print(f"  ✓ User '{user_def['id']}' ({user_def['type']}) updated.")
    print("🎉 All sample users seeded successfully.")

if __name__ == "__main__":
    seed_sample_users()
