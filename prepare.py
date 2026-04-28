import pandas as pd

# Load your dataset
df = pd.read_csv("Books.csv")

# 🔍 Print columns to verify
print(df.columns)

# 🧹 Keep only required columns (edit based on your dataset)
df = df[['title', 'author', 'genre', 'description']]
# Rename to match your project
df.rename(columns={
    'description': 'teaser'
}, inplace=True)

# Remove missing data
df.fillna('', inplace=True)

df['title'] = df['title'].astype(str)
df['author'] = df['author'].astype(str)
df['genre'] = df['genre'].astype(str)
df['teaser'] = df['teaser'].astype(str)

df = df.head(3000)

df['teaser'] = df['teaser'].str[:500]

# Save cleaned file
df.to_csv("cleaned_books.csv", index=False)

print("Cleaned dataset saved!")