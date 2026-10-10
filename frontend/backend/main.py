
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "vydrax.db"

SECRET_KEY = os.getenv("VYDRAX_SECRET_KEY")
if not SECRET_KEY:
    # Local development only. Set VYDRAX_SECRET_KEY in production.
    SECRET_KEY = "dev-only-change-this-vydrax-secret-before-deployment"

ALGORITHM = "HS256"
TOKEN_MINUTES = 30

password_hash = PasswordHash.recommended()
bearer = HTTPBearer()
app = FastAPI(title="VYDRAX API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def connect_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_db():
    with connect_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        """)


initialize_db()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ScanRequest(BaseModel):
    target: str = Field(min_length=1, max_length=2048)
    asset_type: str = Field(min_length=1, max_length=50)


def create_token(user_id: int):
    expires = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expires},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session. Please log in again.",
        )

    with connect_db() as db:
        user = db.execute(
            "SELECT id, name, email FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User account not found.")

    return dict(user)


@app.get("/")
def root():
    return {"message": "VYDRAX API is running!"}


@app.post("/auth/register", status_code=201)
def register(body: RegisterRequest):
    name = body.name.strip()
    email = str(body.email).strip().lower()

    if not name:
        raise HTTPException(status_code=422, detail="Name is required.")

    hashed = password_hash.hash(body.password)

    try:
        with connect_db() as db:
            cursor = db.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, hashed),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    return {
        "message": "Account created successfully.",
        "user": {"id": user_id, "name": name, "email": email},
    }


@app.post("/auth/login")
def login(body: LoginRequest):
    email = str(body.email).strip().lower()

    with connect_db() as db:
        user = db.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not user or not password_hash.verify(
        body.password, user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    return {
        "access_token": create_token(user["id"]),
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


@app.get("/auth/me")
def get_me(user=Depends(current_user)):
    return {"user": user}


@app.post("/scan")
def scan_asset(body: ScanRequest, user=Depends(current_user)):
    target = body.target.strip()
    asset_type = body.asset_type.strip()

    if not target:
        raise HTTPException(status_code=422, detail="Target is required.")

    lower_target = target.lower()
    score = 0
    evidence = []

    keywords = ("verify-account", "free-gift", "claim-prize")
    matched = [word for word in keywords if word in lower_target]

    if matched:
        score += 50
        evidence.append(
            "Demo indicator keyword found: " + ", ".join(matched)
        )

    if (
        asset_type.lower() == "social profile"
        and any(word in lower_target for word in ("support", "official", "helpdesk"))
    ):
        score += 20
        evidence.append(
            "Profile name contains a support/official-style keyword."
        )

    if not evidence:
        evidence.append(
            "No configured demo indicators matched. This does not prove the asset is safe."
        )

    score = min(score, 100)
    level = "High" if score >= 50 else "Medium" if score >= 20 else "Low"

    return {
        "target": target,
        "asset_type": asset_type,
        "risk_score": score,
        "risk_level": level,
        "evidence": evidence,
        "note": (
            "Demo heuristic only. Not a verified security assessment "
            "or live threat-intelligence scan."
        ),
    }