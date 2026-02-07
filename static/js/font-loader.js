/**
 * KrishiNirnay AI - Dynamic font loading per script/language
 */

const FONT_MAP = {
  hi: 'Noto Sans Devanagari',
  mr: 'Noto Sans Devanagari',
  mai: 'Noto Sans Devanagari',
  ks: 'Noto Sans Devanagari',
  bn: 'Noto Sans Bengali',
  as: 'Noto Sans Bengali',
  te: 'Noto Sans Telugu',
  ta: 'Noto Sans Tamil',
  gu: 'Noto Sans Gujarati',
  kn: 'Noto Sans Kannada',
  or: 'Noto Sans Oriya',
  ml: 'Noto Sans Malayalam',
  pa: 'Noto Sans Gurmukhi',
  sat: 'Noto Sans Ol Chiki',
  en: 'Inter'
};

const FONT_URLS = {
  'Noto Sans Devanagari': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap',
  'Noto Sans Bengali': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap',
  'Noto Sans Telugu': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&display=swap',
  'Noto Sans Tamil': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap',
  'Noto Sans Gujarati': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;600;700&display=swap',
  'Noto Sans Kannada': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;600;700&display=swap',
  'Noto Sans Oriya': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;600;700&display=swap',
  'Noto Sans Malayalam': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap',
  'Noto Sans Gurmukhi': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;600;700&display=swap',
  'Noto Sans Ol Chiki': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ol+Chiki:wght@400;600;700&display=swap',
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
};

const loadedFonts = new Set();

class FontLoader {
  loadForLanguage(langCode) {
    const family = FONT_MAP[langCode] || 'Inter';
    if (loadedFonts.has(family)) {
      this.applyFont(family);
      return;
    }
    const url = FONT_URLS[family];
    if (!url) {
      this.applyFont('Inter');
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      loadedFonts.add(family);
      this.applyFont(family);
    };
    link.onerror = () => this.applyFont('Inter');
    document.head.appendChild(link);
  }

  applyFont(family) {
    document.body.style.fontFamily = `"${family}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  }
}

if (typeof window !== 'undefined') {
  window.fontLoader = new FontLoader();
}
