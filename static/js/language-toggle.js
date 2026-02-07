/**
 * KrishiNirnay AI - Language Toggle (top-right, 15 languages, search, a11y)
 */

(function () {
  const SELECTOR = '.language-toggle';
  const STORAGE_KEY = 'userLanguage';

  function getList() {
    return (typeof window !== 'undefined' && window.SUPPORTED_LANGUAGES) ? window.SUPPORTED_LANGUAGES : [
      { code: 'hi', native: 'हिंदी', name: 'Hindi' }, { code: 'bn', native: 'বাংলা', name: 'Bengali' },
      { code: 'te', native: 'తెలుగు', name: 'Telugu' }, { code: 'mr', native: 'मराठी', name: 'Marathi' },
      { code: 'ta', native: 'தமிழ்', name: 'Tamil' }, { code: 'gu', native: 'ગુજરાતી', name: 'Gujarati' },
      { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada' }, { code: 'or', native: 'ଓଡ଼ିଆ', name: 'Odia' },
      { code: 'ml', native: 'മലയാളം', name: 'Malayalam' }, { code: 'pa', native: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
      { code: 'as', native: 'অসমীয়া', name: 'Assamese' }, { code: 'mai', native: 'मैथिली', name: 'Maithili' },
      { code: 'sat', native: 'ᱥᱟᱱᱛᱟᱲᱤ', name: 'Santali' }, { code: 'ks', native: 'कॉशुर', name: 'Kashmiri' },
      { code: 'en', native: 'English', name: 'English' }
    ];
  }

  function getLabel(entry) {
    return entry.native === entry.name ? entry.native : entry.native + ' (' + entry.name + ')';
  }
  function getButtonLabel(entry) {
    if (!entry) return '';
    return entry.name || entry.native;
  }

  function renderButton(current, selectLabel) {
    const label = current ? getButtonLabel(current) : (selectLabel || 'Select Language');
    return (
      '<button type="button" class="language-toggle__btn" aria-haspopup="listbox" aria-expanded="false" aria-label="' + (selectLabel || 'Select Language') + '">' +
      '<span class="language-toggle__icon" aria-hidden="true">🌐</span>' +
      '<span class="language-toggle__label">' + label + '</span>' +
      '<span class="language-toggle__chevron" aria-hidden="true">▼</span>' +
      '</button>'
    );
  }

  function renderDropdown(searchPlaceholder, selectLabel) {
    const header = '<div class="language-toggle__header">' + (selectLabel || 'Select Language') + '</div>';
    const search = '<div class="language-toggle__search-wrap">' +
      '<span class="language-toggle__search-icon" aria-hidden="true">🔍</span>' +
      '<input type="text" class="language-toggle__search" placeholder="' + (searchPlaceholder || 'Search languages...') + '" aria-label="' + (searchPlaceholder || 'Search languages...') + '">' +
      '</div>';
    return '<div class="language-toggle__dropdown" role="listbox" aria-label="' + (selectLabel || 'Select Language') + '">' + header + search + '<div class="language-toggle__list"></div></div>';
  }

  function filterList(list, q) {
    const lower = (q || '').toLowerCase().trim();
    if (!lower) return list;
    return list.filter(function (entry) {
      return entry.native.toLowerCase().includes(lower) || entry.name.toLowerCase().includes(lower) || entry.code.toLowerCase().includes(lower);
    });
  }

  function init() {
    const i18n = window.i18n;
    const list = getList();
    if (!i18n || !list.length) return;

    const root = document.querySelector(SELECTOR);
    if (!root) return;

    const currentCode = i18n.getCurrentLanguage();
    const currentEntry = list.find(function (e) { return e.code === currentCode; }) || list[0];

    const selectLabel = i18n.t('language.select', 'common');
    const searchPlaceholder = i18n.t('language.search_placeholder', 'common');

    root.innerHTML = renderButton(currentEntry, selectLabel) + renderDropdown(searchPlaceholder, selectLabel);

    const btn = root.querySelector('.language-toggle__btn');
    const dropdown = root.querySelector('.language-toggle__dropdown');
    const searchInput = root.querySelector('.language-toggle__search');
    const listEl = root.querySelector('.language-toggle__list');

    function close() {
      root.classList.remove('language-toggle--open');
      btn.setAttribute('aria-expanded', 'false');
      if (searchInput) searchInput.value = '';
      reattachItems(list, currentCode);
    }

    function open() {
      root.classList.add('language-toggle--open');
      btn.setAttribute('aria-expanded', 'true');
      reattachItems(list, i18n.getCurrentLanguage());
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    }

    function reattachItems(itemsToShow, selectedCode) {
      if (!listEl) return;
      const frag = document.createDocumentFragment();
      filterList(itemsToShow, searchInput ? searchInput.value : '').forEach(function (entry) {
        const div = document.createElement('div');
        div.className = 'language-toggle__item' + (entry.code === selectedCode ? ' language-toggle__item--selected' : '');
        div.setAttribute('role', 'option');
        div.setAttribute('data-lang', entry.code);
        if (entry.code === selectedCode) div.setAttribute('aria-selected', 'true');
        div.tabIndex = 0;
        div.innerHTML = (entry.code === selectedCode ? '<span class="language-toggle__check" aria-hidden="true">✓</span>' : '') + '<span>' + getLabel(entry) + '</span>';
        div.addEventListener('click', function () { select(entry.code); });
        div.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(entry.code); }
        });
        frag.appendChild(div);
      });
      listEl.innerHTML = '';
      listEl.appendChild(frag);
    }

    function select(code) {
      i18n.setLanguage(code);
      const entry = list.find(function (e) { return e.code === code; });
      if (btn) {
        btn.querySelector('.language-toggle__label').textContent = entry ? getButtonLabel(entry) : code;
      }
      root.querySelectorAll('.language-toggle__item').forEach(function (el) {
        el.classList.remove('language-toggle__item--selected');
        el.removeAttribute('aria-selected');
        if (el.getAttribute('data-lang') === code) {
          el.classList.add('language-toggle__item--selected');
          el.setAttribute('aria-selected', 'true');
          if (!el.querySelector('.language-toggle__check')) {
            const check = document.createElement('span');
            check.className = 'language-toggle__check';
            check.setAttribute('aria-hidden', 'true');
            check.textContent = '✓';
            el.insertBefore(check, el.firstChild);
          }
        } else {
          const c = el.querySelector('.language-toggle__check');
          if (c) c.remove();
        }
      });
      close();
    }

    btn.addEventListener('click', function () {
      if (root.classList.contains('language-toggle--open')) close(); else open();
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        reattachItems(list, i18n.getCurrentLanguage());
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('language-toggle--open')) {
        close();
      }
    });

    document.addEventListener('click', function (e) {
      if (root.classList.contains('language-toggle--open') && !root.contains(e.target)) close();
    });

    reattachItems(list, currentCode);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    window.addEventListener('languageChanged', function () {
      var root = document.querySelector(SELECTOR);
      if (root && window.i18n) {
        var list = getList();
        var code = window.i18n.getCurrentLanguage();
        var entry = list.find(function (e) { return e.code === code; });
        var label = document.querySelector(SELECTOR + ' .language-toggle__label');
        if (label && entry) label.textContent = getButtonLabel(entry);
        var selectLabel = window.i18n.t('language.select', 'common');
        var header = document.querySelector(SELECTOR + ' .language-toggle__header');
        if (header) header.textContent = selectLabel;
      }
    });
  }
})();
