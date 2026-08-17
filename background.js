importScripts('alert-core.js', 'calendar-tabs.js', 'snooze.js');

const DEFAULTS = { enabled: true, alarmWindow: true, playSound: true };
const recent = new Map();
let alarmWindowId = null;
let activeNotificationId = null;

async function settings() {
  return { ...DEFAULTS, ...await chrome.storage.sync.get(DEFAULTS) };
}

async function updateStatus(extra = {}) {
  await chrome.storage.local.set({ lastCalendarSeenAt: Date.now(), ...extra });
}

async function closeAlarmWindow() {
  if (alarmWindowId == null) return;
  try { await chrome.windows.remove(alarmWindowId); } catch (_) {}
  alarmWindowId = null;
}

async function closeAlarmPresentation() {
  await closeAlarmWindow();
  if (activeNotificationId) {
    await chrome.notifications.clear(activeNotificationId).catch(() => {});
    activeNotificationId = null;
  }
}

async function triggerAlarm(rawText, source = 'unknown', force = false, sourceTabId = null) {
  const prefs = await settings();
  if (!prefs.enabled && !force) return { ignored: 'disabled' };
  const text = CalendarAlarmCore.normalizeText(rawText);
  const key = CalendarAlarmCore.dedupeKey(text);
  const last = recent.get(key) || 0;
  if (!force && Date.now() - last < 65000) return { ignored: 'duplicate' };
  recent.set(key, Date.now());
  for (const [oldKey, time] of recent) if (Date.now() - time > 120000) recent.delete(oldKey);

  const notificationId = `calendar-alarm-${Date.now()}`;
  activeNotificationId = notificationId;
  await chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Calendar reminder',
    message: text.slice(0, 240),
    contextMessage: source === 'test' ? 'Test alarm' : 'Google Calendar',
    priority: 2,
    requireInteraction: true,
    buttons: [{ title: 'Open Calendar' }, { title: 'Dismiss' }]
  });

  if (prefs.alarmWindow) {
    await closeAlarmWindow();
    const url = chrome.runtime.getURL(`interrupt.html?text=${encodeURIComponent(text)}&sound=${prefs.playSound ? '1' : '0'}&tab=${sourceTabId ?? ''}`);
    const win = await chrome.windows.create({ url, type: 'popup', width: 900, height: 600, focused: true });
    alarmWindowId = win.id;
    await chrome.windows.update(win.id, { focused: true, drawAttention: true }).catch(() => {});
  }
  await chrome.storage.local.set({ lastAlertAt: Date.now(), lastAlertText: text, lastAlertSource: source });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CALENDAR_TAB_ACTIVE') {
    updateStatus().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'CALENDAR_ALARM') {
    triggerAlarm(message.text, message.source, false, sender.tab?.id).then(sendResponse).catch((error) => sendResponse({ error: error.message }));
    return true;
  }
  if (message.type === 'TEST_ALARM') {
    triggerAlarm('Test event starts now', 'test', true).then(sendResponse).catch((error) => sendResponse({ error: error.message }));
    return true;
  }
  if (message.type === 'FOCUS_CALENDAR') {
    CalendarAlarmTabs.focusCalendarTab(chrome, message.tabId).then(async (result) => {
      await closeAlarmPresentation();
      sendResponse({ ok: true, result });
    }).catch((error) => sendResponse({ error: error.message }));
    return true;
  }
  if (message.type === 'SNOOZE_ALARM') {
    CalendarAlarmSnooze.schedule(chrome, {
      text: message.text,
      tabId: message.tabId
    }, message.seconds).then(async (result) => {
      await closeAlarmPresentation();
      sendResponse({ ok: true, when: result.when });
    }).catch((error) => sendResponse({ error: error.message }));
    return true;
  }
  if (message.type === 'DISMISS_ALARM') {
    closeAlarmPresentation().then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(CalendarAlarmSnooze.PREFIX)) return;
  const stored = await chrome.storage.local.get(alarm.name);
  const payload = stored[alarm.name];
  await chrome.storage.local.remove(alarm.name);
  if (!payload) return;
  await triggerAlarm(payload.text, 'snooze', true, payload.tabId);
});

chrome.notifications.onButtonClicked.addListener((id, index) => {
  if (!id.startsWith('calendar-alarm-')) return;
  if (index === 0) chrome.tabs.create({ url: 'https://calendar.google.com/calendar/u/0/r' });
  chrome.notifications.clear(id);
  closeAlarmWindow();
});
chrome.notifications.onClicked.addListener((id) => {
  if (id.startsWith('calendar-alarm-')) chrome.tabs.create({ url: 'https://calendar.google.com/calendar/u/0/r' });
});
chrome.windows.onRemoved.addListener((id) => { if (id === alarmWindowId) alarmWindowId = null; });
chrome.runtime.onInstalled.addListener(() => chrome.storage.sync.get(DEFAULTS).then((current) => chrome.storage.sync.set({ ...DEFAULTS, ...current })));
