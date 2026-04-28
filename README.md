# 📖 Hidden Chapters

**Hidden Chapters** is a mood-based **“blind date with a book”** platform designed to transform book discovery into an emotional and immersive experience.

Instead of browsing endless lists, users **choose a mood → receive a mysterious teaser → reveal a hidden book**.

---

# 🎯 Project Evolution

This project was built in two stages to demonstrate progressive enhancement:

### 🟡 Version 1 — Static Prototype

* Built using HTML, CSS, and JavaScript
* Used a **small, manually curated dataset**
* Book suggestions were:

  * Random or rule-based
  * Limited in diversity
* Focus: UI/UX concept and interaction design

---

### 🟢 Version 2 — Full AI-Integrated System (Current)

* Integrated **real-world dataset (3000+ books)**
* Backend powered by **Flask + MySQL**
* Implemented **content-based recommendation system** using:

  * TF-IDF Vectorization
  * Cosine Similarity
* Dynamic data flow:

```text
Frontend → Flask API → MySQL → AI Recommendation → Frontend
```

👉 This version transforms the project into a **complete AI-powered full-stack application**

---

# ✨ Features

## 🎭 Mood-Based Discovery

Choose from multiple emotional states and receive a personalized book suggestion.

## 🎁 Blind Reveal Experience

* Books appear as “wrapped gifts”
* Only a teaser is shown initially
* Users reveal the book through an interactive animation

## 🤖 AI-Powered Recommendations

* Uses **TF-IDF + cosine similarity**
* Suggests similar books dynamically based on content

## 🔍 Genre Filtering

Refine your discovery experience with genre-based filtering.

## 📝 Community Story Chain

* Users contribute to a shared story
* AI (Google Gemini) generates the next line

## 📤 Share Discoveries

* One-click copy-to-clipboard sharing

## 💎 Book of the Day

* Daily rotating recommendation

## 💾 Persistent Story Storage

* Uses LocalStorage to maintain story progress

---

# 🧠 AI & Data Processing

The recommendation system uses:

* **Text Feature Engineering**

  * Combines:

    * Description (teaser)
    * Genre
    * Author

* **TF-IDF Vectorization**

* **Cosine Similarity**

This enables:
👉 Content-based book recommendations without user history

---

# 🗃️ Tech Stack

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Flask (Python)

## Database

* MySQL

## Machine Learning

* Pandas
* Scikit-learn

## APIs

* Google Gemini API (story continuation)
* Web Clipboard API

---

# 🛠️ Setup Instructions

## 1️⃣ Database Setup

1. Install MySQL
2. Create database:

```sql
CREATE DATABASE hidden_chapters;
```

3. Import cleaned dataset (`cleaned_books.csv`) into `books` table

---

## 2️⃣ Backend Setup

Install dependencies:

```bash
pip install flask flask-cors mysql-connector-python pandas scikit-learn
```

Run server:

```bash
python app.py
```

---

## 3️⃣ Frontend Setup

Simply open:

```text
index.html
```

or use:

```text
http://127.0.0.1:5500/
```

---

## 4️⃣ API Key Setup (Optional)

For AI Story Chain:

1. Get key from Google AI Studio
2. Open `script.js`
3. Add:

```js
const API_KEY = "YOUR_API_KEY";
```

---

# 🚀 Future Scope

* User authentication & profiles
* Personalized recommendations (collaborative filtering)
* Book ratings & reviews
* Mobile application
* Payment integration for premium books

---

# 💬 Key Highlights

✔ Full-stack AI project
✔ Real dataset integration
✔ Content-based recommendation system
✔ Interactive and unique UX

---

# 📌 Final Note

Hidden Chapters is not just a book recommendation system—
it is an **experience-driven platform** that blends storytelling, emotion, and AI to redefine how users discover books.
