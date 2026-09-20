import sys
import os
from sqlalchemy import create_engine, inspect

# Add backend directory to path
backend_dir = r"C:\Users\dhira\Downloads\legalsathiai\backend"
sys.path.insert(0, backend_dir)

# Import Base and engine
from database.models import Base
from database.session import engine

# Create tables
Base.metadata.create_all(bind=engine)

# Verify table creation
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables found: {tables}")

if "legal_cases" in tables:
    columns = [col['name'] for col in inspector.get_columns("legal_cases")]
    print(f"Columns in legal_cases: {columns}")
    if "user_id" in columns:
        print("SUCCESS: legal_cases table has user_id column.")
    else:
        print("FAILURE: legal_cases table missing user_id column.")
else:
    print("FAILURE: legal_cases table not found.")
