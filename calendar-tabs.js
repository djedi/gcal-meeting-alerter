(function (root) {
  const CALENDAR_URL = 'https://calendar.google.com/calendar/u/0/r';

  function isCalendarTab(tab) {
    return Boolean(tab?.url?.startsWith('https://calendar.google.com/'));
  }

  async function activate(chromeApi, tab) {
    await chromeApi.windows.update(tab.windowId, { focused: true });
    await chromeApi.tabs.update(tab.id, { active: true });
  }

  async function focusCalendarTab(chromeApi, preferredTabId) {
    if (Number.isInteger(preferredTabId)) {
      const preferred = await chromeApi.tabs.get(preferredTabId).catch(() => null);
      if (isCalendarTab(preferred)) {
        await activate(chromeApi, preferred);
        return 'preferred';
      }
    }

    const tabs = await chromeApi.tabs.query({ url: 'https://calendar.google.com/*' });
    const existing = tabs.find(isCalendarTab);
    if (existing) {
      await activate(chromeApi, existing);
      return 'existing';
    }

    await chromeApi.tabs.create({ url: CALENDAR_URL, active: true });
    return 'created';
  }

  root.CalendarAlarmTabs = { focusCalendarTab };
})(globalThis);
