import hashlib
import json
import os
import secrets
import smtplib
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import psycopg2

SMTP_USER = "papet526@gmail.com"
NOTIFY_EMAIL = "papet526@gmail.com"
TELEGRAM_CHAT_ID = "872293505"

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6422742_moss_eco_project")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
    "Access-Control-Max-Age": "86400",
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
        return register(body.get("email", "").strip().lower(), body.get("password", ""), body.get("name", "").strip(), body.get("phone", "").strip())

    if method == "POST" and action == "login":
        body = json.loads(event.get("body") or "{}")
        return login(body.get("email", "").strip().lower(), body.get("password", ""))

    if method == "GET" and action == "me":
        token = get_token(event)
        return me(token)

    if method == "POST" and action == "logout":
        token = get_token(event)
        return logout(token)

    if method == "GET" and action == "orders":
        token = get_token(event)
        return get_orders(token)

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


def register(email: str, password: str, name: str, phone: str = ""):
    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}
    if not phone:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Номер телефона обязателен"})}
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
        f"INSERT INTO {SCHEMA}.users (email, password, name, phone) VALUES (%s, %s, %s, %s) RETURNING id",
        (email, pwd_hash, name or None, phone),
    )
    user_id = cur.fetchone()[0]

    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id),
    )
    conn.commit()
    conn.close()

    notify_new_user(email, name)

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "name": name, "phone": phone, "orderCount": 0}}),
    }


def login(email: str, password: str):
    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}

    conn = db()
    cur = conn.cursor()
    pwd_hash = hash_password(password)
    cur.execute(
        f"SELECT id, email, name, phone FROM {SCHEMA}.users WHERE email = %s AND password = %s",
        (email, pwd_hash),
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id, user_email, user_name, user_phone = row
    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id),
    )
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders WHERE user_id = %s AND status = 'paid'", (user_id,))
    order_count = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": user_email, "name": user_name, "phone": user_phone, "orderCount": order_count}}),
    }


def me(token: str):
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.email, u.name, u.phone FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()

    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id = row[0]
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders WHERE user_id = %s AND status = 'paid'", (user_id,))
    order_count = cur.fetchone()[0]
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"user": {"id": row[0], "email": row[1], "name": row[2], "phone": row[3], "orderCount": order_count}}),
    }


def notify_new_user(email: str, name: str):
    display = name or email
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Новый пользователь на Borovik_moss: {display}"
        msg["From"] = SMTP_USER
        msg["To"] = NOTIFY_EMAIL
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
          <h2 style="color: #2d6a4f;">Новый пользователь зарегистрировался на Borovik_moss</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px; font-weight:bold; color:#555;">Имя:</td>
              <td style="padding:8px;">{name or "—"}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:8px; font-weight:bold; color:#555;">Email:</td>
              <td style="padding:8px;">{email}</td>
            </tr>
          </table>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_USER, os.environ["SMTP_PASSWORD"])
            server.sendmail(SMTP_USER, NOTIFY_EMAIL, msg.as_string())
    except Exception:
        pass

    try:
        token = os.environ["TELEGRAM_BOT_TOKEN"]
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        text = f"👤 <b>Новый пользователь на Borovik_moss</b>\n\n<b>Имя:</b> {name or '—'}\n<b>Email:</b> {email}"
        data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"}).encode()
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req)
    except Exception:
        pass


def get_orders(token: str):
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id = row[0]
    cur.execute(
        f"SELECT id, name, phone, message, items, total, discount, final_total, status, created_at "
        f"FROM {SCHEMA}.orders WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,),
    )
    rows = cur.fetchall()
    conn.close()

    orders = [
        {
            "id": r[0],
            "name": r[1],
            "phone": r[2],
            "message": r[3],
            "items": r[4],
            "total": r[5],
            "discount": r[6],
            "finalTotal": r[7],
            "status": r[8],
            "createdAt": r[9].isoformat(),
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"orders": orders})}


def logout(token: str):
    if not token:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn = db()
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}