# Combined advisory from weather + soil (for "Today's Advisory" card)

from services.weather import fetch_weather
from services.soil import get_soil_advisory
from translations import get_translation


def get_advisory(lang, lat=None, lon=None, state=None):
    weather = fetch_weather(lat=lat, lon=lon)
    soil = get_soil_advisory(state=state, lang=lang)
    parts = []
    if weather.get("current"):
        cur = weather["current"]
        cond = cur.get("condition") or "sunny"
        cond_label = get_translation(lang, "common", f"weather.conditions.{cond}")
        temp = cur.get("temperature")
        if temp is not None:
            parts.append(f"{cond_label}, {temp:.0f}°C.")
        else:
            parts.append(cond_label + ".")
    parts.append(soil.get("summary", ""))
    return {
        "text": " ".join(parts),
        "soil_tip": soil.get("npk_tip"),
        "weather": weather.get("current"),
    }
