(() => {
  const core = globalThis.CalendarAlarmCore;
  const DIALOGS = '[role="dialog"], [role="alertdialog"]';
  // Calendar may reuse a dialog node for later reminders, so remember the text we reported.
  const reportedText = new WeakMap();

  function report(text, source) {
    chrome.runtime.sendMessage({ type: 'CALENDAR_ALARM', text: core.normalizeText(text), source }).catch(() => {});
  }

  function inspect(root) {
    const candidates = [];
    if (root instanceof Element) {
      const enclosing = root.closest(DIALOGS);
      if (enclosing) candidates.push(enclosing);
    }
    if (root.querySelectorAll) candidates.push(...root.querySelectorAll(DIALOGS));
    for (const dialog of candidates) {
      const text = core.normalizeText(dialog.innerText || dialog.textContent);
      if (reportedText.get(dialog) === text) continue;
      const actions = [...dialog.querySelectorAll('button, [role="button"]')].map((node) => node.textContent || node.getAttribute('aria-label') || '');
      if (!core.looksLikeCalendarAlarm(text, actions)) continue;
      reportedText.set(dialog, text);
      report(text, 'calendar-dialog');
    }
  }

  function start() {
    inspect(document);
    new MutationObserver((records) => {
      for (const record of records) {
        // Content is often filled into an already-inserted dialog.
        if (record.target.nodeType === Node.ELEMENT_NODE && record.target.closest(DIALOGS)) inspect(record.target);
        for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) inspect(node);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.addEventListener('message', (event) => {
    if (event.source === window && event.origin === location.origin && event.data?.source === 'calendar-alarm' && ['PAGE_ALERT', 'PAGE_NOTIFICATION'].includes(event.data.type)) {
      if (core.shouldReportPageSignal(event.data.type, event.data.text)) {
        report(event.data.text, event.data.type === 'PAGE_NOTIFICATION' ? 'web-notification' : 'page-alert');
      }
    }
  });

  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });

  const checkIn = () => chrome.runtime.sendMessage({
    type: 'CALENDAR_TAB_ACTIVE',
    notificationPermission: typeof Notification === 'function' ? Notification.permission : 'unsupported'
  }).catch(() => {});
  checkIn();
  setInterval(checkIn, 5 * 60 * 1000);
})();
