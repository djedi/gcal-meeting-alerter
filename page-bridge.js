(() => {
  if (window.__calendarAlarmBridgeInstalled) return;
  window.__calendarAlarmBridgeInstalled = true;

  const post = (type, text) => window.postMessage({
    source: 'calendar-alarm',
    type,
    text: String(text || '')
  }, location.origin);

  const looksLikeReminder = (text) => /(?:\b(?:starts?|starting)\s+(?:now\b|in\b)|\b(?:event|calendar)\s+reminder\b|\breminder\s*[:—-]\s*\S|\bjoin\s+now\b)/i.test(String(text || ''));

  const nativeAlert = window.alert.bind(window);
  window.alert = (message) => {
    if (looksLikeReminder(message)) post('PAGE_ALERT', message);
    else nativeAlert(message);
  };

  // Observe page-created Web Notifications while preserving the native API.
  // This cannot see notifications created solely inside Google's service worker;
  // Calendar's in-page reminder-dialog observer remains the other detection layer.
  if (typeof window.Notification === 'function') {
    const NativeNotification = window.Notification;
    window.Notification = new Proxy(NativeNotification, {
      construct(target, args, newTarget) {
        const [title, options = {}] = args;
        const notification = Reflect.construct(target, args, newTarget === window.Notification ? target : newTarget);
        const text = options.body ? `${title}: ${options.body}` : String(title || '');
        post('PAGE_NOTIFICATION', text);
        return notification;
      }
    });
  }
})();
