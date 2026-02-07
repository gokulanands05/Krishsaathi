# Real-time weather via Open-Meteo (free, no API key)
# https://open-meteo.com/en/docs

import os
import urllib.request
import urllib.error
import json

OPEN_METEO_BASE = "https://api.open-meteo.com/v1"
DEFAULT_LAT = 28.6139   # Delhi
DEFAULT_LON = 77.2090


def _get_url(lat, lon):
    return (
        f"{OPEN_METEO_BASE}/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"
        "&timezone=Asia/Kolkata"
    )


def _wmo_code_to_label(code):
    # WMO Weather interpretation codes (0–99)
    if code is None:
        return "unknown"
    if code == 0:
        return "sunny"
    if code in (1, 2, 3):
        return "cloudy"
    if code in (61, 63, 65, 80, 81, 82):
        return "rainy"
    if code in (95, 96, 99):
        return "stormy"
    if code in (45, 48):
        return "cloudy"
    return "cloudy"


def fetch_weather(lat=None, lon=None):
    lat = float(lat or os.environ.get("WEATHER_LAT", DEFAULT_LAT))
    lon = float(lon or os.environ.get("WEATHER_LON", DEFAULT_LON))
    url = _get_url(lat, lon)
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError, OSError) as e:
        return {"error": str(e), "current": None, "daily": None}

    current = data.get("current") or {}
    daily = data.get("daily") or {}
    weather_code = current.get("weather_code")
    return {
        "current": {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation": current.get("precipitation"),
            "wind_speed": current.get("wind_speed_10m"),
            "weather_code": weather_code,
            "condition": _wmo_code_to_label(weather_code),
        },
        "daily": {
            "time": daily.get("time", [])[:3],
            "temperature_2m_max": daily.get("temperature_2m_max", [])[:3],
            "temperature_2m_min": daily.get("temperature_2m_min", [])[:3],
            "precipitation_sum": daily.get("precipitation_sum", [])[:3],
            "weather_code": daily.get("weather_code", [])[:3],
        },
        "lat": lat,
        "lon": lon,
    }
