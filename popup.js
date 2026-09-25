const $ = (selector) => document.querySelector(selector);
const statusTitle = $('#calendar-status');
const statusDetail = $('#status-detail');
const statusDot = $('#status-dot');
const result = $('#test-result');
const enabledToggle = $('#enabled');

let typing = null;
function typeLog(text) {
  clearInterval(typing);
  let index = 0;
  result.textContent = '';
  typing = setInterval(() => {
    result.textContent = text.slice(0, ++index);
    if (index >= text.length) clearInterval(typing);
  }, 18);
}

function setMark(id, state, symbol, detail) {
  const mark = $(`#${id}`);
  mark.className = `mark ${state}`;
  mark.textContent = symbol;
  $(`#${id}-detail`).textContent = detail;
}

function timeAgo(time) {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} hr ago` : new Date(time).toLocaleDateString();
}

async function renderStatus() {
  const prefs = await chrome.storage.sync.get({ enabled: true, keepCalendarOpen: true });
  const local = await chrome.storage.local.get(['lastCalendarSeenAt', 'lastAlertAt', 'lastAlertText', 'notificationPermission']);
  const recent = local.lastCalendarSeenAt && Date.now() - local.lastCalendarSeenAt < 10 * 60 * 1000;
  enabledToggle.checked = prefs.enabled;
  $('#enabled-label').textContent = prefs.enabled ? 'ARMED' : 'OFF';

  statusDot.className = `pulse ${!prefs.enabled ? 'off' : recent ? 'good' : 'warn'}`;
  statusTitle.textContent = !prefs.enabled ? 'Disarmed' : recent ? 'Watching for meetings' : 'Calendar not detected';
  statusDetail.textContent = !prefs.enabled
    ? 'Click OFF to re-arm.'
    : recent ? 'You will be interrupted when a meeting starts.' : 'Open Google Calendar so reminders can fire.';

  if (recent) setMark('check-tab', 'good', 'OK', prefs.keepCalendarOpen ? 'Open and kept awake automatically.' : 'Open. Keep it open for reminders to fire.');
  else setMark('check-tab', 'warn', '!!', prefs.keepCalendarOpen ? 'Will open automatically within a minute.' : 'No Calendar tab found — use “Open Calendar” below.');

  const permission = local.notificationPermission;
  if (permission === 'granted') setMark('check-permission', 'good', 'OK', 'Allowed.');
  else if (permission === 'denied') setMark('check-permission', 'bad', 'XX', 'Blocked. Click the lock icon on calendar.google.com → Site settings → Notifications → Allow.');
  else if (permission === 'default') setMark('check-permission', 'warn', '!!', 'Not yet allowed. Accept Calendar’s prompt, or allow it in Site settings.');
  else setMark('check-permission', '', '??', 'Unknown until a Calendar tab checks in.');

  $('#last-alert').innerHTML = '';
  if (local.lastAlertAt) {
    const label = document.createElement('b');
    label.textContent = (local.lastAlertText || 'Calendar event').slice(0, 60);
    $('#last-alert').append('last_alarm: ', label, ` (${timeAgo(local.lastAlertAt)})`);
  }
}

enabledToggle.addEventListener('change', async () => {
  await chrome.storage.sync.set({ enabled: enabledToggle.checked });
  renderStatus();
});

$('#test-alarm').addEventListener('click', async () => {
  typeLog('> dispatching test alarm...');
  const response = await chrome.runtime.sendMessage({ type: 'TEST_ALARM' });
  typeLog(response?.error ? `> ERR ${response.error}` : '> OK. alarm window deployed.');
});
$('#open-calendar').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'OPEN_CALENDAR' });
  window.close();
});
$('#open-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
chrome.storage.onChanged.addListener(renderStatus);
renderStatus();
