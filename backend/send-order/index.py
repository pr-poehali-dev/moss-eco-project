import json
import os
import smtplib
import urllib.request
# v4
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2

TELEGRAM_CHAT_ID = "872293505"
SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6422742_moss_eco_project")


def send_telegram(text: str):
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)


def get_user_id_by_token(token: str):
    if not token:
        return None
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None


ADMIN_TOKEN = "moss_admin_2026"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
    "Access-Control-Max-Age": "86400",
}


def handler(event: dict, context) -> dict:
    """Отправляет заявку с сайта на почту, в Telegram, сохраняет заказ в БД. Позволяет менять статус заказа."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "POST")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    # Получить все заказы (для админки)
    if method == "GET" and action == "list":
        admin_token = params.get("admin_token", "")
        if admin_token != ADMIN_TOKEN:
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
        return get_all_orders()

    # Сменить статус заказа
    if method == "PATCH" and action == "status":
        admin_token = params.get("admin_token", "")
        if admin_token != ADMIN_TOKEN:
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Forbidden"})}
        body = json.loads(event.get("body") or "{}")
        order_id = body.get("orderId")
        status = body.get("status")
        if not order_id or not status:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "orderId and status required"})}
        return update_order_status(order_id, status)

    auth_header = (event.get("headers") or {}).get("X-Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""
    user_id = get_user_id_by_token(token)

    body = json.loads(event.get("body") or "{}")
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()
    items = body.get("items", [])
    total = body.get("total", 0)
    discount = body.get("discount", 0)
    final_total = body.get("finalTotal", 0)

    if not name or not phone:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Имя и телефон обязательны"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.orders (user_id, name, phone, message, items, total, discount, final_total) "
        f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (user_id, name, phone, message or None, json.dumps(items), total, discount, final_total),
    )
    order_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    smtp_user = "papet526@gmail.com"
    smtp_password = os.environ["SMTP_PASSWORD"]
    to_email = "papet526@gmail.com"

    items_html = "".join(
        f"<tr><td style='padding:4px 8px;'>{i.get('name','')}</td>"
        f"<td style='padding:4px 8px;'>{i.get('qty',1)} ед.</td>"
        f"<td style='padding:4px 8px;'>{i.get('price',0) * i.get('qty',1):,} ₽</td></tr>"
        for i in items
    ) if items else "<tr><td colspan='3' style='padding:4px 8px;'>—</td></tr>"

    discount_row = f"<tr style='background:#f0fff4;'><td colspan='2' style='padding:4px 8px; color:#2d6a4f;'><b>Скидка {discount}%</b></td><td style='padding:4px 8px; color:#2d6a4f;'>−{total - final_total:,} ₽</td></tr>" if discount else ""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новая заявка #{order_id} с сайта Borovik_moss от {name}"
    msg["From"] = smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #2d6a4f;">Новая заявка #{order_id} с сайта Borovik_moss</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">
        <tr><td style="padding:8px; font-weight:bold; color:#555;">Имя:</td><td style="padding:8px;">{name}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold; color:#555;">Телефон:</td><td style="padding:8px;">{phone}</td></tr>
        <tr><td style="padding:8px; font-weight:bold; color:#555;">Комментарий:</td><td style="padding:8px;">{message or "—"}</td></tr>
      </table>
      <table style="width:100%; border-collapse:collapse; border:1px solid #ddd;">
        <thead><tr style="background:#2d6a4f; color:white;"><th style="padding:8px;">Товар</th><th style="padding:8px;">Кол-во</th><th style="padding:8px;">Сумма</th></tr></thead>
        <tbody>{items_html}{discount_row}</tbody>
        <tfoot><tr style="font-weight:bold;"><td colspan="2" style="padding:8px;">Итого к оплате:</td><td style="padding:8px;">{final_total:,} ₽</td></tr></tfoot>
      </table>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
        print("[send-order] email sent OK")
    except Exception as e:
        print(f"[send-order] email ERROR: {e}")

    items_tg = "\n".join(f"  • {i.get('name','')} × {i.get('qty',1)}" for i in items) if items else "  —"
    tg_text = (
        f"🌿 <b>Заявка #{order_id} — Borovik_moss</b>\n\n"
        f"<b>Имя:</b> {name}\n"
        f"<b>Телефон:</b> {phone}\n"
        f"<b>Комментарий:</b> {message or '—'}\n\n"
        f"<b>Состав:</b>\n{items_tg}\n\n"
        f"<b>Итого:</b> {final_total:,} ₽" + (f" (скидка {discount}%)" if discount else "")
    )
    try:
        send_telegram(tg_text)
    except Exception:
        pass

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "orderId": order_id}),
    }


def get_all_orders():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"SELECT o.id, o.user_id, o.name, o.phone, o.message, o.items, o.total, o.discount, o.final_total, o.status, o.created_at, u.email "
        f"FROM {SCHEMA}.orders o LEFT JOIN {SCHEMA}.users u ON u.id = o.user_id "
        f"ORDER BY o.created_at DESC"
    )
    rows = cur.fetchall()
    conn.close()
    orders = [
        {
            "id": r[0], "userId": r[1], "name": r[2], "phone": r[3],
            "message": r[4], "items": r[5], "total": r[6],
            "discount": r[7], "finalTotal": r[8], "status": r[9],
            "createdAt": r[10].isoformat(), "userEmail": r[11],
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"orders": orders})}


def update_order_status(order_id: int, status: str):
    allowed = ("new", "confirmed", "paid", "shipped", "cancelled")
    if status not in allowed:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Invalid status"})}
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.orders SET status = %s WHERE id = %s RETURNING id", (status, order_id))
    row = cur.fetchone()
    conn.commit()
    conn.close()
    if not row:
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Order not found"})}
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}