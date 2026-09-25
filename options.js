const defaults = { enabled: true, alarmWindow: true, playSound: true, keepCalendarOpen: true };
const fields = Object.keys(defaults);
async function load() { const values = await chrome.storage.sync.get(defaults); for (const key of fields) document.querySelector(`#${key}`).checked = values[key]; }
async function save() { const values = Object.fromEntries(fields.map((key) => [key, document.querySelector(`#${key}`).checked])); await chrome.storage.sync.set(values); const status=document.querySelector('#saved'); status.textContent='> config written.'; setTimeout(()=>status.textContent='',1500); }
for (const key of fields) document.querySelector(`#${key}`).addEventListener('change', save);
load();
