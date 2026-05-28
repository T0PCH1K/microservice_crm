from fastapi import APIRouter, Query, Request
from datetime import datetime
import json
from ..db import db_fetch_all, db_execute

router = APIRouter()


@router.get("/api/logs")
async def get_logs(username: str = None, limit: int = 100):
    if username:
        sql = "SELECT id, username, action, entity_type, entity_id, details, ip_address, created_at FROM action_logs WHERE username = %s ORDER BY id DESC LIMIT %s"
        rows = await db_fetch_all(sql, (username, limit))
    else:
        sql = "SELECT id, username, action, entity_type, entity_id, details, ip_address, created_at FROM action_logs ORDER BY id DESC LIMIT %s"
        rows = await db_fetch_all(sql, (limit,))

    for row in rows:
        if isinstance(row.get('created_at'), datetime):
            row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    return rows


@router.post("/api/logs")
async def create_log(request: Request):
    data = await request.json()

    sql = "INSERT INTO action_logs (username, action, entity_type, entity_id, details, ip_address) VALUES (%s, %s, %s, %s, %s, %s)"
    await db_execute(sql, (
        data.get('username', 'unknown'),
        data.get('action', 'unknown'),
        data.get('entity_type', ''),
        data.get('entity_id', 0),
        json.dumps(data.get('details', {}), ensure_ascii=False),
        data.get('ip_address', '')
    ))

    return {"status": "ok"}
