from contextlib import contextmanager

import bcrypt
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

backend_data = FastAPI()

backend_data.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="ecommerce_db",
    )


@contextmanager
def db_cursor(dictionary=True, commit=False):
    """Opens a connection + cursor and always closes both, even on errors."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=dictionary)
    try:
        yield cursor
        if commit:
            conn.commit()
    finally:
        cursor.close()
        conn.close()


def hash_password(password: str) -> str:
    # bcrypt only uses the first 72 bytes
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], stored_hash.encode("utf-8"))
    except ValueError:
        # stored value isn't a valid bcrypt hash (e.g. an old plaintext password)
        return False


# ---------- Items ----------
@backend_data.get("/items")
def get_items():
    with db_cursor() as cursor:
        cursor.execute("SELECT * FROM items WHERE ITEM_STATUS = 'Approved'")
        results = cursor.fetchall()
    return {"items": results}


# ---------- Accounts ----------
class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str


@backend_data.get("/accounts/{user_id}")
def get_user_profile(user_id: int):
    with db_cursor() as cursor:
        cursor.execute(
            """SELECT USER_ID, USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL
               FROM accounts WHERE USER_ID = %s""",
            (user_id,),
        )
        user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "USER_ID": user["USER_ID"],
        "NAME": f"{user['USER_FIRST_NAME']} {user['USER_LAST_NAME']}",
        "FIRST_NAME": user["USER_FIRST_NAME"],
        "LAST_NAME": user["USER_LAST_NAME"],
        "EMAIL": user["USER_EMAIL"],
    }


@backend_data.put("/accounts/{user_id}")
def update_user_profile(user_id: int, profile: UserProfileUpdate):
    with db_cursor(commit=True) as cursor:
        cursor.execute(
            """UPDATE accounts
               SET USER_FIRST_NAME = %s, USER_LAST_NAME = %s, USER_EMAIL = %s
               WHERE USER_ID = %s""",
            (profile.first_name, profile.last_name, profile.email, user_id),
        )
    return {"message": "Profile updated successfully"}


# ---------- Signup ----------
class SignUpRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


@backend_data.post("/signup")
def signup_user(data: SignUpRequest):
    with db_cursor(commit=True) as cursor:
        cursor.execute("SELECT USER_ID FROM accounts WHERE USER_EMAIL = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")

        cursor.execute(
            """INSERT INTO accounts
               (USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL, USER_PASSWORD, USER_ROLE, USER_STATUS)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (data.first_name, data.last_name, data.email, hash_password(data.password), "Regular", "Active"),
        )
        new_user_id = cursor.lastrowid

    return {
        "message": "Account created successfully",
        "user_id": new_user_id,
        "name": f"{data.first_name} {data.last_name}",
        "email": data.email,
        "role": "Regular",
        "status": "Active",
    }


# ---------- Login ----------
class LoginRequest(BaseModel):
    email: str
    password: str


@backend_data.post("/login")
def login_user(credentials: LoginRequest):
    with db_cursor() as cursor:
        # Look up by email only; the password is checked against the hash below
        cursor.execute(
            """SELECT USER_ID, USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL,
                      USER_PASSWORD, USER_ROLE, USER_STATUS
               FROM accounts WHERE USER_EMAIL = %s""",
            (credentials.email,),
        )
        user = cursor.fetchone()

    if not user or not verify_password(credentials.password, user["USER_PASSWORD"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user["USER_STATUS"] != "Active":
        raise HTTPException(status_code=403, detail="Account is not active")

    return {
        "message": "Login successful",
        "user_id": user["USER_ID"],
        "role": user["USER_ROLE"],
        "name": f"{user['USER_FIRST_NAME']} {user['USER_LAST_NAME']}",
        "email": user["USER_EMAIL"],
    }