# KrishiNirnay AI - Main application
# Enterprise-grade agricultural intelligence platform

import os
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory, render_template

from config import (
    SUPPORTED_LANGUAGES,
    LANGUAGE_CODES,
    DEFAULT_LANGUAGE,
    LOCALES_DIR,
)
from translations import (
    get_translation,
    get_chatbot_template,
    translate_pest,
    translate_treatment,
    translate_crop,
)
from language_middleware import get_request_language
from services.weather import fetch_weather
from services.mandi import fetch_mandi
from services.schemes import get_schemes
from services.soil import get_soil_advisory
from services.satellite import get_satellite_info
from services.advisory import get_advisory
from services.chatbot_engine import get_chatbot_reply

app = Flask(
    __name__,
    static_folder='static',
    template_folder='templates',
)
app.config.from_object('config')

# Store translation helpers on app for use in templates
@app.context_processor
def inject_i18n():
    lang = get_request_language()
    return {
        'supported_languages': SUPPORTED_LANGUAGES,
        'current_language': lang,
        't': lambda key, module='common', **kwargs: get_translation(lang, module, key, **kwargs),
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


@app.route('/chatbot')
def chatbot_page():
    return render_template('chatbot.html')


# API: Update user language preference (persist to DB in production)
@app.route('/api/user/update-language', methods=['POST'])
def update_language():
    data = request.get_json() or {}
    lang = (data.get('language') or '').strip()[:5]
    if lang not in LANGUAGE_CODES:
        return jsonify({'error': 'Invalid language code'}), 400
    # In production: update user.language_pref in database
    return jsonify({'success': True, 'language': lang})


# API: Chatbot text message (rule-based: weather, mandi, schemes, soil, pest)
@app.route('/api/chatbot/message', methods=['POST'])
def chatbot_message():
    data = request.get_json() or {}
    user_lang = request.headers.get('Accept-Language', 'hi')[:2]
    if user_lang not in LANGUAGE_CODES:
        user_lang = DEFAULT_LANGUAGE
    message = (data.get('message') or '').strip()
    reply = get_chatbot_reply(message, user_lang)
    return jsonify({'reply': reply, 'language': user_lang})


# API: Chatbot analyze image (example with translated response)
@app.route('/api/chatbot/analyze-image', methods=['POST'])
def chatbot_analyze_image():
    data = request.get_json() or {}
    user_lang = request.headers.get('Accept-Language', 'hi')[:2]
    if user_lang not in LANGUAGE_CODES:
        user_lang = DEFAULT_LANGUAGE

    # Placeholder: real implementation would call pest detection model
    pest_name_en = data.get('pest_name_en') or 'Pink Bollworm'
    treatment_en = data.get('treatment_en') or 'Spray Neem Oil'

    pest_name_local = translate_pest(pest_name_en, user_lang)
    treatment_local = translate_treatment(treatment_en, user_lang)

    return jsonify({
        'pest_name': pest_name_local,
        'treatment': treatment_local,
        'language': user_lang,
    })


# ---------- Real-time data APIs ----------

@app.route('/api/weather')
def api_weather():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    data = fetch_weather(lat=lat, lon=lon)
    if data.get('current'):
        # Translate condition key for frontend (sunny/cloudy/rainy/stormy)
        cond = data['current'].get('condition', '')
        data['current']['condition_label'] = get_translation(lang, 'common', f'weather.conditions.{cond}')
    return jsonify(data)


@app.route('/api/mandi')
def api_mandi():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    limit = request.args.get('limit', default=15, type=int)
    limit = min(max(limit, 1), 50)
    out = fetch_mandi(limit=limit)
    prices = out.get('prices', [])
    for p in prices:
        p['commodity_local'] = translate_crop(p.get('commodity', ''), lang)
    out['prices'] = prices
    return jsonify(out)


@app.route('/api/schemes')
def api_schemes():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    schemes = get_schemes(lang=lang if lang != 'en' else 'en')
    return jsonify({'schemes': schemes})


@app.route('/api/soil')
def api_soil():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    state = request.args.get('state', '')
    district = request.args.get('district', '')
    return jsonify(get_soil_advisory(state=state, district=district, lang=lang))


@app.route('/api/satellite')
def api_satellite():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    state = request.args.get('state', '')
    info = get_satellite_info(lat=lat, lon=lon, state=state)
    key = 'description_hi' if lang == 'hi' else 'description_en'
    info['description'] = info.get(key, info['description_en'])
    return jsonify(info)


@app.route('/api/advisory')
def api_advisory():
    lang = get_request_language()
    if lang not in LANGUAGE_CODES:
        lang = DEFAULT_LANGUAGE
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    state = request.args.get('state', '')
    return jsonify(get_advisory(lang=lang, lat=lat, lon=lon, state=state))


# Serve locale JSON files for frontend i18n
@app.route('/locales/<lang>/<module>.json')
def serve_locale(lang, module):
    if lang not in LANGUAGE_CODES or module not in ['common', 'dashboard', 'chatbot', 'advisory', 'schemes', 'errors', 'validation']:
        return jsonify({}), 404
    path = LOCALES_DIR / lang / f'{module}.json'
    if not path.is_file():
        return jsonify({}), 404
    return send_from_directory(path.parent, f'{module}.json', mimetype='application/json')


if __name__ == '__main__':
    os.makedirs(app.static_folder, exist_ok=True)
    os.makedirs(app.template_folder, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=app.config.get('DEBUG', True))
