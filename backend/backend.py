from contextlib import contextmanager
from decimal import Decimal
from typing import List, Optional
import bcrypt
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import re

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


# ---------- Items (shoppers only see approved products) ----------
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
# This is the version FastAPI was already running (the first definition of each
# route wins). The duplicate block further down in the old file has been removed.
class CartAddRequest(BaseModel):
    user_id: int
    item_id: int
    quantity: int = Field(1, ge=1, le=99)


class CartQuantityUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=99)


@backend_data.get("/cart/{user_id}")
def get_cart(user_id: int):
    with db_cursor() as cursor:
        # Only approved products: archived or pending ones can't be bought
        cursor.execute(
            """SELECT c.CART_ITEM_ID, c.ITEM_ID, c.QUANTITY,
                      i.ITEM_NAME, i.ITEM_DESCRIPTION, i.ITEM_PRICE, i.ITEM_CATEGORY
               FROM cart_items c
               JOIN items i ON i.ITEM_ID = c.ITEM_ID
               WHERE c.USER_ID = %s AND i.ITEM_STATUS = 'Approved'
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


# ---------- Admin: products ----------
class ItemCreateRequest(BaseModel):
    item_name: str
    item_price: float
    item_category: str
    item_description: str
    item_status: str = "Approved"


@backend_data.get("/admin/items")
def get_all_items():
    """Every product, whatever its status (the shop's /items only returns approved ones)."""
    with db_cursor() as cursor:
        cursor.execute("SELECT * FROM items ORDER BY ITEM_ID DESC")
        results = cursor.fetchall()
    return {"items": results}


def clean_category(cursor, raw: str, exclude_id: int | None = None) -> str:
    """Trims the name, rejects empty ones, and reuses an existing spelling when only the capitals differ."""
    name = re.sub(r"\s+", " ", (raw or "").strip())
    if not name:
        raise HTTPException(status_code=400, detail="Category is required")

    sql = "SELECT ITEM_CATEGORY FROM items WHERE LOWER(TRIM(ITEM_CATEGORY)) = LOWER(%s)"
    params: list = [name]
    if exclude_id is not None:
        sql += " AND ITEM_ID <> %s"  # lets you fix the capitals of a category used by only this product
        params.append(exclude_id)
    cursor.execute(sql + " LIMIT 1", params)
    row = cursor.fetchone()
    return row["ITEM_CATEGORY"].strip() if row else name


@backend_data.post("/items")
def create_item(data: ItemCreateRequest):
    with db_cursor(commit=True) as cursor:
        category = clean_category(cursor, data.item_category)
        cursor.execute(
            """INSERT INTO items (ITEM_NAME, ITEM_PRICE, ITEM_CATEGORY, ITEM_DESCRIPTION, ITEM_STATUS)
               VALUES (%s, %s, %s, %s, %s)""",
            (data.item_name, data.item_price, category, data.item_description, data.item_status),
        )
        new_item_id = cursor.lastrowid
    return {"message": "Item created successfully", "item_id": new_item_id}


@backend_data.put("/items/{item_id}")
def update_item(item_id: int, data: ItemCreateRequest):
    with db_cursor(commit=True) as cursor:
        category = clean_category(cursor, data.item_category, exclude_id=item_id)
        cursor.execute(
            """UPDATE items
               SET ITEM_NAME = %s, ITEM_PRICE = %s, ITEM_CATEGORY = %s, ITEM_DESCRIPTION = %s, ITEM_STATUS = %s
               WHERE ITEM_ID = %s""",
            (data.item_name, data.item_price, category, data.item_description, data.item_status, item_id),
        )
    return {"message": "Item updated successfully"}

@backend_data.delete("/items/{item_id}")
def archive_or_delete_item(item_id: int):
    with db_cursor(commit=True) as cursor:
        cursor.execute("SELECT ITEM_STATUS FROM items WHERE ITEM_ID = %s", (item_id,))
        item = cursor.fetchone()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        if item["ITEM_STATUS"] != "Archived":
            # Step 1: soft delete (move to archive)
            cursor.execute("UPDATE items SET ITEM_STATUS = 'Archived' WHERE ITEM_ID = %s", (item_id,))
            return {"message": "Product moved to archive successfully", "status": "Archived"}

        # Step 2: permanent delete (only allowed once archived)
        try:
            cursor.execute("DELETE FROM cart_items WHERE ITEM_ID = %s", (item_id,))
            cursor.execute("DELETE FROM items WHERE ITEM_ID = %s", (item_id,))
        except mysql.connector.IntegrityError:
            # Nothing is committed when an HTTPException leaves the block
            raise HTTPException(
                status_code=409,
                detail="This product is part of past orders, so it can't be deleted. Leave it archived.",
            )
        return {"message": "Product permanently deleted", "status": "Deleted"}


# ---------- Admin: orders ----------
class OrderStatusUpdate(BaseModel):
    status: str


@backend_data.get("/admin/orders")
def get_admin_orders():
    with db_cursor() as cursor:
        cursor.execute(
            """SELECT o.ORDER_ID, o.USER_ID, o.TOTAL_AMOUNT, o.STATUS, o.CREATED_AT,
                      CONCAT(a.USER_FIRST_NAME, ' ', a.USER_LAST_NAME) AS USER_NAME,
                      a.USER_EMAIL
               FROM orders o
               JOIN accounts a ON o.USER_ID = a.USER_ID
               ORDER BY o.CREATED_AT DESC"""
        )
        orders = cursor.fetchall()

        items_by_order = {o["ORDER_ID"]: [] for o in orders}
        if items_by_order:
            marks = ",".join(["%s"] * len(items_by_order))
            cursor.execute(
                f"""SELECT oi.ORDER_ID,
                           COALESCE(i.ITEM_NAME, 'Removed product') AS ITEM_NAME,
                           oi.PRICE AS ITEM_PRICE,
                           oi.QUANTITY
                    FROM order_items oi
                    LEFT JOIN items i ON i.ITEM_ID = oi.ITEM_ID
                    WHERE oi.ORDER_ID IN ({marks})
                    ORDER BY oi.ORDER_ITEM_ID""",
                list(items_by_order),
            )
            for row in cursor.fetchall():
                items_by_order[row["ORDER_ID"]].append(
                    {"ITEM_NAME": row["ITEM_NAME"], "ITEM_PRICE": row["ITEM_PRICE"], "QUANTITY": row["QUANTITY"]}
                )

    for order in orders:
        order["ITEMS"] = items_by_order[order["ORDER_ID"]]
    return {"orders": orders}


@backend_data.put("/admin/orders/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate):
    if data.status not in ("Approved", "Cancelled"):
        raise HTTPException(status_code=400, detail="Status must be Approved or Cancelled")

    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE orders SET STATUS = %s WHERE ORDER_ID = %s AND STATUS = 'Pending'",
            (data.status, order_id),
        )
        changed = cursor.rowcount

    if changed == 0:
        raise HTTPException(
            status_code=409,
            detail="This order is no longer pending. Refresh to see its current status.",
        )
    return {"message": "Order status updated successfully"}


# ---------- Admin login ----------
@backend_data.post("/admin/login")
def admin_login(credentials: LoginRequest):
    with db_cursor() as cursor:
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

    if (user["USER_ROLE"] or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Not an administrator")

    return {
        "message": "Login successful",
        "user_id": user["USER_ID"],
        "role": user["USER_ROLE"],
        "name": f"{user['USER_FIRST_NAME']} {user['USER_LAST_NAME']}",
        "email": user["USER_EMAIL"],
    }

# ---------- Orders (customer side) ----------
class CheckoutRequest(BaseModel):
    user_id: int
    cart_item_ids: Optional[List[int]] = None  # selected cart rows; omit to buy the whole cart


@backend_data.get("/orders/{user_id}")
def get_user_orders(user_id: int):
    with db_cursor() as cursor:
        cursor.execute(
            """SELECT ORDER_ID, TOTAL_AMOUNT, STATUS, CREATED_AT
               FROM orders WHERE USER_ID = %s
               ORDER BY CREATED_AT DESC, ORDER_ID DESC""",
            (user_id,),
        )
        orders = cursor.fetchall()

        items_by_order = {o["ORDER_ID"]: [] for o in orders}
        if items_by_order:
            marks = ",".join(["%s"] * len(items_by_order))
            cursor.execute(
                f"""SELECT oi.ORDER_ID,
                           COALESCE(i.ITEM_NAME, 'Removed product') AS ITEM_NAME,
                           oi.PRICE AS ITEM_PRICE,
                           oi.QUANTITY
                    FROM order_items oi
                    LEFT JOIN items i ON i.ITEM_ID = oi.ITEM_ID
                    WHERE oi.ORDER_ID IN ({marks})
                    ORDER BY oi.ORDER_ITEM_ID""",
                list(items_by_order),
            )
            for row in cursor.fetchall():
                items_by_order[row["ORDER_ID"]].append(
                    {"ITEM_NAME": row["ITEM_NAME"], "ITEM_PRICE": row["ITEM_PRICE"], "QUANTITY": row["QUANTITY"]}
                )

    for order in orders:
        order["ITEMS"] = items_by_order[order["ORDER_ID"]]
    return {"orders": orders}


@backend_data.post("/orders")
def place_order(data: CheckoutRequest):
    """Turns the user's cart (or just the selected rows) into a Pending order."""
    with db_cursor(commit=True) as cursor:
        sql = """SELECT c.CART_ITEM_ID, c.ITEM_ID, c.QUANTITY, i.ITEM_NAME, i.ITEM_PRICE
                 FROM cart_items c
                 JOIN items i ON i.ITEM_ID = c.ITEM_ID
                 WHERE c.USER_ID = %s AND i.ITEM_STATUS = 'Approved'"""
        params: list = [data.user_id]
        if data.cart_item_ids:
            marks = ",".join(["%s"] * len(data.cart_item_ids))
            sql += f" AND c.CART_ITEM_ID IN ({marks})"
            params += data.cart_item_ids

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        if not rows:
            raise HTTPException(status_code=400, detail="Nothing to check out")

        total = sum(Decimal(str(r["ITEM_PRICE"])) * r["QUANTITY"] for r in rows)

        cursor.execute(
            "INSERT INTO orders (USER_ID, TOTAL_AMOUNT, STATUS, CREATED_AT) VALUES (%s, %s, 'Pending', NOW())",
            (data.user_id, total),
        )
        order_id = cursor.lastrowid

        cursor.executemany(
            """INSERT INTO order_items (ORDER_ID, ITEM_ID, QUANTITY, PRICE)
               VALUES (%s, %s, %s, %s)""",
            [(order_id, r["ITEM_ID"], r["QUANTITY"], r["ITEM_PRICE"]) for r in rows],
        )

        cart_ids = [r["CART_ITEM_ID"] for r in rows]
        marks = ",".join(["%s"] * len(cart_ids))
        cursor.execute(f"DELETE FROM cart_items WHERE CART_ITEM_ID IN ({marks})", cart_ids)

    return {"message": "Order placed", "order_id": order_id, "total": total}

#  Cancel Order (user side)

class CancelOrderRequest(BaseModel):
    user_id: int


@backend_data.put("/orders/{order_id}/cancel")
def cancel_my_order(order_id: int, data: CancelOrderRequest):
    """A customer can cancel their own order, but only while it is still Pending."""
    with db_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE orders SET STATUS = 'Cancelled' WHERE ORDER_ID = %s AND USER_ID = %s AND STATUS = 'Pending'",
            (order_id, data.user_id),
        )
        changed = cursor.rowcount

        order = None
        if changed == 0:
            cursor.execute(
                "SELECT STATUS FROM orders WHERE ORDER_ID = %s AND USER_ID = %s",
                (order_id, data.user_id),
            )
            order = cursor.fetchone()

    if changed == 1:
        return {"message": "Order cancelled", "status": "Cancelled"}
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    raise HTTPException(
        status_code=409,
        detail=f"This order is already {order['STATUS'].lower()}, so it can't be cancelled here. Contact the store.",
    )