from flask import Flask, jsonify, send_from_directory, request, session
from flask_cors import CORS
import json
import os
import bcrypt
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import mysql.connector
import pandas as pd
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from mood_detector import detect_mood

load_dotenv()
app_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=app_dir)
app.config['JSON_AS_ASCII'] = False

# ✅ FIX 1: Secret key required for session to work
app.secret_key = os.getenv('SECRET_KEY', 'hidden-chapters-secret-2024')

# ✅ FIX: Cookie settings for cross-port localhost (Flask:5000 ↔ LiveServer:5501)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE']   = False   # http://localhost, not https
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_PATH']     = '/'     # ensure cookie covers all API paths

# ✅ FIX 2: CORS must allow credentials + specify the frontend origin
CORS(app, supports_credentials=True, origins=[
    'http://127.0.0.1:5501', 'http://localhost:5501',
    'http://127.0.0.1:5500', 'http://localhost:5500'
])

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

rec_df = pd.DataFrame(columns=['id','title','teaser','genre','author','moods'])
tfidf_vectorizer = None
tfidf_matrix = None
cosine_sim = None

def load_recommendation_data():
    global rec_df, tfidf_vectorizer, tfidf_matrix, cosine_sim
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, author, genre, teaser, moods FROM v_books_with_moods")
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

def recommend_by_mood(user_moods):
    global rec_df, tfidf_vectorizer, tfidf_matrix

    if rec_df.empty or tfidf_matrix is None:
        return []

    filtered = rec_df[
        rec_df['moods'].str.lower().apply(
            lambda x: any(m in x.split(',') for m in user_moods)
        )
    ]

    if filtered.empty:
        return []

    query = " ".join(user_moods)
    query_vec = tfidf_vectorizer.transform([query])
    sim_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
    filtered_indices = filtered.index.tolist()
    ranked = sorted(filtered_indices, key=lambda i: sim_scores[i], reverse=True)

    top_books = rec_df.iloc[ranked[:3]][
        ['id', 'title', 'author', 'teaser', 'genre', 'moods']
    ].to_dict('records')

    return top_books


# ─────────────────────────────────────────────
# STATIC ROUTES — serve frontend from Flask so
# frontend + API share origin (127.0.0.1:5000).
# Session cookies then work without cross-origin issues.
# Open the app at: http://127.0.0.1:5000
# ─────────────────────────────────────────────

@app.route('/')
def home():
    return send_from_directory(app_dir, 'index.html')

@app.route('/onboarding.html')
def onboarding():
    return send_from_directory(app_dir, 'onboarding.html')

@app.route('/index.html')
def index_html():
    return send_from_directory(app_dir, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app_dir, filename)


# ─────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data     = request.json
    username = data.get('username', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Check if user is new (they just registered, so yes)
        session['user_id']  = user_id
        session['username'] = username
        session['is_new']   = True

        cursor.close(); conn.close()
        return jsonify({'message': 'Account created', 'username': username, 'is_new_user': True}), 201

    except mysql.connector.IntegrityError as e:
        if 'username' in str(e):
            return jsonify({'error': 'Username already taken'}), 409
        return jsonify({'error': 'Email already registered'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.json
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close(); conn.close()

        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        if not bcrypt.checkpw(password.encode(), user['password_hash'].encode()):
            return jsonify({'error': 'Invalid email or password'}), 401

        session['user_id']  = user['id']
        session['username'] = user['username']
        session['is_new']   = bool(user.get('is_new_user', False))

        return jsonify({
            'message': 'Logged in',
            'user_id': user['id'],
            'username': user['username'],
            'is_new_user': bool(user.get('is_new_user', False))
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


@app.route('/api/auth/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'user': None})
    return jsonify({
        'user': {
            'id':       session['user_id'],
            'username': session['username'],
            'is_new':   session.get('is_new', False)
        }
    })


@app.route('/api/auth/preferences', methods=['POST'])
def save_preferences():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    data   = request.json
    moods  = data.get('moods', [])
    genres = data.get('genres', [])
    user_id = session['user_id']

    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Clear old preferences
        cursor.execute("DELETE FROM user_preferences WHERE user_id = %s", (user_id,))

        # Insert new ones
        for mood in moods:
            cursor.execute(
                "INSERT IGNORE INTO user_preferences (user_id, pref_type, pref_value) VALUES (%s, 'mood', %s)",
                (user_id, mood)
            )
        for genre in genres:
            cursor.execute(
                "INSERT IGNORE INTO user_preferences (user_id, pref_type, pref_value) VALUES (%s, 'genre', %s)",
                (user_id, genre)
            )

        # Mark user as no longer new
        cursor.execute("UPDATE users SET is_new_user = FALSE WHERE id = %s", (user_id,))
        session['is_new'] = False

        conn.commit()
        cursor.close(); conn.close()
        return jsonify({'message': 'Preferences saved'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────
# BOOK ROUTES
# ─────────────────────────────────────────────

@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM v_books_with_moods")
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
    http_request = Request(url, data=request_body, headers={'Content-Type': 'application/json'}, method='POST')

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


@app.route('/api/mood/detect', methods=['POST'])
def detect_mood_api():
    data = request.json
    user_text = data.get('text', '').strip()

    if not user_text:
        return jsonify({'error': 'No text provided'}), 400

    result = detect_mood(user_text, top_k=3)

    if 'error' in result and not result.get('moods'):
        return jsonify({'error': result['error']}), 422

    moods = result.get('moods', [])
    recommended_books = recommend_by_mood(moods)

    return jsonify({
        'moods': moods,
        'explanation': result.get('explanation', ''),
        'books': recommended_books
    })


# ─────────────────────────────────────────────
# BOOKSHELF ROUTES
# ─────────────────────────────────────────────

@app.route('/api/bookshelf/add', methods=['POST'])
def add_to_bookshelf():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    data    = request.json
    book_id = data.get('book_id')
    user_id = session['user_id']

    if not book_id:
        return jsonify({'error': 'book_id required'}), 400

    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO bookshelf (user_id, book_id) VALUES (%s, %s)",
            (user_id, book_id)
        )
        conn.commit()
        cursor.close(); conn.close()
        return jsonify({'message': 'Added to library'}), 201

    except mysql.connector.IntegrityError:
        return jsonify({'message': 'Already in library'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bookshelf', methods=['GET'])
def get_bookshelf():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.id, b.title, b.author, b.genre, b.teaser,
                   b.buyLink, b.downloadLink, bs.saved_at,
                   GROUP_CONCAT(m.name ORDER BY m.name SEPARATOR ',') AS moods
            FROM bookshelf bs
            JOIN books b           ON b.id  = bs.book_id
            LEFT JOIN book_moods bm ON b.id  = bm.book_id
            LEFT JOIN moods m       ON m.id  = bm.mood_id
            WHERE bs.user_id = %s
            GROUP BY b.id, b.title, b.author, b.genre,
                     b.teaser, b.buyLink, b.downloadLink, bs.saved_at
            ORDER BY bs.saved_at DESC
        """, (session['user_id'],))
        books = cursor.fetchall()
        cursor.close(); conn.close()
        for book in books:
            if book.get('saved_at'):
                book['saved_at'] = str(book['saved_at'])
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bookshelf/remove/<int:book_id>', methods=['DELETE'])
def remove_from_bookshelf(book_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    try:
        conn   = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM bookshelf WHERE user_id = %s AND book_id = %s",
            (session['user_id'], book_id)
        )
        conn.commit()
        cursor.close(); conn.close()
        return jsonify({'message': 'Removed from library'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    load_recommendation_data()
    app.run(debug=True, port=5000)