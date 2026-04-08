from __future__ import annotations

import os
import uuid
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from ai_engine import generate_counselor_reply, simulate_future
from auth import create_access_token, get_current_user_id, hash_password, verify_password
from utils import load_json, save_json, utc_now_iso


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
USERS_FILE = os.path.join(STORAGE_DIR, "users.json")
CHECKINS_FILE = os.path.join(STORAGE_DIR, "checkins.json")
CHATS_FILE = os.path.join(STORAGE_DIR, "chats.json")


app = FastAPI(title="MIND-GUIDE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=60)
    age: int = Field(ge=10, le=120)
    intro: str = Field(min_length=1, max_length=240)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileResponse(BaseModel):
    email: EmailStr
    name: str
    age: int
    intro: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=60)
    age: Optional[int] = Field(default=None, ge=10, le=120)
    intro: Optional[str] = Field(default=None, min_length=1, max_length=240)


class CheckinRequest(BaseModel):
    stress: int = Field(ge=0, le=100)
    focus: int = Field(ge=0, le=100)
    happiness: int = Field(ge=0, le=100)
    energy: int = Field(ge=0, le=100)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    note: Optional[str] = Field(default=None, max_length=300)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class SimulateRequest(BaseModel):
    habits: List[str] = Field(default_factory=list)
    months: int = Field(default=6, ge=1, le=12)


def _load_users() -> List[Dict]:
    return load_json(USERS_FILE, [])


def _save_users(users: List[Dict]) -> None:
    save_json(USERS_FILE, users)


def _load_checkins() -> List[Dict]:
    return load_json(CHECKINS_FILE, [])


def _save_checkins(checkins: List[Dict]) -> None:
    save_json(CHECKINS_FILE, checkins)


def _load_chats() -> List[Dict]:
    return load_json(CHATS_FILE, [])


def _save_chats(chats: List[Dict]) -> None:
    save_json(CHATS_FILE, chats)


def _get_user_by_email(email: str) -> Optional[Dict]:
    users = _load_users()
    for u in users:
        if u.get("email", "").lower() == email.lower():
            return u
    return None


def _get_user_by_id(user_id: str) -> Optional[Dict]:
    users = _load_users()
    for u in users:
        if u.get("id") == user_id:
            return u
    return None


def _public_profile(user: Dict) -> Dict:
    return {
        "email": user.get("email"),
        "name": user.get("name"),
        "age": user.get("age"),
        "intro": user.get("intro"),
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/signup")
def signup(payload: SignupRequest) -> Dict:
    existing = _get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "age": payload.age,
        "intro": payload.intro,
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso(),
    }

    users = _load_users()
    users.append(user)
    _save_users(users)

    token = create_access_token({"sub": user["id"]})

    return {
        "token": token,
        "profile": _public_profile(user),
    }


@app.post("/login")
def login(payload: LoginRequest) -> Dict:
    user = _get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user["id"]})

    return {
        "token": token,
        "profile": _public_profile(user),
    }


@app.get("/profile", response_model=ProfileResponse)
def get_profile(user_id: str = Depends(get_current_user_id)) -> Dict:
    user = _get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return _public_profile(user)


@app.put("/profile", response_model=ProfileResponse)
@app.post("/profile", response_model=ProfileResponse)
def update_profile(payload: UpdateProfileRequest, user_id: str = Depends(get_current_user_id)) -> Dict:
    users = _load_users()
    updated = None

    for u in users:
        if u.get("id") == user_id:
            if payload.name is not None:
                u["name"] = payload.name
            if payload.age is not None:
                u["age"] = payload.age
            if payload.intro is not None:
                u["intro"] = payload.intro

            u["updated_at"] = utc_now_iso()
            updated = u
            break

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _save_users(users)
    return _public_profile(updated)


@app.post("/checkin")
def checkin(payload: CheckinRequest, user_id: str = Depends(get_current_user_id)) -> Dict:
    checkins = _load_checkins()

    entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "timestamp": utc_now_iso(),
        "stress": payload.stress,
        "focus": payload.focus,
        "happiness": payload.happiness,
        "energy": payload.energy,
        "sleep_hours": payload.sleep_hours,
        "note": payload.note,
    }

    checkins.append(entry)
    _save_checkins(checkins)

    return {"ok": True, "checkin": entry}


@app.post("/chat")
async def chat(payload: ChatRequest, user_id: str = Depends(get_current_user_id)) -> Dict:
    user = _get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    chats = _load_chats()

    user_msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "timestamp": utc_now_iso(),
        "role": "user",
        "message": payload.message,
    }
    chats.append(user_msg)

    ai = await generate_counselor_reply(payload.message, _public_profile(user))

    assistant_msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "timestamp": utc_now_iso(),
        "role": "assistant",
        "message": ai["reply"],
        "mood": ai.get("mood"),
        "is_crisis": ai.get("is_crisis", False),
        "helplines": ai.get("helplines", {}),
        "advice": ai.get("advice", []),
        "quote": ai.get("quote"),
    }
    chats.append(assistant_msg)

    _save_chats(chats)

    history = [c for c in chats if c.get("user_id") == user_id][-40:]

    return {
        "ok": True,
        "mood": ai.get("mood"),
        "is_crisis": ai.get("is_crisis", False),
        "helplines": ai.get("helplines", {}),
        "assistant": {
            "message": assistant_msg["message"],
            "advice": assistant_msg.get("advice", []),
            "quote": assistant_msg.get("quote"),
        },
        "history": history,
    }


@app.get("/chat")
def chat_history(user_id: str = Depends(get_current_user_id)) -> Dict:
    chats = _load_chats()
    history = [c for c in chats if c.get("user_id") == user_id][-60:]
    last_assistant = None
    for c in reversed(history):
        if c.get("role") == "assistant":
            last_assistant = c
            break

    return {
        "ok": True,
        "mood": last_assistant.get("mood") if last_assistant else None,
        "is_crisis": last_assistant.get("is_crisis") if last_assistant else False,
        "helplines": last_assistant.get("helplines") if last_assistant else {},
        "history": history,
    }


def _baseline_from_recent_checkins(user_id: str) -> Dict[str, float]:
    checkins = [c for c in _load_checkins() if c.get("user_id") == user_id]
    recent = checkins[-14:]

    if not recent:
        return {
            "stress": 55,
            "focus": 50,
            "happiness": 50,
            "energy": 50,
            "health_risk": 55,
        }

    def avg(key: str) -> float:
        vals = [float(x.get(key, 0)) for x in recent]
        return sum(vals) / max(1, len(vals))

    stress = avg("stress")
    focus = avg("focus")
    happiness = avg("happiness")
    energy = avg("energy")

    health_risk = max(0.0, min(100.0, (stress * 0.5) + ((100 - energy) * 0.3) + ((100 - happiness) * 0.2)))

    return {
        "stress": stress,
        "focus": focus,
        "happiness": happiness,
        "energy": energy,
        "health_risk": health_risk,
    }


@app.post("/simulate")
def simulate(payload: SimulateRequest, user_id: str = Depends(get_current_user_id)) -> Dict:
    baseline = _baseline_from_recent_checkins(user_id)
    result = simulate_future(payload.habits, payload.months, baseline)
    return {"ok": True, "simulation": result}


@app.get("/insights")
def insights(user_id: str = Depends(get_current_user_id)) -> Dict:
    checkins = [c for c in _load_checkins() if c.get("user_id") == user_id]
    chats = [c for c in _load_chats() if c.get("user_id") == user_id and c.get("role") == "assistant"]

    if not checkins:
        return {
            "ok": True,
            "summary": {
                "avg_stress": None,
                "best_mood": None,
                "sleep_trend": [],
                "last_counseling_mood": chats[-1].get("mood") if chats else None,
            },
            "recent_checkins": [],
        }

    def avg(key: str) -> float:
        vals = [float(x.get(key, 0)) for x in checkins]
        return round(sum(vals) / max(1, len(vals)), 1)

    avg_stress = avg("stress")

    best = max(checkins, key=lambda x: int(x.get("happiness", 0)))
    best_mood = {
        "timestamp": best.get("timestamp"),
        "happiness": best.get("happiness"),
        "note": best.get("note"),
    }

    sleep_points = []
    for c in checkins[-14:]:
        if c.get("sleep_hours") is not None:
            sleep_points.append({"timestamp": c.get("timestamp"), "sleep_hours": c.get("sleep_hours")})

    last_mood = chats[-1].get("mood") if chats else None

    recent_checkins = checkins[-30:]

    return {
        "ok": True,
        "summary": {
            "avg_stress": avg_stress,
            "best_mood": best_mood,
            "sleep_trend": sleep_points,
            "last_counseling_mood": last_mood,
        },
        "recent_checkins": recent_checkins,
    }
