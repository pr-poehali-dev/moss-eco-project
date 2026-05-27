import json
import os
import smtplib
# v2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправляет заявку с сайта на почту владельца."""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()

    if not name or not phone:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Имя и телефон обязательны"}),
        }

    smtp_user = "papet526@gmail.com"
    smtp_password = os.environ["SMTP_PASSWORD"]
    to_email = "papet526@gmail.com"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новая заявка с сайта MossLab от {name}"
    msg["From"] = smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px;">
      <h2 style="color: #2d6a4f;">Новая заявка с сайта MossLab</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px; font-weight:bold; color:#555;">Имя:</td>
          <td style="padding:8px;">{name}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:8px; font-weight:bold; color:#555;">Телефон:</td>
          <td style="padding:8px;">{phone}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold; color:#555;">Комментарий:</td>
          <td style="padding:8px;">{message or "—"}</td>
        </tr>
      </table>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True}),
    }