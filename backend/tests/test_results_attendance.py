"""Backend tests for Results and Attendance features (iteration 3)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://azad-portal.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@azadschool.edu"
ADMIN_PASSWORD = "Admin@2026"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    assert r.cookies.get("access_token") or r.json().get("token")
    return s


@pytest.fixture(scope="module")
def anon_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Auth gate ----
class TestAuthGate:
    def test_results_admin_requires_auth(self, anon_session):
        r = anon_session.get(f"{API}/admin/results")
        assert r.status_code == 401

    def test_attendance_admin_requires_auth(self, anon_session):
        r = anon_session.get(f"{API}/admin/attendance")
        assert r.status_code == 401

    def test_results_post_requires_auth(self, anon_session):
        r = anon_session.post(f"{API}/admin/results", json={"student_name": "x", "roll_number": "1", "student_class": "X", "exam_name": "e", "subjects": [{"name": "M", "max_marks": 100, "marks_obtained": 90}]})
        assert r.status_code == 401


# ---- Grade boundary tests ----
GRADE_CASES = [
    # (max, obtained, expected_pct, expected_grade)
    (100, 95, 95.0, "A+"),
    (100, 90, 90.0, "A+"),
    (100, 85, 85.0, "A"),
    (100, 80, 80.0, "A"),
    (100, 75, 75.0, "B+"),
    (100, 70, 70.0, "B+"),
    (100, 65, 65.0, "B"),
    (100, 60, 60.0, "B"),
    (100, 55, 55.0, "C"),
    (100, 50, 50.0, "C"),
    (100, 40, 40.0, "D"),
    (100, 33, 33.0, "D"),
    (100, 30, 30.0, "F"),
    (100, 0, 0.0, "F"),
]


@pytest.mark.parametrize("mx,ob,pct,grade", GRADE_CASES)
def test_grade_boundaries(admin_session, mx, ob, pct, grade):
    payload = {
        "student_name": f"TEST_Grade_{grade}",
        "roll_number": f"TEST_G{grade}",
        "student_class": "X",
        "exam_name": "Grade Boundary Test",
        "subjects": [{"name": "Subject", "max_marks": mx, "marks_obtained": ob}],
        "remarks": "auto",
    }
    r = admin_session.post(f"{API}/admin/results", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["percentage"] == pct
    assert data["grade"] == grade
    assert data["total_obtained"] == ob
    assert data["total_max"] == mx
    # cleanup
    admin_session.delete(f"{API}/admin/results/{data['id']}")


# ---- E2E Result + Lookup ----
class TestResultsLookup:
    target_roll = "TEST_R777"
    target_class = "X"
    created_id = None

    def test_create_result(self, admin_session):
        payload = {
            "student_name": "TEST_Lookup_Student",
            "roll_number": self.target_roll,
            "student_class": self.target_class,
            "exam_name": "TEST_Half_Yearly",
            "subjects": [
                {"name": "Math", "max_marks": 100, "marks_obtained": 85},
                {"name": "Science", "max_marks": 100, "marks_obtained": 78},
                {"name": "English", "max_marks": 100, "marks_obtained": 92},
            ],
            "remarks": "Good progress",
        }
        r = admin_session.post(f"{API}/admin/results", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["total_obtained"] == 255
        assert data["total_max"] == 300
        assert data["percentage"] == 85.0
        assert data["grade"] == "A"
        assert "id" in data
        TestResultsLookup.created_id = data["id"]

    def test_list_includes_result(self, admin_session):
        r = admin_session.get(f"{API}/admin/results", timeout=30)
        assert r.status_code == 200
        items = r.json()
        ids = [x["id"] for x in items]
        assert TestResultsLookup.created_id in ids

    def test_lookup_case_insensitive(self, anon_session):
        # lower-case roll + lower-case class
        r = anon_session.post(f"{API}/results/lookup", json={
            "roll_number": "test_r777", "student_class": "x"
        }, timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert any(x["id"] == TestResultsLookup.created_id for x in items)
        # normalized fields should not be exposed
        for it in items:
            assert "roll_number_norm" not in it
            assert "student_class_norm" not in it

    def test_lookup_no_auth_needed(self, anon_session):
        r = anon_session.post(f"{API}/results/lookup", json={
            "roll_number": self.target_roll, "student_class": self.target_class
        }, timeout=30)
        assert r.status_code == 200

    def test_lookup_unknown_returns_empty(self, anon_session):
        r = anon_session.post(f"{API}/results/lookup", json={
            "roll_number": "TEST_NONEXISTENT_99999", "student_class": "X"
        }, timeout=30)
        assert r.status_code == 200
        assert r.json() == []

    def test_delete_result(self, admin_session):
        rid = TestResultsLookup.created_id
        r = admin_session.delete(f"{API}/admin/results/{rid}", timeout=30)
        assert r.status_code == 200

    def test_delete_verifies_removal(self, admin_session, anon_session):
        r = anon_session.post(f"{API}/results/lookup", json={
            "roll_number": self.target_roll, "student_class": self.target_class
        }, timeout=30)
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert TestResultsLookup.created_id not in ids


# ---- E2E Attendance + Lookup ----
class TestAttendanceLookup:
    target_roll = "TEST_A777"
    target_class = "X"
    created_id = None

    def test_create_attendance(self, admin_session):
        payload = {
            "student_name": "TEST_Att_Student",
            "roll_number": self.target_roll,
            "student_class": self.target_class,
            "month": "January 2026",
            "total_days": 22,
            "present_days": 20,
            "remarks": "ok",
        }
        r = admin_session.post(f"{API}/admin/attendance", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["absent_days"] == 2
        assert data["percentage"] == round((20/22)*100, 2)
        TestAttendanceLookup.created_id = data["id"]

    def test_reject_present_greater_than_total(self, admin_session):
        payload = {
            "student_name": "TEST_Att_Invalid",
            "roll_number": "TEST_A_INVALID",
            "student_class": "X",
            "month": "February 2026",
            "total_days": 10,
            "present_days": 15,  # invalid
        }
        r = admin_session.post(f"{API}/admin/attendance", json=payload, timeout=30)
        assert r.status_code == 400

    def test_reject_zero_total_days(self, admin_session):
        payload = {
            "student_name": "TEST_Att_Zero",
            "roll_number": "TEST_A_ZERO",
            "student_class": "X",
            "month": "March 2026",
            "total_days": 0,
            "present_days": 0,
        }
        r = admin_session.post(f"{API}/admin/attendance", json=payload, timeout=30)
        assert r.status_code == 400

    def test_lookup_case_insensitive(self, anon_session):
        r = anon_session.post(f"{API}/attendance/lookup", json={
            "roll_number": "test_a777", "student_class": "x"
        }, timeout=30)
        assert r.status_code == 200
        items = r.json()
        assert any(x["id"] == TestAttendanceLookup.created_id for x in items)
        for it in items:
            assert "roll_number_norm" not in it

    def test_admin_list_includes(self, admin_session):
        r = admin_session.get(f"{API}/admin/attendance", timeout=30)
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert TestAttendanceLookup.created_id in ids

    def test_delete_attendance(self, admin_session):
        rid = TestAttendanceLookup.created_id
        r = admin_session.delete(f"{API}/admin/attendance/{rid}", timeout=30)
        assert r.status_code == 200

    def test_delete_404(self, admin_session):
        r = admin_session.delete(f"{API}/admin/attendance/non-existent-id", timeout=30)
        assert r.status_code == 404


# ---- Stats includes new counts ----
def test_admin_stats_includes_new_keys(admin_session):
    r = admin_session.get(f"{API}/admin/stats", timeout=30)
    assert r.status_code == 200
    data = r.json()
    for key in ("admissions", "pending_admissions", "contacts", "gallery_images", "announcements", "results", "attendance"):
        assert key in data, f"Missing key: {key}"
        assert isinstance(data[key], int)
