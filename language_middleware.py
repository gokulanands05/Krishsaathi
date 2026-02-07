# Language detection middleware - URL, header, session

from flask import request

from config import LANGUAGE_CODES, DEFAULT_LANGUAGE


def get_request_language():
    """Priority: URL ?lang= > Accept-Language header > default."""
    # 1. URL parameter (deep linking)
    url_lang = request.args.get('lang', '').strip()[:5]
    if url_lang in LANGUAGE_CODES:
        return url_lang

    # 2. Accept-Language header (e.g. hi-IN, en)
    accept = request.headers.get('Accept-Language', '')
    for part in accept.split(','):
        part = part.strip().split(';')[0].strip()
        code = part.split('-')[0].lower() if part else ''
        if code in LANGUAGE_CODES:
            return code

    return DEFAULT_LANGUAGE
