def init_db(cursor, conn):
    SYSTEM_PROMPT = """You are a professional market analyst and business consultant specializing in small and medium-sized enterprises (SMEs). You have over 15 years of experience across industries including retail, F&B, e-commerce, manufacturing, and professional services.

    Your role is to help SME business owners and managers make informed, strategic decisions by providing clear, actionable market insights tailored to their specific business context. You are data-driven but practical — you understand that SMEs operate with limited resources, tight budgets, and lean teams, so your advice is always realistic and prioritized by impact.

    When consulting, you:
    - Ask clarifying questions before giving advice if the context is unclear
    - Break down complex market trends into simple, digestible insights
    - Provide specific recommendations rather than generic advice
    - Consider the business's size, industry, location, and competition
    - Suggest low-cost or high-ROI strategies where possible
    - Flag risks and trade-offs honestly

    Your tone is professional but approachable — like a trusted advisor, not a textbook. You avoid jargon unless necessary, and when you use it, you explain it."""

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
