from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import requests
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form, Query, Header
from fastapi.responses import Response as FastAPIResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- App ----------
app = FastAPI(title="Azad School API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Object Storage ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "azad-school")
storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Auth helpers ----------
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=False, samesite="lax", max_age=28800, path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdmissionCreate(BaseModel):
    student_name: str
    date_of_birth: str
    gender: str
    class_applying: str
    parent_name: str
    parent_phone: str
    parent_email: EmailStr
    address: str
    previous_school: Optional[str] = ""
    message: Optional[str] = ""


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    category: Optional[str] = "General"


# ---------- Public routes ----------
@api_router.get("/")
async def root():
    return {"message": "Azad Senior Secondary School API"}


@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    set_auth_cookie(response, token)
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin"), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current


@api_router.post("/admissions")
async def create_admission(payload: AdmissionCreate):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "pending"
    await db.admissions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.post("/contacts")
async def create_contact(payload: ContactCreate):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/gallery")
async def list_gallery(category: Optional[str] = None):
    q = {"is_deleted": False}
    if category and category != "all":
        q["category"] = category
    items = await db.gallery.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.get("/announcements")
async def list_announcements():
    items = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.gallery.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return FastAPIResponse(content=data, media_type=record.get("content_type", content_type))


# ---------- Admin routes ----------
@api_router.get("/admin/admissions")
async def admin_list_admissions(current=Depends(get_current_user)):
    items = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api_router.patch("/admin/admissions/{admission_id}")
async def admin_update_admission(admission_id: str, status: str = Form(...), current=Depends(get_current_user)):
    if status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.admissions.update_one({"id": admission_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api_router.get("/admin/contacts")
async def admin_list_contacts(current=Depends(get_current_user)):
    items = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api_router.post("/admin/gallery")
async def admin_upload_gallery(
    file: UploadFile = File(...),
    title: str = Form(""),
    category: str = Form("events"),
    current=Depends(get_current_user),
):
    ext = (file.filename or "img").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/gallery/{file_id}.{ext}"
    data = await file.read()
    content_type = file.content_type or f"image/{ext}"
    result = put_object(path, data, content_type)
    doc = {
        "id": file_id,
        "title": title or file.filename,
        "category": category,
        "storage_path": result["path"],
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/gallery/{image_id}")
async def admin_delete_gallery(image_id: str, current=Depends(get_current_user)):
    res = await db.gallery.update_one({"id": image_id}, {"$set": {"is_deleted": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api_router.post("/admin/announcements")
async def admin_create_announcement(payload: AnnouncementCreate, current=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.announcements.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/announcements/{ann_id}")
async def admin_delete_announcement(ann_id: str, current=Depends(get_current_user)):
    res = await db.announcements.delete_one({"id": ann_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(current=Depends(get_current_user)):
    return {
        "admissions": await db.admissions.count_documents({}),
        "pending_admissions": await db.admissions.count_documents({"status": "pending"}),
        "contacts": await db.contacts.count_documents({}),
        "gallery_images": await db.gallery.count_documents({"is_deleted": False}),
        "announcements": await db.announcements.count_documents({}),
    }


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.admissions.create_index("id", unique=True)
    await db.contacts.create_index("id", unique=True)
    await db.gallery.create_index("id", unique=True)
    await db.announcements.create_index("id", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@azadschool.edu").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "School Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Updated admin password: {admin_email}")

    # Seed demo announcements
    if await db.announcements.count_documents({}) == 0:
        demo = [
            {"id": str(uuid.uuid4()), "title": "Admissions Open for 2026-27", "body": "Applications are now open for classes Nursery to XII. Limited seats available.", "category": "Admission", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Annual Sports Day - March 15", "body": "Join us for our annual sports day featuring athletics, games and student performances.", "category": "Event", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Science Exhibition Winners", "body": "Congratulations to our students for winning the inter-school science exhibition.", "category": "Achievement", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.announcements.insert_many(demo)

    init_storage()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ---------- Mount ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
