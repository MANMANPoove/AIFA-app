// AIFA's service worker: notifications only (Web Push, see
// backend/internal/push/webpush.go). It caches nothing and has no fetch
// handler, so the app loads exactly as it would without it.
//
// The server sends {title, body, data}; data.type "reminder" carries
// data.open = chat | voice | receipt | statement, the way of logging the
// reminder suggested. A tap opens (or focuses) the app and hands that over
// (index.html → core/platform/web_push_web.dart).

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var m = {};
  try { m = e.data ? e.data.json() : {}; } catch (_) { m = { body: e.data ? e.data.text() : '' }; }
  var data = m.data || {};
  // An evening reminder carries «Сегодня без трат» as a button: the honest
  // answer to «what did you spend?» without opening anything. The label comes
  // in the reminder's own language (data.no_spend).
  var actions = data.type === 'reminder' && data.no_spend
    ? [{ action: 'no_spend', title: data.no_spend }] : [];
  e.waitUntil(self.registration.showNotification(m.title || 'AIFA', {
    body: m.body || '',
    icon: 'icons/Icon-192.png',
    badge: 'icons/badge-96.png',
    // One reminder replaces the previous one instead of piling up.
    tag: data.type || 'aifa',
    actions: actions,
    data: data
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var data = e.notification.data || {};
  var open = data.type === 'reminder' ? (data.open || 'chat') : (data.type || '');
  if (e.action === 'no_spend') open = 'no_spend';
  var scope = self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.indexOf(scope) === 0 && 'focus' in c) {
        c.postMessage({ aifaPushOpen: open });
        return c.focus();
      }
    }
    return self.clients.openWindow(scope + '?push_open=' + encodeURIComponent(open));
  }));
});
