(function (root) {
  const CALENDAR_URL = 'https://calendar.google.com/calendar/u/0/r';

  function isCalendarTab(tab) {
    // A tab that is still loading only exposes its destination as pendingUrl.
    return [tab?.url, tab?.pendingUrl].some((url) => url?.startsWith('https://calendar.google.com/'));
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

  const OWNED_TAB_KEY = 'keepOpenTabId';
  let pending = null;

  // Reminders only fire from a live Calendar page, so keep one open and stop
  // Chrome's Memory Saver from discarding it. Calls are serialized so the
  // startup check and the periodic check cannot both open a tab.
  function ensureCalendarTab(chromeApi) {
    pending ||= ensureOnce(chromeApi).finally(() => { pending = null; });
    return pending;
  }

  async function ensureOnce(chromeApi) {
    const tabs = (await chromeApi.tabs.query({})).filter(isCalendarTab);
    for (const tab of tabs) {
      if (tab.autoDiscardable !== false) await chromeApi.tabs.update(tab.id, { autoDiscardable: false }).catch(() => {});
      if (tab.discarded) await chromeApi.tabs.reload(tab.id).catch(() => {});
    }
    if (tabs.length) return 'existing';

    // Fallback if URLs are hidden from us: trust the tab we opened earlier.
    const stored = await chromeApi.storage.local.get(OWNED_TAB_KEY);
    const ownedId = stored[OWNED_TAB_KEY];
    if (Number.isInteger(ownedId) && await chromeApi.tabs.get(ownedId).catch(() => null)) return 'existing';

    const windows = await chromeApi.windows.getAll({ windowTypes: ['normal'] });
    if (!windows.length) return 'no-window';
    const tab = await chromeApi.tabs.create({ url: CALENDAR_URL, active: false, pinned: true, index: 0 });
    await chromeApi.storage.local.set({ [OWNED_TAB_KEY]: tab.id });
    await chromeApi.tabs.update(tab.id, { autoDiscardable: false }).catch(() => {});
    return 'created';
  }

  root.CalendarAlarmTabs = { focusCalendarTab, ensureCalendarTab };
})(globalThis);
