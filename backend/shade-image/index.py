import base64
import json
import os
import uuid

import boto3
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6422742_moss_eco_project")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    """Загрузка и получение фотографий оттенков мха."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return get_images()

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        shade_name = body.get("shade_name", "").strip()
        image_b64 = body.get("image_b64", "")
        content_type = body.get("content_type", "image/jpeg")
        if not shade_name or not image_b64:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "shade_name and image_b64 required"})}
        return upload_image(shade_name, image_b64, content_type)

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        shade_name = params.get("shade_name", "").strip()
        if not shade_name:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "shade_name required"})}
        return delete_image(shade_name)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def get_images():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT shade_name, image_url FROM {SCHEMA}.shade_images")
    rows = cur.fetchall()
    conn.close()
    data = {row[0]: row[1] for row in rows}
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def upload_image(shade_name: str, image_b64: str, content_type: str):
    image_data = base64.b64decode(image_b64)
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"shades/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=image_data, ContentType=content_type)
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.shade_images (shade_name, image_url) VALUES (%s, %s) "
        f"ON CONFLICT (shade_name) DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = NOW()",
        (shade_name, url),
    )
    conn.commit()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"shade_name": shade_name, "image_url": url})}


def delete_image(shade_name: str):
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.shade_images WHERE shade_name = %s", (shade_name,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"deleted": shade_name})}
