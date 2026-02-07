# Rule-based chatbot: weather, mandi, schemes, soil, pest tips

from services.weather import fetch_weather
from services.mandi import fetch_mandi
from services.schemes import get_schemes
from services.soil import get_soil_advisory
from translations import get_translation, translate_crop


def _normalize(msg):
    return (msg or "").strip().lower()


def _matches(msg, *keywords):
    m = _normalize(msg)
    return any(k in m for k in keywords)


def get_chatbot_reply(message: str, lang: str) -> str:
    msg = _normalize(message)
    if not msg:
        return get_translation(lang, "chatbot", "default_reply")

    # Greeting / help
    if _matches(msg, "hi", "hello", "namaste", "hey", "help", "start", "kaise", "कैसे", "नमस्ते"):
        return get_translation(lang, "chatbot", "help_prompt")

    # Weather
    if _matches(msg, "weather", "mausam", "मौसम", "तापमान", "temperature", "barish", "बारिश", "rain"):
        data = fetch_weather()
        prefix = get_translation(lang, "chatbot", "weather_reply")
        if data.get("error"):
            return prefix + get_translation(lang, "common", "messages.error")
        cur = data.get("current") or {}
        temp = cur.get("temperature")
        cond = cur.get("condition")
        cond_label = get_translation(lang, "common", f"weather.conditions.{cond}") if cond else ""
        parts = []
        if cond_label:
            parts.append(cond_label)
        if temp is not None:
            parts.append(f"{round(temp)}°C")
        if cur.get("humidity") is not None:
            parts.append(f"{cur['humidity']}% " + get_translation(lang, "common", "weather.humidity"))
        return prefix + (", ".join(parts) if parts else get_translation(lang, "common", "messages.no_data"))

    # Mandi / prices
    if _matches(msg, "mandi", "bhav", "भाव", "price", "कीमत", "market", "मंडी"):
        out = fetch_mandi(limit=5)
        prefix = get_translation(lang, "chatbot", "mandi_reply")
        prices = out.get("prices") or []
        if not prices:
            return prefix + get_translation(lang, "common", "messages.no_data")
        lines = []
        for p in prices[:5]:
            name = translate_crop(p.get("commodity", ""), lang) or p.get("commodity", "")
            modal = p.get("modal_price")
            if modal is not None:
                lines.append(f"{name}: ₹{int(modal):,}/q")
        return prefix + ("; ".join(lines) if lines else get_translation(lang, "common", "messages.no_data"))

    # Schemes
    if _matches(msg, "scheme", "yojana", "योजना", "pm kisan", "kcc", "bima", "बीमा", "insurance"):
        schemes = get_schemes(lang=lang)
        return get_translation(lang, "chatbot", "schemes_reply")

    # Soil
    if _matches(msg, "soil", "mitti", "मिट्टी", "मृदा", "soil health", "npk"):
        data = get_soil_advisory(lang=lang)
        prefix = get_translation(lang, "chatbot", "soil_reply")
        summary = (data or {}).get("summary", "")
        return prefix + (summary or get_translation(lang, "common", "messages.no_data"))

    # Pest / crop
    if _matches(msg, "pest", "keet", "कीट", "disease", "रोग", "crop", "fasal", "फसल", "photo", "फोटो"):
        return get_translation(lang, "chatbot", "pest_tip")

    return get_translation(lang, "chatbot", "default_reply")
