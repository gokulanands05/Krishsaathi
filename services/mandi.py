# Mandi (wholesale) prices - data.gov.in API or fallback sample from government structure
# https://data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi

import os
import json
import urllib.request
import urllib.error

# data.gov.in: resource IDs for "Current daily price of various commodities from various markets (Mandi)"
# User can set DATA_GOV_IN_API_KEY after registering at data.gov.in
DATA_GOV_IN_BASE = "https://api.data.gov.in/resource"
# Fallback: representative mandi prices (structure mirrors government data; update periodically)
FALLBACK_MANDI = [
    {"commodity": "Rice", "market": "Delhi", "modal_price": 3200, "min_price": 3100, "max_price": 3350, "unit": "Quintal"},
    {"commodity": "Wheat", "market": "Delhi", "modal_price": 2400, "min_price": 2350, "max_price": 2480, "unit": "Quintal"},
    {"commodity": "Cotton", "market": "Gujarat", "modal_price": 6200, "min_price": 6000, "max_price": 6400, "unit": "Quintal"},
    {"commodity": "Soybean", "market": "Madhya Pradesh", "modal_price": 4200, "min_price": 4100, "max_price": 4350, "unit": "Quintal"},
    {"commodity": "Groundnut", "market": "Gujarat", "modal_price": 5800, "min_price": 5600, "max_price": 6000, "unit": "Quintal"},
    {"commodity": "Chickpea", "market": "Rajasthan", "modal_price": 5200, "min_price": 5000, "max_price": 5400, "unit": "Quintal"},
    {"commodity": "Sugarcane", "market": "Uttar Pradesh", "modal_price": 340, "min_price": 320, "max_price": 360, "unit": "Quintal"},
    {"commodity": "Maize", "market": "Karnataka", "modal_price": 2200, "min_price": 2100, "max_price": 2300, "unit": "Quintal"},
]


def fetch_mandi(api_key=None, limit=20):
    api_key = api_key or os.environ.get("DATA_GOV_IN_API_KEY", "").strip()
    if api_key:
        # data.gov.in format: resource id for mandi prices (example - replace with actual resource id from portal)
        resource_id = os.environ.get("DATA_GOV_IN_MANDI_RESOURCE_ID", "9ef84268-d583-4a30-b979-715d3eec5311")
        url = f"{DATA_GOV_IN_BASE}/{resource_id}?api-key={api_key}&format=json&limit={limit}"
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                raw = json.loads(resp.read().decode())
            # Normalize response; data.gov.in returns {"records": [...]} or similar
            records = raw.get("records") or raw.get("Records") or raw.get("data") or []
            if isinstance(records, list) and len(records) > 0:
                return {"prices": records[:limit], "source": "data.gov.in"}
        except (urllib.error.URLError, json.JSONDecodeError, OSError, KeyError):
            pass
    return {"prices": FALLBACK_MANDI, "source": "fallback"}
