const params = new URLSearchParams(location.search);
const rawTabId = params.get('tab');
const sourceTabId = rawTabId === null || rawTabId === '' ? null : Number(rawTabId);
const validTabId = Number.isInteger(sourceTabId) ? sourceTabId : null;
const eventText = params.get('text') || 'Calendar event';
document.querySelector('#event-text').textContent = eventText;

document.querySelector('#dismiss').addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({
    type: 'FOCUS_CALENDAR',
    tabId: validTabId
  });
  if (response?.error) {
    document.querySelector('#dismiss').textContent = 'Could not open Calendar — try again';
    return;
  }
  window.close();
});

document.querySelector('#close').addEventListener('click', async () => {
  const button = document.querySelector('#close');
  button.disabled = true;
  const response = await chrome.runtime.sendMessage({ type: 'DISMISS_ALARM' });
  if (response?.error) {
    button.disabled = false;
    button.textContent = 'Could not close — try again';
    return;
  }
  window.close();
});

document.querySelectorAll('[data-snooze]').forEach((button) => {
  button.addEventListener('click', async () => {
    const seconds = Number(button.dataset.snooze);
    button.disabled = true;
    button.textContent = 'Snoozing…';
    const response = await chrome.runtime.sendMessage({
      type: 'SNOOZE_ALARM',
      text: eventText,
      tabId: validTabId,
      seconds
    });
    if (response?.error) {
      button.disabled = false;
      button.textContent = 'Try again';
      return;
    }
    window.close();
  });
});

if (params.get('sound') === '1') {
  try {
    const audio = new AudioContext();
    const play = (delay, frequency) => { const oscillator=audio.createOscillator(); const gain=audio.createGain(); oscillator.frequency.value=frequency; gain.gain.setValueAtTime(0.0001,audio.currentTime+delay); gain.gain.exponentialRampToValueAtTime(0.16,audio.currentTime+delay+0.02); gain.gain.exponentialRampToValueAtTime(0.0001,audio.currentTime+delay+0.28); oscillator.connect(gain).connect(audio.destination); oscillator.start(audio.currentTime+delay); oscillator.stop(audio.currentTime+delay+0.3); }; play(0,660); play(.35,880); play(.7,660);
  } catch (_) {}
}
document.querySelector('#dismiss').focus();
