import json
import os

# Get current file directory (subject_info.py location)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build full path to JSON
json_path = os.path.join(BASE_DIR, "arxiv_mapping.json")

with open(json_path, "r") as f:
    ARXIV_MAPPING = json.load(f)


def get_subject_info(code: str):
    code = code.strip()

    if code in ARXIV_MAPPING:
        return ARXIV_MAPPING[code]

    if code.startswith("cs."):
        domain = "Computer Science"
    elif code.startswith("math."):
        domain = "Mathematics"
    elif code.startswith("physics.") or code in ["quant-ph", "gr-qc", "hep-th", "hep-ph", "hep-ex"]:
        domain = "Physics"
    elif code.startswith("q-bio"):
        domain = "Quantitative Biology"
    elif code.startswith("q-fin"):
        domain = "Quantitative Finance"
    elif code.startswith("stat."):
        domain = "Statistics"
    elif code.startswith("econ"):
        domain = "Economics"
    elif code.startswith("eess"):
        domain = "Electrical Engineering"
    else:
        domain = "Unknown"

    return {
        "domain": domain,
        "category": "Unknown",
        "subject": "Unknown"
    }