/* In-app browsers: Instagram, Facebook, TikTok, Threads, Snapchat, LinkedIn,
   LINE, Telegram's own browser on Android and any other app's web view.
   Google refuses to sign in there (403 disallowed_useragent), so a tap on a
   link marked `data-outside` («Создать аккаунт») first tries to hand the page
   to the phone's real browser: Chrome through an intent:// link on Android,
   Safari through x-safari-https:// on iPhone (iOS 17 and later). If the page
   is still on screen a moment later, nothing took it, and a sheet says how to
   leave by hand (the «•••» menu, or the copied link) or to go on here and
   register with an e-mail, which works everywhere.

   The same detection lives in the app: app/lib/core/in_app_browser.dart. */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var standalone = navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

  function detect() {
    var u = ua.toLowerCase();
    if (u.indexOf('instagram') >= 0) return 'Instagram';
    if (u.indexOf('barcelona') >= 0) return 'Threads';
    if (/fban|fbav|fb_iab|fb4a|messengerfor/.test(u)) return 'Facebook';
    if (/musical_ly|tiktok|bytedancewebview|trill_/.test(u)) return 'TikTok';
    if (u.indexOf('snapchat') >= 0) return 'Snapchat';
    if (u.indexOf('linkedinapp') >= 0) return 'LinkedIn';
    if (/ line\/|^line\//.test(u)) return 'LINE';
    if (u.indexOf('pinterest') >= 0) return 'Pinterest';
    if (/vkclient|vkandroidapp|com\.vkontakte/.test(u)) return 'VK';
    if (/okapp|odnoklassniki/.test(u)) return 'OK';
    // Any other app's own view. Android marks a WebView with "; wv)"; on
    // iPhone a WKWebView leaves "Safari/" out, which Safari, Chrome, Firefox,
    // Edge and the in-app Safari view of Telegram and WhatsApp all keep. A
    // site added to the home screen leaves it out too, but runs standalone.
    var web = (android && /; wv\)/.test(u)) || (ios && !standalone && u.indexOf('safari/') < 0 && /mobile\//.test(u));
    if (!web) return '';
    if (u.indexOf('telegram') >= 0) return 'Telegram';
    if (u.indexOf('whatsapp') >= 0) return 'WhatsApp';
    return 'app';
  }

  var name = detect();

  /* The link that makes the phone open [url] in its real browser, or '' on
     a computer. */
  function outsideUrl(url) {
    var m = /^(https?):\/\/(.*)$/i.exec(url);
    if (!m) return '';
    if (android) {
      return 'intent://' + m[2] + '#Intent;scheme=' + m[1].toLowerCase() +
        ';package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
    }
    if (ios) return 'x-safari-' + url;
    return '';
  }

  var TXT = {
    ru: {
      h: 'Откройте AIFA в браузере',
      p: 'Вход через Google не работает во встроенном браузере {0}.',
      ios: 'Нажмите «•••» или «⋯» в углу экрана и выберите «Открыть в браузере» (в Safari). Или скопируйте ссылку и вставьте её в Safari.',
      and: 'Нажмите «⋮» в углу экрана и выберите «Открыть в Chrome» (или в браузере). Или скопируйте ссылку и вставьте её в Chrome.',
      open: 'Открыть в браузере', copy: 'Скопировать ссылку', copied: 'Ссылка скопирована',
      here: 'Продолжить здесь, по почте и паролю', close: 'Закрыть', app: 'этого приложения'
    },
    kk: {
      h: 'AIFA-ны браузерде ашыңыз',
      p: 'Google арқылы кіру {0} ішіндегі браузерде жұмыс істемейді.',
      ios: 'Экран бұрышындағы «•••» не «⋯» белгісін басып, «Браузерде ашу» (Safari) тармағын таңдаңыз. Не сілтемені көшіріп, Safari-ге қойыңыз.',
      and: 'Экран бұрышындағы «⋮» белгісін басып, «Chrome-да ашу» (не браузерде) тармағын таңдаңыз. Не сілтемені көшіріп, Chrome-ға қойыңыз.',
      open: 'Браузерде ашу', copy: 'Сілтемені көшіру', copied: 'Сілтеме көшірілді',
      here: 'Осында жалғастыру, пошта мен құпиясөзбен', close: 'Жабу', app: 'осы қосымшаның'
    },
    en: {
      h: 'Open AIFA in your browser',
      p: 'Google sign-in doesn’t work in the {0} in-app browser.',
      ios: 'Tap “•••” or “⋯” in a corner of the screen and choose “Open in browser” (Safari). Or copy the link and paste it into Safari.',
      and: 'Tap “⋮” in a corner of the screen and choose “Open in Chrome” (or in browser). Or copy the link and paste it into Chrome.',
      open: 'Open in browser', copy: 'Copy link', copied: 'Link copied',
      here: 'Continue here with e-mail and password', close: 'Close', app: 'this app’s'
    }
  };
  function texts() {
    var l = (document.documentElement.lang || 'ru').slice(0, 2);
    return TXT[l] || TXT.ru;
  }

  var css =
    '.iab-back{position:fixed;inset:0;z-index:9999;background:rgba(20,18,16,.55);display:flex;align-items:flex-end;justify-content:center;padding:16px}' +
    '.iab{width:100%;max-width:420px;background:#F7F3EE;color:#1C1917;border-radius:20px;padding:22px 20px 16px;font:15px/1.45 "Onest",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 24px 60px -20px rgba(0,0,0,.6)}' +
    '.iab h2{margin:0 0 8px;font-size:19px;line-height:1.25;font-weight:700;letter-spacing:-.01em}' +
    '.iab p{margin:0 0 10px;color:#57524C}' +
    '.iab button,.iab a{display:block;width:100%;margin:8px 0 0;padding:13px 14px;border-radius:12px;border:1px solid rgba(28,25,23,.18);background:none;color:#1C1917;font-family:inherit;font-size:15px;font-weight:600;line-height:1.2;text-align:center;text-decoration:none;cursor:pointer}' +
    '.iab .iab-main{background:#1C1917;border-color:#1C1917;color:#F7F3EE}' +
    '.iab .iab-quiet{border:0;font-weight:400;color:#57524C;padding:10px}';

  var sheet = null;
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; } }

  function showSheet(url) {
    closeSheet();
    var t = texts();
    if (!document.getElementById('iab-css')) {
      var st = document.createElement('style');
      st.id = 'iab-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    sheet = document.createElement('div');
    sheet.className = 'iab-back';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    var box = document.createElement('div');
    box.className = 'iab';
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      box.appendChild(n);
      return n;
    }
    el('h2', '', t.h);
    el('p', '', t.p.replace('{0}', name === 'app' ? t.app : name));
    el('p', '', ios ? t.ios : t.and);
    var out = outsideUrl(url);
    if (out) {
      var open = el('a', 'iab-main', t.open);
      open.href = out;
    }
    var copy = el('button', out ? '' : 'iab-main', t.copy);
    copy.type = 'button';
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = t.copied; };
      try {
        navigator.clipboard.writeText(url).then(done, function () { legacyCopy(url); done(); });
      } catch (e) { legacyCopy(url); done(); }
    });
    var here = el('a', 'iab-quiet', t.here);
    here.href = url;
    here.addEventListener('click', closeSheet);
    var close = el('button', 'iab-quiet', t.close);
    close.type = 'button';
    close.addEventListener('click', closeSheet);
    sheet.appendChild(box);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
    document.body.appendChild(sheet);
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (e) {}
  }

  /* Hands [url] to the real browser; shows the sheet if nothing took it. */
  function leave(url) {
    var out = outsideUrl(url);
    if (!out) { showSheet(url); return; }
    var gone = false;
    function hidden() { if (document.visibilityState === 'hidden') gone = true; }
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', hidden);
    try { location.href = out; } catch (e) {}
    setTimeout(function () {
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', hidden);
      if (!gone && document.visibilityState === 'visible') showSheet(url);
    }, 1500);
  }

  window.AifaInApp = { name: name, ios: ios, android: android, outsideUrl: outsideUrl, leave: leave, show: showSheet };
  if (!name) return;

  document.documentElement.classList.add('in-app');
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-outside]') : null;
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    leave(a.href);
  });
})();
