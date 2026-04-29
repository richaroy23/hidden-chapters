"""
MySQL Import Script for Hidden Chapters
========================================
Imports the cleaned books CSV into the MySQL database.

Usage:
    python import_to_mysql.py

Requirements:
    - cleaned_books.csv (output from prepare.py)
    - .env file with DB credentials:
      DB_HOST=localhost
      DB_USER=your_mysql_user
      DB_PASSWORD=your_mysql_password
      DB_NAME=hidden_chapters
"""

import pandas as pd
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define input file
INPUT_FILE = "cleaned_books.csv"

# Get database credentials from .env
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# Validate environment variables
missing_vars = [key for key, val in db_config.items() if not val]
if missing_vars:
    print("❌ Error: Missing environment variables in .env file:")
    for var in missing_vars:
        print(f"   - DB_{var.upper()}")
    print("\nPlease create a .env file with the following:")
    print("""
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=hidden_chapters
""")
    exit(1)

# Check if input file exists
if not os.path.exists(INPUT_FILE):
    print(f"❌ Error: {INPUT_FILE} not found.")
    print(f"   Please run 'python prepare.py' first to generate {INPUT_FILE}")
    exit(1)

try:
    # Load cleaned CSV
    print(f"📖 Loading {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE)
    print(f"✓ Loaded {len(df)} records")
    
    # Connect to MySQL
    print(f"🔌 Connecting to MySQL database '{db_config['database']}'...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # Add 'moods' column if it doesn't exist (for compatibility)
    if 'moods' not in df.columns:
        print("⚠️  Warning: No 'moods' column found. Adding empty moods column.")
        df['moods'] = ''
    
    # Create books table if it doesn't exist
    create_table_query = """
    CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        genre VARCHAR(255),
        teaser LONGTEXT,
        moods VARCHAR(500)
    )
    """
    cursor.execute(create_table_query)
    print("✓ Table 'books' ready")
    
    # Clear existing data
    cursor.execute("TRUNCATE TABLE books")
    print("✓ Cleared existing data")
    
    # Prepare data for insertion
    for idx, row in df.iterrows():
        query = """
        INSERT INTO books (title, author, genre, teaser, moods)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            row.get('title', ''),
            row.get('author', ''),
            row.get('genre', ''),
            row.get('teaser', ''),
            row.get('moods', '')
        )
        cursor.execute(query, values)
    
    # Commit changes
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n✅ Data imported successfully!")
    print(f"   Database: {db_config['database']}")
    print(f"   Table: books")
    print(f"   Records: {len(df)}")
    print(f"\n👉 Next step: Start the Flask server with 'python app.py'")

except mysql.connector.Error as err:
    if err.errno == 2003:
        print(f"❌ Error: Cannot connect to MySQL server at '{db_config['host']}'")
        print("   Please ensure MySQL is running and credentials are correct.")
    elif err.errno == 1049:
        print(f"❌ Error: Database '{db_config['database']}' does not exist.")
        print(f"   Create it with: CREATE DATABASE {db_config['database']};")
    else:
        print(f"❌ MySQL Error: {err}")
    exit(1)
except Exception as e:
    print(f"❌ Error during import: {e}")
    exit(1)
