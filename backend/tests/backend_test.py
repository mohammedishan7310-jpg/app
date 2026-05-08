"""Azad School backend API tests."""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://azad-portal.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@azadschool.edu"
ADMIN_PASSWORD = "Admin@2026"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def auth_session(api_client):
    r = api_client.post(f"{BASE_URL}/api/auth/login",
                        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["email"] == ADMIN_EMAIL
    return api_client, data["token"]


# ---------- Public ----------
class TestPublic:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "Azad" in r.json().get("message", "")

    def test_announcements_seeded(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/announcements")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 3
        assert all("_id" not in it for it in items)

    def test_gallery_list(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Auth ----------
class TestAuth:
    def test_login_invalid(self, api_client):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_and_cookie(self, auth_session):
        client, token = auth_session
        assert "access_token" in client.cookies.get_dict()
        assert isinstance(token, str) and len(token) > 0

    def test_me_authenticated(self, auth_session):
        client, _ = auth_session
        r = client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL
        assert "_id" not in r.json()
        assert "password_hash" not in r.json()

    def test_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_admin_routes_require_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/admissions")
        assert r.status_code == 401
        r = requests.get(f"{BASE_URL}/api/admin/contacts")
        assert r.status_code == 401
        r = requests.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401


# ---------- Admissions ----------
class TestAdmissions:
    def test_create_and_list(self, auth_session):
        client, _ = auth_session
        payload = {
            "student_name": "TEST_Student",
            "date_of_birth": "2015-01-01",
            "gender": "male",
            "class_applying": "V",
            "parent_name": "TEST_Parent",
            "parent_phone": "9999999999",
            "parent_email": "test_parent@example.com",
            "address": "TEST address",
            "previous_school": "Prev",
            "message": "hi",
        }
        r = requests.post(f"{BASE_URL}/api/admissions", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "pending" and "id" in body and "_id" not in body
        admission_id = body["id"]

        r2 = client.get(f"{BASE_URL}/api/admin/admissions")
        assert r2.status_code == 200
        ids = [a["id"] for a in r2.json()]
        assert admission_id in ids

        # PATCH status
        r3 = client.patch(f"{BASE_URL}/api/admin/admissions/{admission_id}",
                          data={"status": "approved"})
        assert r3.status_code == 200

        r4 = client.get(f"{BASE_URL}/api/admin/admissions")
        match = next(a for a in r4.json() if a["id"] == admission_id)
        assert match["status"] == "approved"


# ---------- Contacts ----------
class TestContacts:
    def test_create_and_list(self, auth_session):
        client, _ = auth_session
        payload = {"name": "TEST_user", "email": "t@e.com", "phone": "1",
                   "subject": "TEST_subj", "message": "hello"}
        r = requests.post(f"{BASE_URL}/api/contacts", json=payload)
        assert r.status_code == 200
        cid = r.json()["id"]
        r2 = client.get(f"{BASE_URL}/api/admin/contacts")
        assert r2.status_code == 200
        assert any(c["id"] == cid for c in r2.json())


# ---------- Announcements ----------
class TestAnnouncements:
    def test_create_and_delete(self, auth_session):
        client, _ = auth_session
        r = client.post(f"{BASE_URL}/api/admin/announcements",
                        json={"title": "TEST_T", "body": "TEST_B", "category": "General"})
        assert r.status_code == 200
        ann_id = r.json()["id"]
        r2 = requests.get(f"{BASE_URL}/api/announcements")
        assert any(a["id"] == ann_id for a in r2.json())
        r3 = client.delete(f"{BASE_URL}/api/admin/announcements/{ann_id}")
        assert r3.status_code == 200


# ---------- Gallery ----------
class TestGallery:
    def test_upload_get_delete(self, auth_session):
        client, _ = auth_session
        # 1x1 PNG
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
            "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        data = {"title": "TEST_img", "category": "events"}
        r = client.post(f"{BASE_URL}/api/admin/gallery", files=files, data=data)
        assert r.status_code == 200, r.text
        body = r.json()
        gid = body["id"]
        path = body["storage_path"]
        assert "_id" not in body

        # served via /api/files/{path}
        r2 = client.get(f"{BASE_URL}/api/files/{path}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")

        r3 = client.get(f"{BASE_URL}/api/gallery")
        assert any(it["id"] == gid for it in r3.json())

        # soft-delete
        r4 = client.delete(f"{BASE_URL}/api/admin/gallery/{gid}")
        assert r4.status_code == 200
        r5 = client.get(f"{BASE_URL}/api/gallery")
        assert not any(it["id"] == gid for it in r5.json())


# ---------- Stats ----------
class TestStats:
    def test_admin_stats(self, auth_session):
        client, _ = auth_session
        r = client.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 200
        body = r.json()
        for k in ("admissions", "pending_admissions", "contacts", "gallery_images", "announcements"):
            assert k in body and isinstance(body[k], int)


# ---------- Logout ----------
class TestLogout:
    def test_logout_clears_cookie(self):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert "access_token" in s.cookies.get_dict()
        r2 = s.post(f"{BASE_URL}/api/auth/logout")
        assert r2.status_code == 200
        # Cookie should be deleted/expired
        assert "access_token" not in s.cookies.get_dict() or s.cookies.get("access_token") in (None, "")
