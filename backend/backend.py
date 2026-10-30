from contextlib import contextmanager

import bcrypt
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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


# ---------- Cart ----------
class CartAddRequest(BaseModel):
    user_id: int
    item_id: int
    quantity: int = Field(1, ge=1, le=99)


class CartQuantityUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=99)


@backend_data.get("/cart/{user_id}")
def get_cart(user_id: int):
    with db_cursor() as cursor:
        cursor.execute(
            """SELECT c.CART_ITEM_ID, c.ITEM_ID, c.QUANTITY,
                      i.ITEM_NAME, i.ITEM_DESCRIPTION, i.ITEM_PRICE, i.ITEM_CATEGORY
               FROM cart_items c
               JOIN items i ON i.ITEM_ID = c.ITEM_ID
               WHERE c.USER_ID = %s
               ORDER BY c.CART_ITEM_ID DESC""",
            (user_id,),
        )
        rows = cursor.fetchall()
    return {"cart": rows}


@backend_data.post("/cart")
def add_to_cart(data: CartAddRequest):
    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "SELECT ITEM_ID FROM items WHERE ITEM_ID = %s AND ITEM_STATUS = 'Approved'",
            (data.item_id,),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Item not found")

        # One row per user+item: adding it again increases the quantity
        cursor.execute(
            """INSERT INTO cart_items (USER_ID, ITEM_ID, QUANTITY)
               VALUES (%s, %s, %s)
               ON DUPLICATE KEY UPDATE QUANTITY = LEAST(QUANTITY + VALUES(QUANTITY), 99)""",
            (data.user_id, data.item_id, data.quantity),
        )
    return {"message": "Added to cart"}


@backend_data.put("/cart/{cart_item_id}")
def update_cart_quantity(cart_item_id: int, data: CartQuantityUpdate):
    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE cart_items SET QUANTITY = %s WHERE CART_ITEM_ID = %s",
            (data.quantity, cart_item_id),
        )
    return {"message": "Quantity updated"}


@backend_data.delete("/cart/{cart_item_id}")
def remove_cart_item(cart_item_id: int):
    with db_cursor(commit=True) as cursor:
        cursor.execute("DELETE FROM cart_items WHERE CART_ITEM_ID = %s", (cart_item_id,))
    return {"message": "Item removed"}


# ---------- Cart ----------
class CartAddRequest(BaseModel):
    user_id: int
    item_id: int
    quantity: int = 1


class CartUpdateRequest(BaseModel):
    quantity: int


@backend_data.get("/cart/{user_id}")
def get_cart_items(user_id: int):
    with db_cursor() as cursor:
        cursor.execute(
            """SELECT c.CART_ITEM_ID, c.QUANTITY,
                      i.ITEM_ID, i.ITEM_NAME, i.ITEM_PRICE, i.ITEM_CATEGORY
               FROM cart_items c
               JOIN items i ON c.ITEM_ID = i.ITEM_ID
               WHERE c.USER_ID = %s
               ORDER BY c.CART_ITEM_ID DESC""",
            (user_id,),  # the trailing comma makes this a tuple
        )
        items = cursor.fetchall()
    return {"cart": items}


@backend_data.post("/cart")
def add_to_cart(data: CartAddRequest):
    if data.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "SELECT ITEM_ID FROM items WHERE ITEM_ID = %s AND ITEM_STATUS = 'Approved'",
            (data.item_id,),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Item not found")

        cursor.execute(
            "SELECT CART_ITEM_ID, QUANTITY FROM cart_items WHERE USER_ID = %s AND ITEM_ID = %s",
            (data.user_id, data.item_id),
        )
        existing = cursor.fetchone()

        if existing:
            # Already in the cart: keep the current quantity instead of doubling it.
            # (Quantity is changed with the +/- stepper in the cart.)
            return {"message": "Item is already in your cart", "already_in_cart": True}

        # The UNIQUE (USER_ID, ITEM_ID) key makes this safe even if two requests
        # arrive at the same moment: the second one becomes a harmless no-op.
        cursor.execute(
            """INSERT INTO cart_items (USER_ID, ITEM_ID, QUANTITY) VALUES (%s, %s, %s)
               ON DUPLICATE KEY UPDATE CART_ITEM_ID = CART_ITEM_ID""",
            (data.user_id, data.item_id, data.quantity),
        )
    return {"message": "Item added to cart successfully", "already_in_cart": False}


@backend_data.put("/cart/{cart_item_id}")
def update_cart_quantity(cart_item_id: int, data: CartUpdateRequest):
    with db_cursor(commit=True) as cursor:
        if data.quantity <= 0:
            cursor.execute("DELETE FROM cart_items WHERE CART_ITEM_ID = %s", (cart_item_id,))
        else:
            cursor.execute(
                "UPDATE cart_items SET QUANTITY = %s WHERE CART_ITEM_ID = %s",
                (data.quantity, cart_item_id),
            )
    return {"message": "Cart updated successfully"}


@backend_data.delete("/cart/{cart_item_id}")
def remove_cart_item(cart_item_id: int):
    with db_cursor(commit=True) as cursor:
        cursor.execute("DELETE FROM cart_items WHERE CART_ITEM_ID = %s", (cart_item_id,))
    return {"message": "Item removed from cart"}