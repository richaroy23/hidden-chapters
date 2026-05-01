# 📖 Hidden Chapters

**Hidden Chapters** is a mood-driven book discovery app that turns browsing into something more personal. Instead of scrolling through endless lists, you pick a mood, describe how you're feeling, and get matched with a book — wrapped like a gift, revealed like a surprise.

Built in two stages: a static prototype first, then a full-stack rebuild with Flask, MySQL, and a TF-IDF recommendation engine.

---

## ✨ Features

- **Mood Cards** — pick an emotion and get a curated book match
- **Smart Mood Detection** — type how you're feeling in plain words; the backend figures out the rest
- **Blind Date with a Book** — books are hidden behind teasers; unwrap them with an interactive reveal
- **Genre Filters** — narrow down the blind-date grid or shuffle for fresh picks
- **Book Details Modal** — teaser, cover art, buy link, download link, and "More Like This" suggestions
- **TF-IDF Recommendations** — similar books ranked by teaser, genre, author, and mood
- **User Auth** — register, log in, log out, persistent sessions
- **Onboarding** — new users set their mood and genre preferences on first sign-up
- **Personal Bookshelf** — save books and manage them from your shelf
- **Book of the Day** — a different recommendation every day
- **Community Story Chain** — add a line, or let Gemini continue the story for you

---

## 🗃️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript, Tailwind CSS, Lucide icons |
| Backend | Flask, Flask-CORS |
| Database | MySQL |
| Data | pandas, scikit-learn |
| Auth | bcrypt, Flask sessions |
| AI | Google Gemini API |
| Config | python-dotenv |

---

## 📁 Project Structure

```
app.py              → Flask app, all API routes, session handling, recommendations
script.js           → Frontend logic: moods, blind date, auth, bookshelf, story chain
index.html          → Main app shell
onboarding.html     → First-time preference setup
style.css           → Custom styles
books.csv           → Raw book dataset
prepare.py          → Cleans the CSV into cleaned_books.csv
setup_database.py   → Creates schema, imports books and mood data
mood_detector.py    → Detects moods from free-text input
```

---

## 🛠️ Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Create a `.env` file

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=hidden_chapters
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
```

`GEMINI_API_KEY` is only needed for the AI story continuation feature.

### 3. Prepare the data

```bash
python prepare.py
python setup_database.py
```

`prepare.py` cleans the raw CSV. `setup_database.py` creates the schema, loads the books, sets up mood relationships, and creates the bookshelf and user tables.

### 4. Run the app

```bash
python app.py
```

Open **`http://127.0.0.1:5000`** — not the HTML file directly. Everything runs from Flask so sessions and cookies work correctly.

---

## 🧠 How Recommendations Work

Rather than a heavy ML model, the system uses TF-IDF vectors built from each book's teaser, genre, author, and moods. When you open a book, Flask computes cosine similarity scores against the full dataset and returns the closest matches. It's lightweight, fast, and gives meaningful results without over-engineering.

Smart Mood Detection works differently — it runs sentiment analysis on your input, matches keywords and phrases to one of 18 mood categories, and queries books tagged with those moods.

---

## 🚀 What's Next

- Ratings and reviews
- Smarter hybrid recommendations
- Reading lists and collections
- Mobile app
- Personalized profiles

---

> Hidden Chapters isn't just a recommendation engine — it's built around the idea that finding your next book should feel like an experience, not a search query.