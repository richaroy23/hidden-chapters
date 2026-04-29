import nltk
nltk.download('vader_lexicon')

from nltk.sentiment import SentimentIntensityAnalyzer

sia = SentimentIntensityAnalyzer()

VALID_MOODS = [
    'adventurous', 'romantic', 'mysterious', 'suspenseful', 'humorous',
    'hopeful', 'heartbreaking', 'inspiring', 'thought-provoking', 'sci-fi',
    'scary', 'dark romance', 'sexy', 'bl romance', 'gl romance',
    'drama', 'tragedy', 'fantasy'
]

# 🔹 Multi-word phrases (HIGH PRIORITY)
PHRASE_MOODS = {
    # Romance variants
    "dark love": "dark romance",
    "toxic love": "dark romance",
    "forbidden love": "dark romance",
    "passionate affair": "sexy",

    # LGBTQ+
    "boy love": "bl romance",
    "boys love": "bl romance",
    "girl love": "gl romance",
    "girls love": "gl romance",

    # Genre-specific
    "space travel": "sci-fi",
    "time travel": "sci-fi",
    "haunted house": "scary",
    "ghost story": "scary",
    "murder mystery": "mysterious",
    "crime investigation": "mysterious",

    # Emotional tones
    "deep thoughts": "thought-provoking",
    "life meaning": "thought-provoking",
    "emotional pain": "heartbreaking",
    "tragic ending": "tragedy"
}

# 🔹 Single-word keywords
MOOD_KEYWORDS = {

    "adventurous": [
        "adventure", "explore", "journey", "quest", "travel", "expedition"
    ],

    "romantic": [
        "love", "romance", "crush", "dating", "relationship", "affection"
    ],

    "mysterious": [
        "mystery", "secret", "unknown", "clue", "detective", "investigation"
    ],

    "suspenseful": [
        "thrill", "suspense", "tense", "danger", "chase", "escape"
    ],

    "humorous": [
        "funny", "laugh", "comedy", "joke", "hilarious", "amusing"
    ],

    "hopeful": [
        "hope", "positive", "bright", "optimistic", "better", "future", "dream", "aspire", "overcome", "resilience", "courage", "perseverance", "empower", "uplift", "encourage", "ambition", "determination", "passion", "vision", "leadership", "innovation", "creativity", "breakthrough", "achievement"
    ],

    "heartbreaking": [
        "sad", "cry", "pain", "loss", "grief", "broken", "hurt", "devastated", "tragic", "sorrow", "melancholy", "heartache", "despair", "lonely", "abandoned", "betrayal", "unrequited", "suffering", "misery", "anguish", "woe", "desolation", "mourning", "lament", "bereavement"
    ],

    "inspiring": [
        "inspire", "motivate", "success", "achieve", "dream", "goal", "overcome", "triumph", "resilience", "courage", "perseverance", "hope", "aspire", "empower", "uplift", "encourage", "ambition", "determination", "passion", "vision", "leadership", "innovation", "creativity", "breakthrough", "achievement"
    ],

    "thought-provoking": [
        "deep", "meaning", "philosophy", "question", "reflect", "existence", "life", "purpose", "society", "human nature", "ethics", "morality", "consciousness", "identity", "reality", "knowledge", "truth", "wisdom", "intellect", "reason", "logic", "mind", "thought", "idea"
    ],

    "sci-fi": [
        "space", "future", "technology", "alien", "robot", "galaxy", "time", "cyber", "dystopia", "utopia", "sci-fi", "science fiction"
    ],

    "scary": [
        "fear", "horror", "terror", "ghost", "haunted", "nightmare", "monster", "zombie", "vampire", "werewolf", "witch", "demon", "supernatural", "paranormal", "creepy", "spooky"
    ],

    "dark romance": [
        "obsession", "toxic", "dark", "possessive", "dangerous love", "forbidden", "taboo", "intense romance", "unhealthy relationship", "destructive love", "dark passion", "twisted love", "toxic relationship", "dark desire"
    ],

    "sexy": [
        "passion", "desire", "intimate", "sensual", "attraction", "seduction", "steamy", "affair", "flirt", "flirting", "flirty", "flirtatious", "romantic tension", "sexual tension", "chemistry"
    ],

    "bl romance": [
        "male couple", "two boys", "gay romance"
    ],

    "gl romance": [
        "female couple", "two girls", "lesbian romance"
    ],

    "drama": [
        "conflict", "emotion", "family", "relationship issues", "life struggle", "betrayal", "redemption", "growth", "intense", "emotional", "character-driven", "interpersonal", "family saga", "coming of age"
    ],

    "tragedy": [
        "death", "tragic", "loss", "fate", "doomed", "sacrifice", "heartbreak", "devastation", "catastrophe", "misfortune", "ruin", "calamity", "disaster", "meltdown", "collapse", "downfall"
    ],

    "fantasy": [
        "magic", "dragon", "kingdom", "sword", "myth", "legend", "fairy", "witch", "wizard", "supernatural", "mythical", "enchantment", "sorcery", "fantastical", "otherworldly", "epic quest", "heroic journey"
    ]
}

def detect_mood(user_text: str, top_k: int = 3):
    text = user_text.lower()

    # 🔹 Step 1: Sentiment analysis
    score = sia.polarity_scores(text)
    compound = score['compound']

    # 🔥 Step 2: INTENSITY MAPPING (improved)
    if compound >= 0.75:
        base_mood = "inspiring"
    elif compound >= 0.3:
        base_mood = "hopeful"
    elif compound <= -0.75:
        base_mood = "tragedy"
    elif compound <= -0.3:
        base_mood = "heartbreaking"
    else:
        base_mood = "thought-provoking"

    detected = [base_mood]

    # 🔥 Step 3: Multi-word phrase detection (priority)
    for phrase, mood in PHRASE_MOODS.items():
        if phrase in text:
            detected.append(mood)

    # 🔹 Step 4: Keyword detection
    for mood, keywords in MOOD_KEYWORDS.items():
        if any(word in text for word in keywords):
            detected.append(mood)

    # 🔹 Step 5: Clean up
    detected = list(dict.fromkeys(detected))[:top_k]

    return {
        "moods": detected,
        "explanation": (
            f"Sentiment score: {compound:.2f} → {base_mood}. "
            f"Detected themes: {', '.join(detected)}"
        )
    }