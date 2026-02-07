# Server-side translation helpers for API responses and templates

import json
from pathlib import Path

from config import LANGUAGE_CODES, DEFAULT_LANGUAGE, LOCALES_DIR, TRANSLATION_MODULES

# In-memory cache: lang -> { module -> dict }
_translation_cache = {}

# Pest/disease names: English -> { lang -> local name }
PEST_TRANSLATIONS = {
    'Pink Bollworm': {
        'hi': 'गुलाबी सुंडी', 'bn': 'পিংক বলওয়ার্ম', 'te': 'పింక్ బాల్‌వార్మ్',
        'ta': 'இளஞ்சிவப்பு புழு', 'mr': 'गुलाबी सुंडी', 'gu': 'ગુલાબી સુંડી',
        'kn': 'ಪಿಂಕ್ ಬಾಲ್ವಾರ್ಮ್', 'or': 'ଗୋଲାପୀ ସୁଣ୍ଡି', 'ml': 'പിങ്ക് ബോൾവേം',
        'pa': 'ਗੁਲਾਬੀ ਸੁੰਡੀ', 'as': 'পিংক বলৱাৰ্ম', 'mai': 'गुलाबी सुंडी',
        'sat': 'Pink Bollworm', 'ks': 'गुलाबी सुंडी', 'en': 'Pink Bollworm',
    },
    'Whitefly': {
        'hi': 'सफेद मक्खी', 'bn': 'সাদা মাছি', 'te': 'తెల్ల ఈగ', 'ta': 'வெள்ளை ஈ',
        'mr': 'पांढरी माशी', 'gu': 'સફેદ માખી', 'kn': 'ಬಿಳಿ ನೊಣ',
        'or': 'ଧଳା ମାଛି', 'ml': 'വെളുത്ത ഈ', 'pa': 'ਚਿੱਟੀ ਮੱਖੀ',
        'as': 'বগা মাখি', 'mai': 'सफेद मक्खी', 'sat': 'Whitefly', 'ks': 'सफेद मक्खी', 'en': 'Whitefly',
    },
}

TREATMENT_TRANSLATIONS = {
    'Spray Neem Oil': {
        'hi': 'नीम का तेल छिड़कें', 'bn': 'নিম তেল স্প্রে করুন', 'te': 'వేప నూనె స్ప్రే చేయండి',
        'ta': 'வேப்ப எண்ணெய் தெளிக்கவும்', 'mr': 'कडुनिंब तेल स्प्रे करा', 'gu': 'લીમડાનું તેલ સ્પ્રે કરો',
        'kn': 'ಬೇವು ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ', 'or': 'ନିମ ତେଲ ସ୍ପ୍ରେ କରନ୍ତୁ', 'ml': 'വേപ്പ് എണ്ണ സ്പ്രേ ചെയ്യുക',
        'pa': 'ਨੀਮ ਦਾ ਤੇਲ ਸਪ੍ਰੇ ਕਰੋ', 'as': 'নিম তেল স্প্ৰে কৰক', 'mai': 'नीम का तेल छिड़कें',
        'sat': 'Spray Neem Oil', 'ks': 'नीम का तेल छिड़कें', 'en': 'Spray Neem Oil',
    },
}


def _load_module(lang: str, module: str) -> dict:
    if lang not in _translation_cache:
        _translation_cache[lang] = {}
    if module in _translation_cache[lang]:
        return _translation_cache[lang][module]
    path = LOCALES_DIR / lang / f'{module}.json'
    out = {}
    if path.is_file():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                out = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    _translation_cache[lang][module] = out
    return out


def get_translation(lang: str, module: str, key: str, **interpolations) -> str:
    """Get translation for key (dot-separated) with optional {name} interpolation."""
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    data = _load_module(lang, module)
    if not data:
        data = _load_module(DEFAULT_LANGUAGE, module)
    keys = key.split('.')
    value = data
    for k in keys:
        value = (value or {}).get(k)
        if value is None:
            return key
    if not isinstance(value, str):
        return key
    for k, v in interpolations.items():
        value = value.replace('{' + k + '}', str(v))
    return value


def get_chatbot_template(lang: str, template_key: str, **kwargs) -> str:
    """Get chatbot response template in given language."""
    return get_translation(lang, 'chatbot', template_key, **kwargs)


def translate_pest(english_name: str, lang: str) -> str:
    return PEST_TRANSLATIONS.get(english_name, {}).get(lang, english_name)


def translate_treatment(english_name: str, lang: str) -> str:
    return TREATMENT_TRANSLATIONS.get(english_name, {}).get(lang, english_name)


# Mandi commodity name -> common.crops key
CROP_KEY_MAP = {
    "Rice": "paddy", "Wheat": "wheat", "Cotton": "cotton", "Soybean": "soybean",
    "Groundnut": "groundnut", "Chickpea": "chickpea", "Sugarcane": "sugarcane", "Maize": "maize",
}


def translate_crop(commodity_english: str, lang: str) -> str:
    key = CROP_KEY_MAP.get(commodity_english)
    if key:
        return get_translation(lang, "common", "crops." + key)
    return commodity_english
