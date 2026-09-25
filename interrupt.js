const params = new URLSearchParams(location.search);
const rawTabId = params.get('tab');
const sourceTabId = rawTabId === null || rawTabId === '' ? null : Number(rawTabId);
const validTabId = Number.isInteger(sourceTabId) ? sourceTabId : null;
const eventText = params.get('text') || 'Calendar event';
const eventHeading = document.querySelector('#event-text');
eventHeading.setAttribute('aria-label', eventText);
if (matchMedia('(prefers-reduced-motion: reduce)').matches) eventHeading.textContent = eventText;
else {
  let typed = 0;
  eventHeading.textContent = '';
  const typer = setInterval(() => {
    eventHeading.textContent = eventText.slice(0, ++typed);
    if (typed >= eventText.length) clearInterval(typer);
  }, 28);
}

const clock = document.querySelector('#clock');
const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
tick();
setInterval(tick, 1000);

document.querySelector('#dismiss').addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({
    type: 'FOCUS_CALENDAR',
    tabId: validTabId
  });
  if (response?.error) {
    document.querySelector('#dismiss').textContent = '> ERR: could not open calendar. retry';
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
    button.textContent = 'ERR: could not close. retry';
    return;
  }
  window.close();
});

document.querySelectorAll('[data-snooze]').forEach((button) => {
  button.addEventListener('click', async () => {
    const seconds = Number(button.dataset.snooze);
    button.disabled = true;
    button.textContent = 'zzz…';
    const response = await chrome.runtime.sendMessage({
      type: 'SNOOZE_ALARM',
      text: eventText,
      tabId: validTabId,
      seconds
    });
    if (response?.error) {
      button.disabled = false;
      button.textContent = 'retry';
      return;
    }
    window.close();
  });
});

let stopSound = () => {};
if (params.get('sound') === '1') {
  try {
    const audio = new AudioContext();
    const play = (delay, frequency) => { const oscillator=audio.createOscillator(); const gain=audio.createGain(); oscillator.frequency.value=frequency; gain.gain.setValueAtTime(0.0001,audio.currentTime+delay); gain.gain.exponentialRampToValueAtTime(0.16,audio.currentTime+delay+0.02); gain.gain.exponentialRampToValueAtTime(0.0001,audio.currentTime+delay+0.28); oscillator.connect(gain).connect(audio.destination); oscillator.start(audio.currentTime+delay); oscillator.stop(audio.currentTime+delay+0.3); };
    const chime = () => { audio.resume().catch(() => {}); play(0,660); play(.35,880); play(.7,660); };
    // Keep chiming until the user responds, for at most two minutes.
    chime();
    const repeat = setInterval(chime, 4000);
    const limit = setTimeout(() => clearInterval(repeat), 120000);
    stopSound = () => { clearInterval(repeat); clearTimeout(limit); };
  } catch (_) {}
}
document.addEventListener('pointerdown', () => stopSound(), { once: true });
document.addEventListener('keydown', () => stopSound(), { once: true });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.querySelector('#close').click();
});
document.querySelector('#dismiss').focus();
