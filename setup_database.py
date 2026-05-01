"""
Hidden Chapters — Full Database Setup Script
=============================================
Run this ONCE on a fresh database.

What it does:
  1. Creates books table (without moods column)
  2. Creates moods lookup table with all 18 valid moods
  3. Creates book_moods junction table (many-to-many)
  4. Adds indexes for fast queries
  5. Creates useful SQL Views
  6. Creates a Stored Procedure
  7. Imports all books from cleaned_books.csv
  8. Populates book_moods from the moods column in CSV

Usage:
    python setup_database.py

Requirements:
    - cleaned_books.csv must exist in the same folder
    - .env file with DB credentials
"""

import pandas as pd
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

INPUT_FILE = "cleaned_books.csv"

db_config = {
    'host':     os.getenv('DB_HOST'),
    'user':     os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# ─────────────────────────────────────────────
# VALIDATION
# ─────────────────────────────────────────────
missing = [k for k, v in db_config.items() if not v]
if missing:
    print(f"❌ Missing .env variables: {missing}")
    exit(1)

if not os.path.exists(INPUT_FILE):
    print(f"❌ {INPUT_FILE} not found. Run prepare.py first.")
    exit(1)

# ─────────────────────────────────────────────
# LOAD CSV
# ─────────────────────────────────────────────
print(f"📖 Loading {INPUT_FILE}...")
df = pd.read_csv(INPUT_FILE)
df = df.fillna('')
for col in df.columns:
    df[col] = df[col].astype(str).str.strip()
print(f"✓ {len(df)} books loaded from CSV")

# ─────────────────────────────────────────────
# CONNECT
# ─────────────────────────────────────────────
print(f"\n🔌 Connecting to MySQL...")
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()
print(f"✓ Connected to '{db_config['database']}'")

# ─────────────────────────────────────────────
# STEP 1 — CREATE books TABLE
# ─────────────────────────────────────────────
print("\n📐 Creating tables...")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        title        VARCHAR(255) NOT NULL,
        author       VARCHAR(255),
        genre        VARCHAR(255),
        teaser       LONGTEXT,
        buyLink      VARCHAR(500),
        downloadLink VARCHAR(500)
    )
""")
print("  ✓ books table created")

# ─────────────────────────────────────────────
# STEP 2 — CREATE moods LOOKUP TABLE
# ─────────────────────────────────────────────
cursor.execute("""
    CREATE TABLE IF NOT EXISTS moods (
        id   INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    )
""")
print("  ✓ moods table created")

# Insert all 18 valid moods
VALID_MOODS = [
    'adventurous', 'romantic', 'mysterious', 'suspenseful', 'humorous',
    'hopeful', 'heartbreaking', 'inspiring', 'thought-provoking', 'sci-fi',
    'scary', 'dark romance', 'sexy', 'bl romance', 'gl romance',
    'drama', 'tragedy', 'fantasy'
]
for mood in VALID_MOODS:
    cursor.execute("INSERT IGNORE INTO moods (name) VALUES (%s)", (mood,))
print(f"  ✓ {len(VALID_MOODS)} moods inserted")

# ─────────────────────────────────────────────
# STEP 3 — CREATE book_moods JUNCTION TABLE
# ─────────────────────────────────────────────
cursor.execute("""
    CREATE TABLE IF NOT EXISTS book_moods (
        book_id INT NOT NULL,
        mood_id INT NOT NULL,
        PRIMARY KEY (book_id, mood_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE CASCADE
    )
""")
print("  ✓ book_moods junction table created")

# ─────────────────────────────────────────────
# STEP 4 — ADD INDEXES
# ─────────────────────────────────────────────
# Use try/except per index since IF NOT EXISTS isn't supported for indexes in all MySQL versions
for idx_sql in [
    "CREATE INDEX idx_books_genre   ON books(genre)",
    "CREATE INDEX idx_books_author  ON books(author)",
    "CREATE INDEX idx_bm_book       ON book_moods(book_id)",
    "CREATE INDEX idx_bm_mood       ON book_moods(mood_id)",
]:
    try:
        cursor.execute(idx_sql)
    except mysql.connector.Error:
        pass  # Index already exists — that's fine
print("  ✓ Indexes added")

conn.commit()

# ─────────────────────────────────────────────
# STEP 5 — CREATE VIEWS
# ─────────────────────────────────────────────
cursor.execute("""
    CREATE OR REPLACE VIEW v_books_with_moods AS
    SELECT
        b.id,
        b.title,
        b.author,
        b.genre,
        b.teaser,
        b.buyLink,
        b.downloadLink,
        GROUP_CONCAT(m.name ORDER BY m.name SEPARATOR ',') AS moods
    FROM books b
    LEFT JOIN book_moods bm ON b.id  = bm.book_id
    LEFT JOIN moods m       ON m.id  = bm.mood_id
    GROUP BY b.id, b.title, b.author, b.genre,
             b.teaser, b.buyLink, b.downloadLink
""")

cursor.execute("""
    CREATE OR REPLACE VIEW v_mood_popularity AS
    SELECT
        m.name            AS mood,
        COUNT(bm.book_id) AS book_count
    FROM moods m
    LEFT JOIN book_moods bm ON m.id = bm.mood_id
    GROUP BY m.id, m.name
    ORDER BY book_count DESC
""")
print("  ✓ Views created (v_books_with_moods, v_mood_popularity)")

# ─────────────────────────────────────────────
# STEP 6 — CREATE STORED PROCEDURE
# ─────────────────────────────────────────────
cursor.execute("DROP PROCEDURE IF EXISTS GetBooksByMood")
cursor.execute("""
    CREATE PROCEDURE GetBooksByMood(IN mood_name VARCHAR(100))
    BEGIN
        SELECT b.id, b.title, b.author, b.genre, b.teaser
        FROM books b
        JOIN book_moods bm ON b.id = bm.book_id
        JOIN moods m       ON m.id = bm.mood_id
        WHERE m.name = mood_name;
    END
""")
print("  ✓ Stored procedure GetBooksByMood created")
conn.commit()

# ─────────────────────────────────────────────
# STEP 6b — CREATE users TABLE
# ─────────────────────────────────────────────
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        username      VARCHAR(100) NOT NULL UNIQUE,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role          ENUM('user', 'admin') DEFAULT 'user',
        is_new_user   BOOLEAN DEFAULT TRUE,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")
print("  ✓ users table created")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        pref_type  ENUM('mood', 'genre') NOT NULL,
        pref_value VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_pref (user_id, pref_type, pref_value)
    )
""")
print("  ✓ user_preferences table created")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookshelf (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        user_id  INT NOT NULL,
        book_id  INT NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE KEY unique_shelf (user_id, book_id)
    )
""")
print("  ✓ bookshelf table created")

for idx_sql in [
    "CREATE INDEX idx_prefs_user ON user_preferences(user_id)",
    "CREATE INDEX idx_shelf_user ON bookshelf(user_id)",
]:
    try:
        cursor.execute(idx_sql)
    except Exception:
        pass
print("  ✓ user table indexes added")
conn.commit()

# ─────────────────────────────────────────────
# STEP 7 — IMPORT BOOKS FROM CSV
# ─────────────────────────────────────────────
print(f"\n📥 Importing {len(df)} books...")

# Build mood name → id map
cursor.execute("SELECT id, name FROM moods")
mood_map = {row[1].strip().lower(): row[0] for row in cursor.fetchall()}

book_inserted = 0
mood_linked   = 0
mood_skipped  = 0

for _, row in df.iterrows():
    # Insert book (no moods column — it's normalized now)
    cursor.execute("""
        INSERT INTO books (title, author, genre, teaser, buyLink, downloadLink)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        row.get('title', ''),
        row.get('author', ''),
        row.get('genre', ''),
        row.get('teaser', ''),
        row.get('buyLink', ''),
        row.get('downloadLink', '')
    ))
    book_id = cursor.lastrowid
    book_inserted += 1

    # Parse moods from CSV and insert into junction table
    raw_moods = row.get('moods', '')
    mood_list = [m.strip().lower() for m in raw_moods.split(',') if m.strip()]

    for mood_name in mood_list:
        mood_id = mood_map.get(mood_name)
        if mood_id:
            cursor.execute(
                "INSERT IGNORE INTO book_moods (book_id, mood_id) VALUES (%s, %s)",
                (book_id, mood_id)
            )
            mood_linked += 1
        else:
            print(f"  ⚠️  Unknown mood '{mood_name}' for '{row.get('title')}' — skipped")
            mood_skipped += 1

conn.commit()
cursor.close()
conn.close()

# ─────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────
print(f"""
✅ Database setup complete!
─────────────────────────────
  Books imported      : {book_inserted}
  Mood links created  : {mood_linked}
  Unknown moods skipped: {mood_skipped}
─────────────────────────────
Tables  : books, moods, book_moods
Views   : v_books_with_moods, v_mood_popularity
Proc    : GetBooksByMood('adventurous')

👉 Next: run python app.py
""")