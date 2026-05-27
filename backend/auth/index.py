import hashlib
import json
import os
import secrets

import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6422742_moss_eco_project")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}


def handler(event: dict, context) -> dict:
    """Регистрация, вход, получение профиля и выход из аккаунта."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    method = event.get("httpMethod", "GET")

    if method == "POST" and action == "register":
        body = json.loads(event.get("body") or "{}")
        return register(body.get("email", "").strip().lower(), body.get("password", ""), body.get("name", "").strip())

    if method == "POST" and action == "login":
        body = json.loads(event.get("body") or "{}")
        return login(body.get("email", "").strip().lower(), body.get("password", ""))

    if method == "GET" and action == "me":
        token = get_token(event)
        return me(token)

    if method == "POST" and action == "logout":
        token = get_token(event)
        return logout(token)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Unknown action"})}


def get_token(event: dict) -> str:
    auth = event.get("headers", {}).get("X-Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return ""


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def register(email: str, password: str, name: str):
    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}
    if len(password) < 6:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль должен быть не менее 6 символов"})}

    conn = db()
    cur = conn.cursor()
    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
    if cur.fetchone():
        conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Пользователь с таким email уже существует"})}

    pwd_hash = hash_password(password)
    cur.execute(
        f"INSERT INTO {SCHEMA}.users (email, password, name) VALUES (%s, %s, %s) RETURNING id",
        (email, pwd_hash, name or None),
    )
    user_id = cur.fetchone()[0]

    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id),
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "name": name}}),
    }


def login(email: str, password: str):
    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}

    conn = db()
    cur = conn.cursor()
    pwd_hash = hash_password(password)
    cur.execute(
        f"SELECT id, email, name FROM {SCHEMA}.users WHERE email = %s AND password = %s",
        (email, pwd_hash),
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id, user_email, user_name = row
    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id),
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": user_email, "name": user_name}}),
    }


def me(token: str):
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.email, u.name FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"user": {"id": row[0], "email": row[1], "name": row[2]}}),
    }


def logout(token: str):
    if not token:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn = db()
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
