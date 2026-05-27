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
    """Загрузка и получение фотографий оттенков и товаров."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    kind = params.get("kind", "shade")  # "shade" или "product"

    if method == "GET":
        return get_product_images() if kind == "product" else get_shade_images()

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        image_b64 = body.get("image_b64", "")
        content_type = body.get("content_type", "image/jpeg")
        if not image_b64:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "image_b64 required"})}

        if kind == "product":
            product_id = body.get("product_id")
            if not product_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "product_id required"})}
            return upload_product_image(int(product_id), image_b64, content_type)
        else:
            shade_name = body.get("shade_name", "").strip()
            if not shade_name:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "shade_name required"})}
            return upload_shade_image(shade_name, image_b64, content_type)

    if method == "DELETE":
        if kind == "product":
            product_id = params.get("product_id")
            if not product_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "product_id required"})}
            return delete_product_image(int(product_id))
        else:
            shade_name = params.get("shade_name", "").strip()
            if not shade_name:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "shade_name required"})}
            return delete_shade_image(shade_name)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def upload_to_s3(folder: str, image_b64: str, content_type: str) -> str:
    image_data = base64.b64decode(image_b64)
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"{folder}/{uuid.uuid4()}.{ext}"
    s3_client().put_object(Bucket="files", Key=key, Body=image_data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


# ── Shades ────────────────────────────────────────────────────────────────────

def get_shade_images():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT shade_name, image_url FROM {SCHEMA}.shade_images")
    data = {row[0]: row[1] for row in cur.fetchall()}
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def upload_shade_image(shade_name: str, image_b64: str, content_type: str):
    url = upload_to_s3("shades", image_b64, content_type)
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


def delete_shade_image(shade_name: str):
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.shade_images WHERE shade_name = %s", (shade_name,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"deleted": shade_name})}


# ── Products ──────────────────────────────────────────────────────────────────

def get_product_images():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT product_id, image_url FROM {SCHEMA}.product_images")
    data = {str(row[0]): row[1] for row in cur.fetchall()}
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def upload_product_image(product_id: int, image_b64: str, content_type: str):
    url = upload_to_s3("products", image_b64, content_type)
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.product_images (product_id, image_url) VALUES (%s, %s) "
        f"ON CONFLICT (product_id) DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = NOW()",
        (product_id, url),
    )
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"product_id": product_id, "image_url": url})}


def delete_product_image(product_id: int):
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.product_images WHERE product_id = %s", (product_id,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"deleted": product_id})}
