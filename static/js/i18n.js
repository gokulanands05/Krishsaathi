/**
 * KrishiNirnay AI - Translation Manager
 * Enterprise-grade i18n with 15 Indian languages
 */

const SUPPORTED_LANGUAGES = [
  { code: 'hi', native: 'हिंदी', name: 'Hindi' },
  { code: 'bn', native: 'বাংলা', name: 'Bengali' },
  { code: 'te', native: 'తెలుగు', name: 'Telugu' },
  { code: 'mr', native: 'मराठी', name: 'Marathi' },
  { code: 'ta', native: 'தமிழ்', name: 'Tamil' },
  { code: 'gu', native: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'or', native: 'ଓଡ଼ିଆ', name: 'Odia' },
  { code: 'ml', native: 'മലയാളം', name: 'Malayalam' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
  { code: 'as', native: 'অসমীয়া', name: 'Assamese' },
  { code: 'mai', native: 'मैथिली', name: 'Maithili' },
  { code: 'sat', native: 'ᱥᱟᱱᱛᱟᱲᱤ', name: 'Santali' },
  { code: 'ks', native: 'कॉशुर', name: 'Kashmiri' },
  { code: 'en', native: 'English', name: 'English' }
];

// RTL script languages (e.g. Kashmiri in Perso-Arabic). Add 'ur', 'ar' if supported later.
const RTL_LANGUAGES = ['ks'];
const DEFAULT_LANGUAGE = 'hi';
const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

class TranslationManager {
  constructor() {
    this.currentLanguage = DEFAULT_LANGUAGE;
    this.translations = {};
    this.loadedModules = new Set();
    this.baseUrl = (typeof window !== 'undefined' && window.__LOCALE_BASE__) || '/locales';
  }

  async setLanguage(langCode) {
    if (!LANGUAGE_CODES.includes(langCode)) langCode = DEFAULT_LANGUAGE;
    this.currentLanguage = langCode;

    await this.loadModules(['common', 'dashboard', 'chatbot']);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = langCode;
      document.documentElement.setAttribute('lang', langCode);
      document.body.setAttribute('lang', langCode);
      document.dir = RTL_LANGUAGES.includes(langCode) ? 'rtl' : 'ltr';
    }

    this.applyTranslations();
    if (typeof window !== 'undefined' && window.fontLoader) {
      window.fontLoader.loadForLanguage(langCode);
    }

    try {
      localStorage.setItem('userLanguage', langCode);
    } catch (e) {}

    if (typeof window !== 'undefined' && window.currentUser) {
      await this.syncToServer(langCode);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
    }
  }

  async loadModules(modules) {
    for (const module of modules) {
      const cacheKey = `${this.currentLanguage}:${module}`;
      if (this.loadedModules.has(cacheKey)) continue;

      try {
        const res = await fetch(`${this.baseUrl}/${this.currentLanguage}/${module}.json`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        this.translations[module] = data;
        this.loadedModules.add(cacheKey);
      } catch (err) {
        console.warn(`i18n: Failed to load ${module} for ${this.currentLanguage}`, err);
        await this.loadFallback(module);
      }
    }
  }

  async loadFallback(module) {
    try {
      const res = await fetch(`${this.baseUrl}/${DEFAULT_LANGUAGE}/${module}.json`);
      if (!res.ok) return;
      const data = await res.json();
      this.translations[module] = data;
      this.loadedModules.add(`${this.currentLanguage}:${module}`);
    } catch (e) {
      this.translations[module] = {};
    }
  }

  t(key, module = 'common', interpolations = {}) {
    const keys = key.split('.');
    let value = this.translations[module];
    for (const k of keys) {
      value = value != null && typeof value === 'object' ? value[k] : undefined;
      if (value === undefined) break;
    }
    if (value == null || typeof value !== 'string') {
      if (this.currentLanguage !== DEFAULT_LANGUAGE && this.translations[module]) {
        const fallback = keys.reduce((o, k) => o?.[k], this.translations[DEFAULT_LANGUAGE] || {});
        if (typeof fallback === 'string') return this.interpolate(fallback, interpolations);
      }
      return key;
    }
    return this.interpolate(value, interpolations);
  }

  interpolate(str, interpolations) {
    return str.replace(/\{(\w+)\}/g, (m, v) => (interpolations[v] != null ? String(interpolations[v]) : m));
  }

  applyTranslations() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const module = el.getAttribute('data-i18n-module') || 'common';
      el.textContent = this.t(key, module);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key, 'common');
    });
    const titleKey = document.querySelector('meta[name="i18n-title"]')?.content;
    if (titleKey) {
      document.title = this.t(titleKey, 'common');
    }
  }

  async syncToServer(langCode) {
    try {
      await fetch('/api/user/update-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: langCode })
      });
    } catch (e) {
      console.warn('i18n: Failed to sync language to server', e);
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getLanguageList() {
    return SUPPORTED_LANGUAGES;
  }
}

if (typeof window !== 'undefined') {
  window.i18n = new TranslationManager();
  window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
  window.LANGUAGE_CODES = LANGUAGE_CODES;
  window.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
}
