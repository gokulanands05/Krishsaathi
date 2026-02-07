/**
 * Voice: SpeechRecognition + speechSynthesis with VOICE_LANGUAGE_CODES
 * On languageChanged: set recognition.lang and re-greet in chatbot
 */

(function () {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  var synthesis = window.speechSynthesis;

  function getVoiceLang() {
    var lang = (window.i18n && window.i18n.getCurrentLanguage()) ? window.i18n.getCurrentLanguage() : 'hi';
    return (window.VOICE_LANGUAGE_CODES && window.VOICE_LANGUAGE_CODES[lang]) ? window.VOICE_LANGUAGE_CODES[lang] : 'hi-IN';
  }

  function initRecognition() {
    if (!SpeechRecognition) return null;
    try {
      var r = new SpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = getVoiceLang();
      return r;
    } catch (e) {
      return null;
    }
  }

  recognition = initRecognition();

  function setRecognitionLang(langCode) {
    if (!recognition) return;
    var locale = (window.VOICE_LANGUAGE_CODES && window.VOICE_LANGUAGE_CODES[langCode]) ? window.VOICE_LANGUAGE_CODES[langCode] : langCode + '-IN';
    try {
      recognition.lang = locale;
    } catch (err) {}
  }

  function speak(text, langCode) {
    if (!synthesis || !text) return;
    var locale = (window.VOICE_LANGUAGE_CODES && window.VOICE_LANGUAGE_CODES[langCode]) ? window.VOICE_LANGUAGE_CODES[langCode] : (langCode || 'hi') + '-IN';
    synthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    u.rate = 0.9;
    u.pitch = 1;
    synthesis.speak(u);
  }

  function getGreeting() {
    if (!window.i18n) return null;
    var name = (window.currentUser && window.currentUser.name) ? window.currentUser.name : window.i18n.t('farmer', 'common');
    return window.i18n.t('greeting', 'chatbot', { name: name });
  }

  function reGreet() {
    var greeting = getGreeting();
    if (!greeting) return;
    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'hi';
    if (window.chatbot && typeof window.chatbot.addBotMessage === 'function') {
      window.chatbot.addBotMessage(greeting);
    }
    speak(greeting, lang);
  }

  window.addEventListener('languageChanged', function (e) {
    var newLang = e.detail && e.detail.language;
    if (newLang) {
      setRecognitionLang(newLang);
      if (window.chatbot && window.chatbot.isOpen) {
        if (window.i18n && typeof window.i18n.t === 'function') {
          var msg = window.i18n.t('language_switched', 'chatbot');
          if (window.chatbot.addBotMessage) window.chatbot.addBotMessage(msg);
        }
        reGreet();
      }
    }
  });

  window.voiceHandler = {
    recognition: recognition,
    synthesis: synthesis,
    setLang: setRecognitionLang,
    speak: speak,
    getVoiceLang: getVoiceLang,
    reGreet: reGreet,
    start: function (onResult, onError) {
      if (!recognition) {
        if (onError) onError(new Error('Speech recognition not supported'));
        return;
      }
      recognition.onresult = function (event) {
        var t = (event.results && event.results[0] && event.results[0][0]) ? event.results[0][0].transcript : '';
        if (onResult) onResult(t);
      };
      recognition.onerror = function (event) {
        if (onError) onError(event.error || new Error('Recognition error'));
      };
      recognition.lang = getVoiceLang();
      recognition.start();
    },
    stop: function () {
      if (recognition) try { recognition.stop(); } catch (e) {}
    }
  };
})();
