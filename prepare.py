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

# Define input and output filenames
INPUT_FILE = "books.csv"
OUTPUT_FILE = "cleaned_books.csv"

# Check if input file exists
if not os.path.exists(INPUT_FILE):
    print(f"❌ Error: {INPUT_FILE} not found in the current directory.")
    print(f"   Please ensure {INPUT_FILE} is in the same folder as this script.")
    exit(1)

try:
    # Load the dataset
    print(f"📖 Loading {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE)
    
    # Display column names for verification
    print(f"✓ Columns found: {list(df.columns)}")
    
    # Keep only required columns (adjust column names based on your dataset)
    required_columns = ['title', 'author', 'genre', 'description']
    available_columns = [col for col in required_columns if col in df.columns]
    
    if not available_columns:
        print("❌ Error: No recognized columns found.")
        print(f"   Expected columns: {required_columns}")
        print(f"   Found: {list(df.columns)}")
        exit(1)
    
    df = df[available_columns]
    
    # Rename 'description' to 'teaser' if it exists
    if 'description' in df.columns:
        df.rename(columns={'description': 'teaser'}, inplace=True)
    elif 'teaser' not in df.columns:
        # If neither exists, create an empty teaser column
        print("⚠️  Warning: No teaser/description column found. Creating empty teaser.")
        df['teaser'] = ''
    
    # Remove rows with missing critical data
    df.fillna('', inplace=True)
    
    # Ensure data types are strings
    for col in df.columns:
        df[col] = df[col].astype(str)
    
    # Limit to first 3000 rows (adjust as needed)
    df = df.head(3000)
    
    # Truncate teaser to 500 characters
    if 'teaser' in df.columns:
        df['teaser'] = df['teaser'].str[:500]
    
    # Save cleaned file
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n✅ Data cleaned successfully!")
    print(f"   Input: {INPUT_FILE} ({len(df)} rows)")
    print(f"   Output: {OUTPUT_FILE}")
    print(f"   Columns: {list(df.columns)}")
    print(f"\n👉 Next step: Run 'python import_to_mysql.py' to import into the database.")

except Exception as e:
    print(f"❌ Error during data preparation: {e}")
    exit(1)
