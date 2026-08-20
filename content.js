(() => {
  const core = globalThis.CalendarAlarmCore;
  const seenNodes = new WeakSet();

  function report(text, source) {
    chrome.runtime.sendMessage({ type: 'CALENDAR_ALARM', text: core.normalizeText(text), source }).catch(() => {});
  }

  function inspect(root) {
    const candidates = [];
    if (root instanceof Element && root.matches('[role="dialog"], [role="alertdialog"]')) candidates.push(root);
    if (root.querySelectorAll) candidates.push(...root.querySelectorAll('[role="dialog"], [role="alertdialog"]'));
    for (const dialog of candidates) {
      if (seenNodes.has(dialog)) continue;
      const actions = [...dialog.querySelectorAll('button, [role="button"]')].map((node) => node.textContent || node.getAttribute('aria-label') || '');
      if (!core.looksLikeCalendarAlarm(dialog.innerText || dialog.textContent, actions)) continue;
      seenNodes.add(dialog);
      report(dialog.innerText || dialog.textContent, 'calendar-dialog');
    }
  }

  function start() {
    inspect(document);
    new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) inspect(node);
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

  chrome.runtime.sendMessage({ type: 'CALENDAR_TAB_ACTIVE' }).catch(() => {});
})();
