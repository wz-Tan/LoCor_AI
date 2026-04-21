import sqlite3

conn = sqlite3.connect("chat.db")
cursor = conn.cursor()

# Create table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")
conn.commit()


def save_message(role, content):
    cursor.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)", (role, content)
    )
    conn.commit()


def get_all_messages():
    cursor.execute("SELECT * FROM messages")
    rows = cursor.fetchall()
    messages = [{"role": row[1], "content": row[2]} for row in rows]
    return messages


def close_connection():
    conn.close()
