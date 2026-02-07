# KrishiNirnay AI - Configuration
# Enterprise-grade agricultural intelligence platform

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Supported languages (15 major Indian languages + English)
# ISO 639-1 codes, native name, script
SUPPORTED_LANGUAGES = [
    ('hi', 'हिंदी', 'Hindi', 'Devanagari'),
    ('bn', 'বাংলা', 'Bengali', 'Bengali'),
    ('te', 'తెలుగు', 'Telugu', 'Telugu'),
    ('mr', 'मराठी', 'Marathi', 'Devanagari'),
    ('ta', 'தமிழ்', 'Tamil', 'Tamil'),
    ('gu', 'ગુજરાતી', 'Gujarati', 'Gujarati'),
    ('kn', 'ಕನ್ನಡ', 'Kannada', 'Kannada'),
    ('or', 'ଓଡ଼ିଆ', 'Odia', 'Odia'),
    ('ml', 'മലയാളം', 'Malayalam', 'Malayalam'),
    ('pa', 'ਪੰਜਾਬੀ', 'Punjabi', 'Gurmukhi'),
    ('as', 'অসমীয়া', 'Assamese', 'Bengali'),
    ('mai', 'मैथिली', 'Maithili', 'Devanagari'),
    ('sat', 'ᱥᱟᱱᱛᱟᱲᱤ', 'Santali', 'Ol Chiki'),
    ('ks', 'कॉशुर', 'Kashmiri', 'Devanagari'),
    ('en', 'English', 'English', 'Latin'),
]

# Language code list for validation
LANGUAGE_CODES = [code for code, *_ in SUPPORTED_LANGUAGES]

# Default/fallback language
DEFAULT_LANGUAGE = 'hi'

# Locale mapping for Intl (JavaScript-style for reference; Python uses babel or similar)
LANGUAGE_LOCALE_MAP = {
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'or': 'or-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'as': 'as-IN',
    'mai': 'hi-IN',  # Maithili fallback
    'sat': 'hi-IN',  # Santali fallback
    'ks': 'ks-IN',
    'en': 'en-IN',
}

# Translation module names (must match locale JSON filenames)
TRANSLATION_MODULES = ['common', 'dashboard', 'chatbot', 'advisory', 'schemes', 'errors', 'validation']

# Path to locale JSON files
LOCALES_DIR = BASE_DIR / 'locales'

# Flask
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')
DEBUG = os.environ.get('FLASK_DEBUG', '1') == '1'
