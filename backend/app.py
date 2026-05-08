from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from googleapiclient.discovery import build
from textblob import TextBlob
from collections import Counter
from pymongo import MongoClient
from datetime import datetime

import cv2
import numpy as np
import requests
import bcrypt

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)

CORS(app)

# MongoDB Connection
client = MongoClient("mongodb+srv://abiway880:abiway123@cluster0.8qpkfjs.mongodb.net/trendtube_ai?retryWrites=true&w=majority")

db = client["trendtube_ai"]

search_collection = db["search_history"]

users_collection = db["users"]

# YouTube API
API_KEY = "AIzaSyAlkz-4qz9awlmAzH7R7UARQ-Dq4jS0tdo"

youtube = build(
    "youtube",
    "v3",
    developerKey=API_KEY
)

# Store latest analysis globally
latest_analysis = {}

@app.route("/")
def home():
    return "TrendTube AI Backend Running Successfully!"

# =========================
# SIGNUP API
# =========================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Check existing user
    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "message": "User already exists"
        })

    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Save user
    user_data = {
        "username": username,
        "email": email,
        "password": hashed_password
    }

    users_collection.insert_one(user_data)

    return jsonify({
        "message": "Signup successful"
    })

# =========================
# LOGIN API
# =========================

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "message": "User not found"
        })

    if bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):

        return jsonify({
            "message": "Login successful",
            "username": user["username"]
        })

    return jsonify({
        "message": "Invalid password"
    })

# =========================
# ANALYZE API
# =========================

@app.route("/analyze/<topic>")
def analyze(topic):

    global latest_analysis

    request_api = youtube.search().list(
        part="snippet",
        q=topic,
        type="video",
        maxResults=5
    )

    response = request_api.execute()

    videos = []
    all_words = []

    for item in response["items"]:

        title = item["snippet"]["title"]

        thumbnail = item["snippet"]["thumbnails"]["high"]["url"]

        # Trending Keyword Analyzer
        words = title.lower().split()

        for word in words:
            if len(word) > 3:
                all_words.append(word)

        # Sentiment Analysis
        analysis = TextBlob(title)

        polarity = analysis.sentiment.polarity

        if polarity > 0:
            sentiment = "Positive 😊"
        elif polarity < 0:
            sentiment = "Negative 😡"
        else:
            sentiment = "Neutral 😐"

        # Viral Score Prediction
        viral_score = 50

        viral_keywords = [
            "official",
            "latest",
            "new",
            "viral",
            "hit",
            "song",
            "trending"
        ]

        for word in viral_keywords:
            if word.lower() in title.lower():
                viral_score += 5

        if len(title) > 40:
            viral_score += 10

        if viral_score > 100:
            viral_score = 100

        # SEO Score Analyzer
        seo_score = 50

        seo_keywords = [
            "official",
            "new",
            "viral",
            "hit",
            "song",
            "trending",
            "2025",
            "2026",
            "top"
        ]

        for word in seo_keywords:
            if word.lower() in title.lower():
                seo_score += 5

        if any(char.isdigit() for char in title):
            seo_score += 10

        if title.isupper():
            seo_score += 10

        if len(title) > 20 and len(title) < 70:
            seo_score += 10

        if seo_score > 100:
            seo_score = 100

        # AI Thumbnail Analyzer
        image_response = requests.get(thumbnail)

        image_array = np.asarray(
            bytearray(image_response.content),
            dtype=np.uint8
        )

        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        brightness = np.mean(gray)

        sharpness = cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()

        thumbnail_score = 50

        if brightness > 80:
            thumbnail_score += 20

        if sharpness > 100:
            thumbnail_score += 20

        if thumbnail_score > 100:
            thumbnail_score = 100

        video = {
            "title": title,
            "channel": item["snippet"]["channelTitle"],
            "thumbnail": thumbnail,
            "viral_score": viral_score,
            "sentiment": sentiment,
            "seo_score": seo_score,
            "thumbnail_score": thumbnail_score
        }

        videos.append(video)

    # Trending Keywords
    keyword_counts = Counter(all_words)

    top_keywords = keyword_counts.most_common(5)

    trending_keywords = []

    for word, count in top_keywords:
        trending_keywords.append(word)

    # AI Title Generator
    generated_titles = [
        f"🔥 {topic.upper()} KING 👑 Official Viral Hit 2026",
        f"🔥 BEST {topic.upper()} Compilation 🎵 Trending Now",
        f"🔥 {topic.upper()} Anthem 💥 Must Watch Viral Video",
        f"🔥 TOP 10 {topic.upper()} Songs 🎶 2026 Edition",
        f"🔥 THE REAL {topic.upper()} EXPERIENCE 🚀"
    ]

    # Save Search History
    search_data = {
        "topic": topic,
        "date": datetime.now(),
        "generated_titles": generated_titles
    }

    search_collection.insert_one(search_data)

    # Fetch Recent Searches
    recent_searches = []

    history = search_collection.find().sort(
        "date",
        -1
    ).limit(5)

    for item in history:
        recent_searches.append(item["topic"])

    # Save latest analysis for PDF
    latest_analysis = {
        "topic": topic,
        "keywords": trending_keywords,
        "generated_titles": generated_titles,
        "videos": videos
    }

    return jsonify({
        "videos": videos,
        "keywords": trending_keywords,
        "generated_titles": generated_titles,
        "recent_searches": recent_searches
    })

# =========================
# PDF REPORT API
# =========================

@app.route("/download-report")
def download_report():

    global latest_analysis

    pdf_path = "trendtube_report.pdf"

    doc = SimpleDocTemplate(pdf_path)

    styles = getSampleStyleSheet()

    elements = []

    elements.append(
        Paragraph(
            "TrendTube AI Analytics Report",
            styles['Title']
        )
    )

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            f"Topic: {latest_analysis['topic']}",
            styles['Heading2']
        )
    )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            "Trending Keywords:",
            styles['Heading3']
        )
    )

    for keyword in latest_analysis["keywords"]:
        elements.append(
            Paragraph(f"#{keyword}", styles['BodyText'])
        )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            "AI Generated Titles:",
            styles['Heading3']
        )
    )

    for title in latest_analysis["generated_titles"]:
        elements.append(
            Paragraph(title, styles['BodyText'])
        )

    elements.append(Spacer(1, 15))

    elements.append(
        Paragraph(
            "Video Analytics:",
            styles['Heading3']
        )
    )

    for video in latest_analysis["videos"]:

        text = f"""
        <b>{video['title']}</b><br/>
        Viral Score: {video['viral_score']}%<br/>
        SEO Score: {video['seo_score']}/100<br/>
        Thumbnail Score: {video['thumbnail_score']}%<br/>
        Sentiment: {video['sentiment']}<br/><br/>
        """

        elements.append(
            Paragraph(text, styles['BodyText'])
        )

    doc.build(elements)

    return send_file(
        pdf_path,
        as_attachment=True
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)