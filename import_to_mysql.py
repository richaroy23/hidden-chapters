import pandas as pd
from sqlalchemy import create_engine

# Load cleaned CSV
df = pd.read_csv("cleaned_books.csv")

# MySQL connection
engine = create_engine("mysql+pymysql://root:Richa%4023aug@localhost/hidden_chapters")

# Upload to MySQL
df.to_sql('books', con=engine, if_exists='replace', index=False)

print("✅ Data imported successfully!")