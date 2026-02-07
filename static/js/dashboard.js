/**
 * Dashboard - fetch and render real-time weather, mandi, schemes, soil, advisory
 */

(function () {
  function apiHeaders() {
    var lang = (window.i18n && window.i18n.getCurrentLanguage()) ? window.i18n.getCurrentLanguage() : 'hi';
    return { 'Accept-Language': lang };
  }

  function get(url) {
    return fetch(url, { headers: apiHeaders() }).then(function (r) {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });
  }

  function renderWeather(data, container) {
    if (!container) return;
    var cur = data && data.current;
    var daily = data && data.daily;
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    var cond = cur && cur.condition_label ? cur.condition_label : (cur && cur.condition) || '—';
    var temp = cur && cur.temperature != null ? Math.round(cur.temperature) + ' °C' : '—';
    var humidity = cur && cur.humidity != null ? cur.humidity + '%' : '—';
    var wind = cur && cur.wind_speed != null ? cur.wind_speed + ' km/h' : '—';

    var html = '<p><strong>' + t('weather_card.current', 'dashboard') + '</strong>: ' + cond + ', ' + temp + '</p>';
    html += '<p>' + t('weather.temperature', 'common') + ': ' + temp + ' &bull; ' + t('weather.humidity', 'common') + ': ' + humidity + ' &bull; ' + t('weather.wind_speed', 'common') + ': ' + wind + '</p>';
    if (daily && daily.time && daily.time.length) {
      html += '<p><strong>' + t('weather_card.next_24h', 'dashboard') + '</strong>: ';
      var parts = [];
      for (var i = 0; i < Math.min(3, daily.time.length); i++) {
        var maxT = daily.temperature_2m_max && daily.temperature_2m_max[i];
        var minT = daily.temperature_2m_min && daily.temperature_2m_min[i];
        var day = daily.time[i];
        if (day) day = day.slice(0, 10);
        parts.push((day || '') + ' ' + (maxT != null ? Math.round(maxT) + '°' : '') + (minT != null ? '/' + Math.round(minT) + '°' : ''));
      }
      html += parts.join(' | ') + '</p>';
    }
    if (data && data.error) {
      html = '<p class="dashboard-error">' + (t('messages.error', 'common') || 'Error') + ': ' + data.error + '</p>';
    }
    container.innerHTML = html;
    showWeatherAlertIfBad(data);
  }

  function showWeatherAlertIfBad(data) {
    if (!data || !data.current) return;
    try {
      if (sessionStorage.getItem('weatherAlertShown') === '1') return;
    } catch (e) {}
    var cur = data.current;
    var cond = (cur.condition || '').toLowerCase();
    var temp = cur.temperature;
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    var title = t('weather_alert.title', 'common');
    var msg = '';
    if (cond === 'stormy') {
      msg = t('weather_alert.stormy', 'common');
    } else if (cond === 'rainy') {
      msg = t('weather_alert.rainy', 'common');
    } else if (temp != null && temp >= 42) {
      msg = t('weather_alert.extreme_heat', 'common');
    } else if (temp != null && temp <= 2) {
      msg = t('weather_alert.extreme_cold', 'common');
    }
    if (msg) {
      try { sessionStorage.setItem('weatherAlertShown', '1'); } catch (e) {}
      alert(title + '\n\n' + msg);
    }
  }

  function renderMandi(data, container) {
    if (!container) return;
    var prices = (data && data.prices) || [];
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    var fmt = window.formatter && window.formatter.formatCurrency ? window.formatter.formatCurrency.bind(window.formatter) : function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };

    var html = '';
    if (prices.length === 0) {
      html = '<p>' + (t('messages.no_data', 'common') || 'No data available') + '</p>';
    } else {
      html += '<table class="mandi-table"><thead><tr><th>' + (t('market.commodity', 'common') || 'Commodity') + '</th><th>' + (t('market.price_per_quintal', 'common') || 'Price/Quintal') + '</th><th>' + (t('market.trend', 'common') || 'Trend') + '</th></tr></thead><tbody>';
      for (var i = 0; i < prices.length; i++) {
        var p = prices[i];
        var name = p.commodity_local || p.commodity || '—';
        var modal = p.modal_price != null ? fmt(p.modal_price) : '—';
        html += '<tr><td>' + name + '</td><td>' + modal + '</td><td>—</td></tr>';
      }
      html += '</tbody></table>';
      if (data.source) html += '<p class="dashboard-source">Source: ' + data.source + '</p>';
    }
    container.innerHTML = html;
  }

  function renderSchemes(data, container) {
    if (!container) return;
    var schemes = (data && data.schemes) || [];
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };

    var html = '';
    if (schemes.length === 0) {
      html = '<p>' + (t('messages.no_data', 'common') || 'No data available') + '</p>';
    } else {
      html += '<ul class="schemes-list">';
      for (var i = 0; i < schemes.length; i++) {
        var s = schemes[i];
        html += '<li><a href="' + (s.link || '#') + '" target="_blank" rel="noopener">' + (s.name || s.id) + '</a>';
        if (s.description) html += '<p class="schemes-desc">' + s.description + '</p>';
        html += '</li>';
      }
      html += '</ul>';
    }
    container.innerHTML = html;
  }

  function renderAdvisory(data, container) {
    if (!container) return;
    var text = (data && data.text) || '';
    var soilTip = (data && data.soil_tip) || '';
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    if (!text && !soilTip) {
      container.innerHTML = '<p>' + (t('advisory_card.no_advisory', 'dashboard') || 'No advisory for today') + '</p>';
      return;
    }
    var html = '<p>' + (text || t('advisory_card.no_advisory', 'dashboard')) + '</p>';
    if (soilTip) html += '<p class="soil-tip">' + soilTip + '</p>';
    container.innerHTML = html;
  }

  function renderSoil(data, container) {
    if (!container) return;
    var summary = (data && data.summary) || '';
    var link = (data && data.soil_health_card_link) || 'https://soilhealth.dac.gov.in';
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    var html = '<p>' + (summary || t('messages.no_data', 'common')) + '</p>';
    html += '<a href="' + link + '" target="_blank" rel="noopener" class="btn btn--primary">' + (t('buttons.learn_more', 'common') || 'Learn more') + '</a>';
    container.innerHTML = html;
  }

  function renderSatellite(data, container) {
    if (!container) return;
    var desc = (data && data.description) || '';
    var link = (data && data.bhuvan_portal) || 'https://bhuvan-app1.nrsc.gov.in/';
    var t = window.i18n ? window.i18n.t.bind(window.i18n) : function (k) { return k; };
    var html = '<p>' + (desc || t('messages.no_data', 'common')) + '</p>';
    html += '<a href="' + link + '" target="_blank" rel="noopener" class="btn btn--primary">Bhuvan / NDVI</a>';
    container.innerHTML = html;
  }

  function setLoading(el, loading) {
    if (!el) return;
    var msg = (window.i18n && window.i18n.t('messages.loading', 'common')) || 'Loading...';
    if (loading) el.innerHTML = '<p class="dashboard-loading">' + msg + '</p>';
  }

  function loadDashboard() {
    var weatherEl = document.getElementById('dashboard-weather');
    var mandiEl = document.getElementById('dashboard-mandi');
    var schemesEl = document.getElementById('dashboard-schemes');
    var advisoryEl = document.getElementById('dashboard-advisory');
    var soilEl = document.getElementById('dashboard-soil');
    var satelliteEl = document.getElementById('dashboard-satellite');

    if (weatherEl) {
      setLoading(weatherEl, true);
      get('/api/weather').then(function (data) {
        renderWeather(data, weatherEl);
      }).catch(function (err) {
        try { sessionStorage.removeItem('weatherAlertShown'); } catch (e) {}
        if (weatherEl) weatherEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }

    if (mandiEl) {
      setLoading(mandiEl, true);
      get('/api/mandi?limit=10').then(function (data) {
        renderMandi(data, mandiEl);
      }).catch(function (err) {
        if (mandiEl) mandiEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }

    if (schemesEl) {
      setLoading(schemesEl, true);
      get('/api/schemes').then(function (data) {
        renderSchemes(data, schemesEl);
      }).catch(function (err) {
        if (schemesEl) schemesEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }

    if (advisoryEl) {
      setLoading(advisoryEl, true);
      get('/api/advisory').then(function (data) {
        renderAdvisory(data, advisoryEl);
      }).catch(function (err) {
        if (advisoryEl) advisoryEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }

    if (soilEl) {
      setLoading(soilEl, true);
      get('/api/soil').then(function (data) {
        renderSoil(data, soilEl);
      }).catch(function (err) {
        if (soilEl) soilEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }

    if (satelliteEl) {
      setLoading(satelliteEl, true);
      get('/api/satellite').then(function (data) {
        renderSatellite(data, satelliteEl);
      }).catch(function (err) {
        if (satelliteEl) satelliteEl.innerHTML = '<p class="dashboard-error">' + (window.i18n ? window.i18n.t('messages.error', 'common') : 'Error') + ': ' + err.message + '</p>';
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('dashboard-weather') || document.getElementById('dashboard-mandi')) {
          loadDashboard();
        }
      });
    } else {
      if (document.getElementById('dashboard-weather') || document.getElementById('dashboard-mandi')) {
        loadDashboard();
      }
    }
    window.addEventListener('languageChanged', function () {
      if (document.getElementById('dashboard-weather') || document.getElementById('dashboard-mandi')) {
        loadDashboard();
      }
    });
  }
})();
