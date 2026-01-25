from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app) # Enables cross-origin requests

# --- DATABASE CONFIGURATION ---
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Richa@23aug', 
    'database': 'hidden_chapters'
}

# --- ROUTE 1: FETCH ALL BOOKS (Required for the homepage) ---
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM books")
        books = cursor.fetchall()
        
        cursor.close()
        conn.close()
        # Send the raw data; let JavaScript handle the formatting
        return jsonify(books) 
    except Exception as e:
        print(f"Error: {e}") # This helps you see errors in your terminal
        return jsonify({"error": str(e)}), 500

# --- ROUTE 2: AI RECOMMENDATIONS ---
@app.route('/api/recommend/<int:book_id>', methods=['GET'])
def recommend_books(book_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, teaser FROM books")
        all_books = cursor.fetchall()
        conn.close()
        
        df = pd.DataFrame(all_books)

        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df['teaser'])

        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        idx = df.index[df['id'] == book_id].tolist()[0]

        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        recommend_indices = [i[0] for i in sim_scores[1:4]]

        recommendations = df.iloc[recommend_indices][['id', 'title']].to_dict('records')
        return jsonify(recommendations)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- START THE SERVER (Crucial for the "Running on..." output) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)