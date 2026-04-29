from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import mysql.connector
import pandas as pd
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()  # This loads the .env file
app_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=app_dir)
app.config['JSON_AS_ASCII'] = False
CORS(app)

# ✅ STEP 1: db_config comes FIRST now
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# ✅ STEP 2: Now the function can safely use db_config
rec_df = pd.DataFrame(columns=['id','title','teaser','genre','author','moods'])
tfidf_vectorizer = None
tfidf_matrix = None
cosine_sim = None

def load_recommendation_data():
    global rec_df, tfidf_vectorizer, tfidf_matrix, cosine_sim
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, author, genre, teaser, moods FROM books")
        all_books = cursor.fetchall()
        cursor.close()
        conn.close()

        rec_df = pd.DataFrame(all_books)
        if rec_df.empty:
            cosine_sim = None
            return

        rec_df.fillna('', inplace=True)
        rec_df['id'] = rec_df['id'].astype(int)

        moods_text = rec_df['moods'].astype(str).str.replace(',', ' ', regex=False)
        rec_df['content'] = (
            rec_df['teaser'] + ' ' +
            rec_df['genre'] + ' ' +
            rec_df['author'] + ' ' +
            moods_text + ' ' +
            moods_text
        )

        tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf_vectorizer.fit_transform(rec_df['content'])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        print(f"Recommendation data loaded: {len(rec_df)} books")

    except Exception as e:
        print('REC LOAD ERROR:', e)
        cosine_sim = None

# ✅ STEP 3: Routes come after
@app.route('/')
def home():
    return send_from_directory(app_dir, 'index.html')

@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM books")   # ✅ No LIMIT
        books = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        recommendations = rec_df.iloc[recommend_indices][['id','title']].to_dict('records')
        return jsonify(recommendations)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/story/continue', methods=['POST'])
def ai_continue_story():
    api_key = os.getenv('GEMINI_API_KEY')
    model_name = os.getenv('GEMINI_MODEL', 'gemini-flash-latest')
    data = request.json
    story = data.get('story', '')

    if not api_key:
        return jsonify({'error': 'GEMINI_API_KEY is not set'}), 500

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": f"Continue this story with one sentence:\n{story}\nNext line:"}]
        }]
    }

    request_body = json.dumps(payload).encode('utf-8')
    http_request = Request(
        url,
        data=request_body,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )

    try:
        with urlopen(http_request, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
    except HTTPError as error:
        try:
            error_body = error.read().decode('utf-8')
        except Exception:
            error_body = ''
        message = f'Gemini request failed: {error.reason}'
        if error_body:
            message = f'{message} | {error_body}'
        return jsonify({'error': message}), error.code
    except URLError as error:
        return jsonify({'error': f'Gemini request failed: {error.reason}'}), 502

    try:
        text = result['candidates'][0]['content']['parts'][0]['text']
    except (KeyError, IndexError, TypeError):
        return jsonify({'error': 'Unexpected Gemini response format'}), 502

    return jsonify({'line': text})

if __name__ == '__main__':
    load_recommendation_data()
    app.run(debug=True, port=5000)