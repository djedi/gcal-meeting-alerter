(function (root) {
  const DURATIONS = Object.freeze([30, 60, 90, 120]);
  const PREFIX = 'calendar-snooze-';

  async function schedule(chromeApi, payload, seconds, now = Date.now()) {
    if (!DURATIONS.includes(seconds)) throw new Error(`Unsupported snooze duration: ${seconds}`);
    const name = `${PREFIX}${now}-${Math.random().toString(36).slice(2, 8)}`;
    const when = now + seconds * 1000;
    await chromeApi.storage.local.set({ [name]: {
      text: String(payload.text || 'Calendar event'),
      tabId: Number.isInteger(payload.tabId) ? payload.tabId : null
    } });
    await chromeApi.alarms.create(name, { when });
    return { name, when };
  }

  root.CalendarAlarmSnooze = { DURATIONS, PREFIX, schedule };
})(globalThis);
