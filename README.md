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

### 🟢 Version 2 — Full Stack Mood-Based System (Current)

- Backend powered by **Flask + MySQL**
- Uses a **carefully curated dataset of high-quality books**
- Introduces **multi-mood tagging system**:
  - Each book is tagged with multiple emotional states
  - Enables more accurate and meaningful recommendations
- Dynamic data flow:

```text
Frontend → Flask API → MySQL → Mood Matching → Frontend
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
Each book contains:
- Title
- Author
- Genre
- Teaser
- Multiple moods

Eliminates noisy or low-quality data.

### 📝 Community Story Chain
- Users contribute to a shared story
- AI (Google Gemini) generates the next line

### 📤 Share Discoveries
- One-click copy-to-clipboard sharing

### 💎 Book of the Day
- Daily rotating recommendation

### 💾 Persistent Story Storage
- Uses LocalStorage to maintain story progress

---

## 🧠 Recommendation Logic

Instead of heavy ML models, the system uses:

- Frontend mood-based filtering from the `moods` field
- Backend text similarity using **TF-IDF + cosine similarity**
- Mood tags included in the recommendation content so similar books feel more aligned
- Randomized selection within relevant results

This approach ensures:

- 👉 Better control over quality
- 👉 More meaningful user experience
- 👉 Faster performance

### How recommendations work

1. The frontend loads all books from the Flask API.
2. When a user selects a mood, the app filters books whose `moods` field contains that mood.
3. When a book is opened in the blind-date modal, Flask returns the top similar books using the book's teaser, genre, author, and moods.
4. The interface displays those suggestions in the **More Like This** panel.

---

## 🗃️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Flask (Python) |
| **Database** | MySQL |
| **Data Handling** | Pandas (for preprocessing) |
| **APIs** | Google Gemini API, Web Clipboard API |

---

## 🛠️ Setup Instructions

### 1️⃣ Database Setup

1. Install MySQL
2. Create the database:

```sql
CREATE DATABASE hidden_chapters;
```

3. Import your dataset (`books.csv`) into the `books` table

### 2️⃣ Backend Setup

Install dependencies:

```bash
pip install flask flask-cors mysql-connector-python pandas
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
2. Open `script.js`
3. Add the following:

```javascript
const API_KEY = "YOUR_API_KEY";
```

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