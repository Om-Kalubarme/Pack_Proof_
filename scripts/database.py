import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json

# Fetch Database URL from environment variables, fallback to local default
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/packproof")

def get_connection():
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

def init_db():
    """Create tables if they do not exist."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Cases Table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS inspection_cases (
                        case_id VARCHAR(50) PRIMARY KEY,
                        business_name VARCHAR(255),
                        address TEXT,
                        gps_location VARCHAR(100),
                        inspection_type VARCHAR(100),
                        assigned_inspector_id VARCHAR(50),
                        deadline_timestamp TIMESTAMP,
                        priority VARCHAR(50),
                        special_instructions TEXT,
                        status VARCHAR(50)
                    );
                """)
                # Reports Table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS inspection_reports (
                        report_id VARCHAR(50) PRIMARY KEY,
                        case_id VARCHAR(50) REFERENCES inspection_cases(case_id),
                        evaluation JSONB,
                        raw_data JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
            conn.commit()
            print("PostgreSQL tables initialized successfully.")
    except Exception as e:
        print(f"Database initialization error (Is PostgreSQL running?): {e}")

if __name__ == "__main__":
    init_db()
