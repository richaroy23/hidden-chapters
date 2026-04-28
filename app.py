from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=app_dir)
CORS(app)  # Enables cross-origin requests

# --- DATABASE CONFIGURATION ---
# Recommendation data (computed once at startup)
rec_df = pd.DataFrame(columns=['id', 'title', 'teaser', 'genre', 'author'])
tfidf_vectorizer = None
tfidf_matrix = None
cosine_sim = None


def load_recommendation_data():
    global rec_df, tfidf_vectorizer, tfidf_matrix, cosine_sim
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, teaser, genre, author FROM books")
        all_books = cursor.fetchall()
        cursor.close()
        conn.close()

        rec_df = pd.DataFrame(all_books)
        if rec_df.empty:
            rec_df = pd.DataFrame(columns=['id', 'title', 'teaser', 'genre', 'author', 'content'])
            cosine_sim = None
            return

        rec_df.fillna('', inplace=True)
        rec_df['id'] = rec_df['id'].astype(int)
        rec_df['content'] = rec_df['teaser'] + ' ' + rec_df['genre'] + ' ' + rec_df['author']

        tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf_vectorizer.fit_transform(rec_df['content'])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        print(f"Recommendation data loaded: {len(rec_df)} books")

    except Exception as e:
        print('REC LOAD ERROR:', e)
        rec_df = pd.DataFrame(columns=['id', 'title', 'teaser', 'genre', 'author', 'content'])
        cosine_sim = None

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Richa@23aug', 
    'database': 'hidden_chapters'
}

# --- ROOT ROUTE ---
@app.route('/')
def home():
    return send_from_directory(app_dir, 'index.html')

# --- ROUTE 1: FETCH ALL BOOKS (Required for the homepage) ---
@app.route('/api/books', methods=['GET'])
def get_books():
    print("➡️ /api/books endpoint called")   # DEBUG LINE

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM books LIMIT 10")
        books = cursor.fetchall()

        print("✅ Data fetched:", len(books))

        cursor.close()
        conn.close()

        return jsonify(books)

    except Exception as e:
        print("🔥 ERROR OCCURRED:")
        print(e)
        return jsonify({"error": str(e)}), 500
# --- ROUTE 2: AI RECOMMENDATIONS ---
@app.route('/api/recommend/<int:book_id>', methods=['GET'])
def recommend_books(book_id):
    try:
        global rec_df, cosine_sim
        if cosine_sim is None or rec_df.empty:
            return jsonify({"error": "recommendation data not available"}), 500

        matches = rec_df.index[rec_df['id'] == book_id].tolist()
        if not matches:
            return jsonify({"error": "book id not found"}), 404

        idx = matches[0]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        recommend_indices = [i[0] for i in sim_scores[1:4]]

        recommendations = rec_df.iloc[recommend_indices][['id', 'title']].to_dict('records')
        return jsonify(recommendations)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- START THE SERVER ---
if __name__ == '__main__':
    load_recommendation_data()
    app.run(debug=True, port=5000)