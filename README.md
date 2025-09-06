# 📖 Hidden Chapters

**Hidden Chapters** is a mood-based **blind date with a book** platform.  
It helps readers discover books in a playful way: choose a mood → get a mysterious teaser → reveal the hidden book.  
Users can also co-create stories together through a **Community Story Chain**.

---

## ✨ Features
- 🎭 **Mood-based discovery** → Pick from over 15 moods and get a surprise book recommendation that matches your feelings.
- 🎁 **Interactive Blind Reveal:** Books are presented as wrapped gifts. Read a mysterious teaser before revealing the title and cover with a satisfying card-flip animation.
- 🔍 **Genre Filtering** → Fine-tune your 'Blind Date' experience by filtering the mystery books by genre.
- 📝 **Collaborative Story Chain:** Join a community story! Add a line, get an AI-powered continuation, and share the complete story with a one-click "copy to clipboard" button.  
- 🔗 **Get the Book** → Provides a direct link to buy the book, with a separate download option for public-domain titles.
- 📤 **Share Your Discoveries** → Easily share a specific book you've unwrapped with a pre-formatted message copied to your clipboard.
- 💎 **Book of the Day:** A new "hidden gem" is featured every day to encourage repeat visits.
- 💾 **Persistent Story:** The community story is saved in your browser using Local Storage, so it's always there when you come back.   

---

## 🚀 Live Demo
👉 [Hidden Chapters on GitHub Pages](https://richaroy23.github.io/hidden-chapters/)  

---

## 📂 Tech Stack
- **Frontend**: HTML, CSS, JavaScript  
- **Data:** Book data is managed via an external `books.json` file and loaded asynchronously.
- **APIs:** Google Gemini API for AI-powered story continuation, Web Clipboard API for sharing.
- **Deployment**: GitHub Pages  

---

## 🔮 Future Scope
- User accounts & story uploads  
- Ratings, reviews, favorites  
- Marketplace for premium books (with payments)  
- Mobile app version  

---

## 🛠️ Setup Instructions
1. Clone the repo or Unzip the folder  
2. Open `index.html` in your browser
---

## ⚠️ Important: API Key Setup

The Community Story Chain uses the Google Gemini API to generate AI-powered continuations. To enable this feature, you must get your own free API key from Google AI Studio.

1.  Obtain your API key from [Google AI Studio](https://aistudio.google.com/).
2.  Open the `script.js` file.
3.  Find the line `const API_KEY = "";`.
4.  Paste your secret API key inside the quotes.
