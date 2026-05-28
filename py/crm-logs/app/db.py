import aiomysql
from .config import DB_HOST, DB_USER, DB_PASS, DB_NAME


async def get_connection():
    return await aiomysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        db=DB_NAME,
        charset='utf8mb4',
        autocommit=True
    )


async def db_fetch_all(sql: str, params: tuple = None):
    conn = await get_connection()
    cursor = await conn.cursor(aiomysql.DictCursor)
    await cursor.execute(sql, params or ())
    rows = await cursor.fetchall()
    await cursor.close()
    conn.close()
    return list(rows)


async def db_execute(sql: str, params: tuple = None):
    conn = await get_connection()
    cursor = await conn.cursor()
    await cursor.execute(sql, params or ())
    await cursor.close()
    conn.close()
