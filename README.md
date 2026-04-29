# 📖 Hidden Chapters

**Hidden Chapters** is a mood-based **"blind date with a book"** platform designed to transform book discovery into an emotional and immersive experience.

Instead of browsing endless lists, users **choose a mood → receive a mysterious teaser → reveal a hidden book**.

---

## 🎯 Project Evolution

This project was built in two stages to demonstrate progressive enhancement:

### 🟡 Version 1 — Static Prototype

- Built using HTML, CSS, and JavaScript
- Used a **small, manually curated dataset**
- Book suggestions were:
  - Random or rule-based
  - Limited in diversity
- Focus: UI/UX concept and interaction design

---

### 🟢 Version 2 — Full Stack Recommendation System (Current)

- Backend powered by **Flask + MySQL**
- Loads database credentials from a local **`.env`** file
- Uses **TF-IDF + cosine similarity** to recommend books
- Supports **AI story continuation** through the Google Gemini API
- Dynamic data flow:

```text
Frontend → Flask API → MySQL → TF-IDF Recommendation Engine → Frontend
```

---

## ✨ Features

### 🎭 Mood-Based Discovery
Choose from multiple emotional states and receive a book that matches your mood.

### 🎁 Blind Reveal Experience
- Books appear as "wrapped gifts"
- Only a teaser is shown initially
- Users reveal the book through an interactive animation

### 🎯 Curated Recommendation System
- Uses multi-mood tagging
- Matches books directly based on emotional context
- Ensures relevant and intentional suggestions

### 🧠 Intelligent Data Design
Each book record contains:
- Title
- Author
- Genre
- Teaser
- Moods

The backend combines teaser, genre, author, and mood data to build similarity scores.

### 📝 Community Story Chain
- Users contribute to a shared story
- AI (Google Gemini) generates the next line from `/api/story/continue`

### 📤 Share Discoveries
- One-click copy-to-clipboard sharing

### 💎 Book of the Day
- Daily rotating recommendation

### 💾 Persistent Story Storage
- Uses LocalStorage to maintain story progress

---

## 🧠 Recommendation Logic

Instead of heavy ML models, the system uses:

- Backend text similarity using **TF-IDF + cosine similarity**
- Recommendation content built from the book's teaser, genre, author, and moods
- A simple lookup path that returns the most similar books for a selected book ID

This approach ensures:

- 👉 Better control over quality
- 👉 More meaningful user experience
- 👉 Faster performance

### How recommendations work

1. The frontend loads all books from the Flask API.
2. When a book is opened in the blind-date modal, Flask returns the top similar books using the book's teaser, genre, author, and moods.
3. The interface displays those suggestions in the **More Like This** panel.
4. When the story chain needs a next line, the frontend sends the current story to `/api/story/continue`.

---

## 🗃️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Flask (Python) |
| **Database** | MySQL |
| **Data Handling** | Pandas, scikit-learn |
| **APIs** | Google Gemini API, Web Clipboard API |
| **Environment** | python-dotenv |

---

## 🛠️ Setup Instructions

### 1️⃣ Database Setup

1. Install MySQL
2. Create the database:

```sql
CREATE DATABASE hidden_chapters;
```

3. Create a `.env` file in the project root with these values:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=hidden_chapters
GEMINI_API_KEY=your_gemini_api_key
```

4. Import your dataset into the `books` table

If you need to clean and load the CSV data first, run the helper scripts in this order:

```bash
python prepare.py
python import_to_mysql.py
```

### 2️⃣ Backend Setup

Install dependencies:

```bash
pip install flask flask-cors mysql-connector-python pandas scikit-learn python-dotenv
```

Run the server:

```bash
python app.py
```

### 3️⃣ Frontend Setup

Open `index.html` directly, or run with Live Server:

```
http://127.0.0.1:5500/
```

### 4️⃣ API Key Setup *(Optional)*

For AI Story Chain:

1. Get your key from [Google AI Studio](https://aistudio.google.com/)
2. Add it to the `.env` file as `GEMINI_API_KEY`
3. The backend will use it automatically when `/api/story/continue` is called

---

## 🚀 Future Scope

- User authentication & profiles
- Personalized recommendations (hybrid systems)
- Ratings, reviews, and favorites
- Mobile application
- Advanced AI-based recommendation models

---

## 💬 Key Highlights

✔ Full-stack project  
✔ Curated high-quality dataset  
✔ Multi-mood recommendation system  
✔ Unique, immersive UX  

---

## 📌 Final Note

> **Hidden Chapters** is not just a book recommendation system —
> it is an experience-driven platform that blends storytelling and emotion
> to redefine how users discover books.