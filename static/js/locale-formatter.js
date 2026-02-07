/**
 * KrishiNirnay AI - Locale-aware number, date, currency formatting
 */

const LANGUAGE_LOCALE_MAP = {
  hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN',
  gu: 'gu-IN', kn: 'kn-IN', or: 'or-IN', ml: 'ml-IN', pa: 'pa-IN',
  as: 'as-IN', mai: 'hi-IN', sat: 'hi-IN', ks: 'ks-IN', en: 'en-IN'
};

class LocaleFormatter {
  constructor(language) {
    this.language = language;
    this.locale = LANGUAGE_LOCALE_MAP[language] || 'en-IN';
  }

  formatCurrency(amount) {
    const n = Number(amount);
    if (Number.isNaN(n)) return '₹0';
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(n);
  }

  formatNumber(number) {
    const n = Number(number);
    if (Number.isNaN(n)) return '0';
    return new Intl.NumberFormat(this.locale).format(n);
  }

  formatDate(date, format = 'short') {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    return new Intl.DateTimeFormat(this.locale, options[format] || options.short).format(d);
  }

  formatRelativeTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return rtf.format(diffHours, 'hour');
    }
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
    const diffMonths = Math.floor(diffDays / 30);
    return rtf.format(diffMonths, 'month');
  }
}

if (typeof window !== 'undefined') {
  window.LocaleFormatter = LocaleFormatter;
  window.LANGUAGE_LOCALE_MAP = LANGUAGE_LOCALE_MAP;
}
