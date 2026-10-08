import os
import sqlite3
import hashlib
import json
import time
from typing import Optional, Dict, Any

class SQLiteExplanationCache:
    """
    SQLite persistent cache for Tier 1 & Tier 2 AST LLM explanations.
    Keyed by sha256(file_content + model + prompt_version).
    """
    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            cache_dir = os.path.join(base_dir, "cache")
            os.makedirs(cache_dir, exist_ok=True)
            db_path = os.path.join(cache_dir, "explanation_cache.db")

        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS explanations (
                key TEXT PRIMARY KEY,
                file_path TEXT,
                json_data TEXT,
                created_at REAL
            )
        """)
        conn.commit()
        conn.close()

    @staticmethod
    def generate_cache_key(file_content: str, model: str = "qwen2.5-coder:7b", prompt_version: str = "v1.0") -> str:
        raw = f"{file_content}:{model}:{prompt_version}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT json_data FROM explanations WHERE key = ?", (key,))
            row = cursor.fetchone()
            conn.close()
            if row:
                return json.loads(row[0])
            return None
        except Exception as e:
            print(f"[SQLiteCache] Error retrieving key {key}: {e}")
            return None

    def set(self, key: str, file_path: str, data: Dict[str, Any]):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO explanations (key, file_path, json_data, created_at) VALUES (?, ?, ?, ?)",
                (key, file_path, json.dumps(data), time.time())
            )
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[SQLiteCache] Error saving key {key}: {e}")
