from keybert import KeyBERT
from sentence_transformers import SentenceTransformer

# Load once (IMPORTANT: do NOT reload per request)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
kw_model = KeyBERT(model=embedding_model)


def extract_topic_from_text(text: str) -> str:
    if not text or not text.strip():
        return "Unknown"

    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 3),
        stop_words='english',
        top_n=3,              # fewer = faster
        use_mmr=True,
        diversity=0.7
    )

    if not keywords:
        return "Unknown"

    # keywords format: [('topic', score), ...]
    best_topic = keywords[0][0]

    return best_topic