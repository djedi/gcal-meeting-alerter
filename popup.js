const statusTitle = document.querySelector('#calendar-status');
const statusDetail = document.querySelector('#status-detail');
const statusDot = document.querySelector('#status-dot');
const result = document.querySelector('#test-result');

async function renderStatus() {
  const prefs = await chrome.storage.sync.get({ enabled: true });
  const local = await chrome.storage.local.get(['lastCalendarSeenAt', 'lastAlertAt']);
  const recent = local.lastCalendarSeenAt && Date.now() - local.lastCalendarSeenAt < 10 * 60 * 1000;
  statusDot.className = `dot ${prefs.enabled && recent ? 'good' : 'warn'}`;
  statusTitle.textContent = !prefs.enabled ? 'Extension is paused' : recent ? 'Calendar detected' : 'Open Google Calendar';
  statusDetail.textContent = !prefs.enabled ? 'Enable it in Extension settings.' : recent ? 'The detector has checked in recently.' : 'Calendar must remain open for browser reminders to work.';
}

document.querySelector('#test-alarm').addEventListener('click', async () => {
  result.textContent = 'Sending test…';
  const response = await chrome.runtime.sendMessage({ type: 'TEST_ALARM' });
  result.textContent = response?.error ? `Test failed: ${response.error}` : 'Test sent. Check for the alarm window and notification.';
});
document.querySelector('#open-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
renderStatus();
