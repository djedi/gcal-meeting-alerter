(function (root) {
  const ALARM_WORDS = /(?:\b(?:starts?|starting)\s+(?:now\b|in\b)|\b(?:event|calendar)\s+reminder\b|\breminder\s*[:—-]\s*\S|\bjoin\s+now\b)/i;

  function normalizeText(value) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean || 'Calendar event';
  }

  function looksLikeCalendarAlarm(text, actions) {
    const normalized = normalizeText(text);
    const labels = (actions || []).map(normalizeText).join(' ');
    return /snooze/i.test(labels) && /dismiss|close/i.test(labels) || ALARM_WORDS.test(normalized);
  }

  function shouldReportPageSignal(type, text) {
    return type === 'PAGE_NOTIFICATION' || looksLikeCalendarAlarm(text, []);
  }

  function hash(value) {
    let result = 2166136261;
    for (const character of value) {
      result ^= character.charCodeAt(0);
      result = Math.imul(result, 16777619);
    }
    return (result >>> 0).toString(36);
  }

  function dedupeKey(text, now) {
    const bucket = Math.floor(Number(now || Date.now()) / 60000);
    return `${hash(normalizeText(text).toLowerCase())}:${bucket}`;
  }

  root.CalendarAlarmCore = { normalizeText, looksLikeCalendarAlarm, shouldReportPageSignal, dedupeKey };
})(globalThis);
