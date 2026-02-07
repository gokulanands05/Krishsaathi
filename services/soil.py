# Soil / NDVI info - government open data (Bhuvan/NRSC, data.gov.in) or advisory text
# https://data.gov.in/resource/oceansat-2ocm-ndvi-india-coverage

import os

# Optional: fetch NDVI or soil health summary from an API. For now return advisory-style summary
# that can be driven by state/district when we have location.
SOIL_ADVISORY_BY_REGION = {
    "default": {
        "summary_en": "Get your Soil Health Card from the nearest soil testing lab. Use recommended NPK to improve yield.",
        "summary_hi": "नजदीकी मृदा परीक्षण प्रयोगशाला से मृदा स्वास्थ्य कार्ड बनवाएं। उपज बढ़ाने के लिए अनुशंसित NPK का उपयोग करें।",
        "npk_tip_en": "Balance N-P-K based on soil test. Avoid excess urea; use neem-coated urea where advised.",
        "npk_tip_hi": "मृदा परीक्षण के आधार पर N-P-K संतुलन। अधिक यूरिया से बचें; जहां सलाह हो वहां नीम-लेपित यूरिया उपयोग करें।",
    },
}


def get_soil_advisory(state=None, district=None, lang="en"):
    key = (state or "").strip() or "default"
    region = SOIL_ADVISORY_BY_REGION.get(key) or SOIL_ADVISORY_BY_REGION["default"]
    summary = region.get(f"summary_{lang}") or region.get("summary_hi") or region["summary_en"]
    npk_tip = region.get(f"npk_tip_{lang}") or region.get("npk_tip_hi") or region["npk_tip_en"]
    return {
        "summary": summary,
        "npk_tip": npk_tip,
        "soil_health_card_link": "https://soilhealth.dac.gov.in",
    }
