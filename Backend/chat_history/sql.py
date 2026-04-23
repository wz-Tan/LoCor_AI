def init_db(cursor, conn):
    from prompts.chat_history import SYSTEM_PROMPT

    try:
        cursor = conn.execute("SELECT COUNT(*) FROM messages")
        count = cursor.fetchone()[0]
        if count == 0:
            conn.execute(
                "INSERT INTO messages (role, content) VALUES (?, ?)",
                ("system", SYSTEM_PROMPT),
            )
            conn.execute(
                "INSERT INTO messages (role, content) VALUES (?, ?)",
                (
                    "assistant",
                    "Hello! I'm your LoCorAI assistant. Ask me anything about your inventory, trends, or recommendations.",
                ),
            )
            conn.commit()
    finally:
        return


def save_message(cursor, conn, role, content):
    cursor.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)", (role, content)
    )
    conn.commit()


def get_all_messages(cursor):
    cursor.execute("SELECT * FROM messages")
    rows = cursor.fetchall()
    messages = [{"role": row[1], "content": row[2]} for row in rows]
    return messages


def clear_messages(cursor, conn):
    cursor.execute("DELETE FROM messages")
    conn.commit()


def close_connection(conn):
    conn.close()
