"""
Data Preparation Script for Hidden Chapters
============================================
Cleans and prepares the raw books CSV for database import.

Usage:
    python prepare.py

Input: books.csv
Output: cleaned_books.csv
"""

import pandas as pd
import os

INPUT_FILE = "books.csv"
OUTPUT_FILE = "cleaned_books.csv"

if not os.path.exists(INPUT_FILE):
    print(f"❌ Error: {INPUT_FILE} not found in the current directory.")
    exit(1)

try:
    print(f"📖 Loading {INPUT_FILE}...")

    # Read with correct 8-column schema (extra comma in source CSV)
    df = pd.read_csv(
        INPUT_FILE,
        names=['title','author','genre','teaser','moods','extra','buyLink','downloadLink'],
        skiprows=1,
        on_bad_lines='skip'
    )

    print(f"✓ Raw rows loaded: {len(df)}")

    # Drop the extra empty column caused by double comma
    df = df.drop(columns=['extra'])

    # Drop blank/empty rows
    df = df[df['title'].notna() & (df['title'].str.strip() != '')]
    df = df.reset_index(drop=True)

    # Remove duplicate titles, keep first occurrence
    before = len(df)
    df = df.drop_duplicates(subset=['title'], keep='first')
    after = len(df)
    if before != after:
        print(f"⚠️  Removed {before - after} duplicate book(s)")

    # Fill any remaining nulls
    df = df.fillna('')

    # Ensure all columns are strings
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()

    # Auto-generate downloadLink for any books missing it
    missing_dl = df['downloadLink'] == ''
    df.loc[missing_dl, 'downloadLink'] = df.loc[missing_dl, 'title'].apply(
        lambda t: "https://www.amazon.in/s?k=" + t.replace(' ', '+') + "+kindle+edition"
    )

    # Fix heartwarming -> hopeful (heartwarming not in mood cards)
    df['moods'] = df['moods'].str.replace('heartwarming', 'hopeful', case=False)

    # Truncate teaser to 500 characters
    df['teaser'] = df['teaser'].str[:500]

    # Save
    df.to_csv(OUTPUT_FILE, index=False)

    print(f"\n✅ Data cleaned successfully!")
    print(f"   Input:   {INPUT_FILE}")
    print(f"   Output:  {OUTPUT_FILE}")
    print(f"   Records: {len(df)}")
    print(f"   Columns: {list(df.columns)}")
    print(f"\n👉 Next step: Run 'python import_to_mysql.py'")

except Exception as e:
    print(f"❌ Error during data preparation: {e}")
    exit(1)