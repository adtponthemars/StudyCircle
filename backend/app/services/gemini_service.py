import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-3-flash-preview")

def analyze_with_gemini(text: str):
    prompt = f"""
You are an AI system that analyzes study material.

Return ONLY valid JSON. No explanation. No markdown.

Schema:
{{
  "summary": "short paragraph",
  "topics": ["topic1", "topic2"],
  "tags": ["keyword1", "keyword2"],
  "difficulty": "Easy | Medium | Hard",
  "content_type": "Notes | Questions | Theory | Mixed",
  "suggested_title": "clear academic title",
  "suggested_description": "1-2 line description",
  "key_concepts": ["concept1", "concept2"],
  "questions": [
    {{
      "question": "",
      "answer": ""
    }}
  ]
}}

Text:
{text[:12000]}
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Clean common Gemini issues
        raw = raw.replace("```json", "").replace("```", "").strip()

        data = json.loads(raw)
        return data

    except Exception as e:
        print("Gemini error:", e)
        print("Raw response:", raw if 'raw' in locals() else "No response")
        return None