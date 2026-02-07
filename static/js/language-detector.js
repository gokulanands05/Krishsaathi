/**
 * KrishiNirnay AI - Language detection (URL, localStorage, browser, geolocation)
 */

(function () {
  const LANGUAGE_CODES = typeof window !== 'undefined' && window.LANGUAGE_CODES ? window.LANGUAGE_CODES : ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'or', 'ml', 'pa', 'as', 'mai', 'sat', 'ks', 'en'];
  const DEFAULT_LANGUAGE = 'hi';

  const REGION_LANGUAGE_MAP = {
    'West Bengal': 'bn', 'Andhra Pradesh': 'te', 'Telangana': 'te',
    'Maharashtra': 'mr', 'Tamil Nadu': 'ta', 'Gujarat': 'gu',
    'Karnataka': 'kn', 'Odisha': 'or', 'Kerala': 'ml',
    'Punjab': 'pa', 'Assam': 'as', 'Bihar': 'hi', 'Uttar Pradesh': 'hi',
    'Madhya Pradesh': 'hi', 'Rajasthan': 'hi', 'Jharkhand': 'hi',
    'Chhattisgarh': 'hi', 'Haryana': 'hi', 'Delhi': 'hi'
  };

  function getUrlLanguage() {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const lang = (params.get('lang') || '').trim().toLowerCase().slice(0, 5);
    return LANGUAGE_CODES.includes(lang) ? lang : null;
  }

  function getStoredLanguage() {
    try {
      const stored = localStorage.getItem('userLanguage');
      return stored && LANGUAGE_CODES.includes(stored) ? stored : null;
    } catch (e) {
      return null;
    }
  }

  function getBrowserLanguage() {
    if (typeof navigator === 'undefined' || !navigator.language) return null;
    const code = navigator.language.split('-')[0].toLowerCase();
    return LANGUAGE_CODES.includes(code) ? code : null;
  }

  function detectLanguageByLocation() {
    return new Promise(function (resolve) {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function () {
          // Would need a reverse-geocode API to map lat/lng to state; skip for now
          resolve(null);
        },
        function () { resolve(null); },
        { timeout: 3000, maximumAge: 86400000 }
      );
    });
  }

  function initializeLanguage(i18n) {
    const urlLang = getUrlLanguage();
    if (urlLang) {
      i18n.setLanguage(urlLang);
      return;
    }
    const storedLang = getStoredLanguage();
    if (storedLang) {
      i18n.setLanguage(storedLang);
      return;
    }
    const browserLang = getBrowserLanguage();
    if (browserLang) {
      i18n.setLanguage(browserLang);
      return;
    }
    detectLanguageByLocation().then(function (lang) {
      if (lang) i18n.setLanguage(lang);
      else i18n.setLanguage(DEFAULT_LANGUAGE);
    });
    i18n.setLanguage(DEFAULT_LANGUAGE);
  }

  if (typeof window !== 'undefined') {
    window.initializeLanguage = initializeLanguage;
    window.getUrlLanguage = getUrlLanguage;
    window.getStoredLanguage = getStoredLanguage;
    window.getBrowserLanguage = getBrowserLanguage;
  }
})();
