const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function pngDimensions(file) {
  const image = fs.readFileSync(path.join(root, file));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  return [image.readUInt32BE(16), image.readUInt32BE(20)];
}

function loadCore() {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'alert-core.js'), 'utf8'), context);
  return context.globalThis.CalendarAlarmCore;
}

test('manifest defines a complete MV3 extension with minimal permissions', () => {
  const manifest = readJson('manifest.json');
  assert.equal(manifest.manifest_version, 3);
  assert.ok(Number(manifest.minimum_chrome_version) >= 111, 'MAIN-world content scripts require Chrome 111+');
  assert.equal(manifest.background.service_worker, 'background.js');
  assert.equal(manifest.action.default_popup, 'popup.html');
  assert.deepEqual(manifest.permissions.sort(), ['alarms', 'notifications', 'storage'].sort());
  assert.ok(!manifest.permissions.includes('tabs'));
  for (const size of ['16', '32', '48', '128']) {
    assert.equal(manifest.icons[size], `icons/icon-${size}.png`);
    assert.ok(fs.existsSync(path.join(root, manifest.icons[size])));
  }
});

test('normalizes alert text and rejects empty noise', () => {
  const core = loadCore();
  assert.equal(core.normalizeText('  Team   sync\nStarts now  '), 'Team sync Starts now');
  assert.equal(core.normalizeText(''), 'Calendar event');
});

test('recognizes Calendar alarm dialogs without matching ordinary dialogs', () => {
  const core = loadCore();
  assert.equal(core.looksLikeCalendarAlarm('Design review', ['Snooze', 'Dismiss']), true);
  assert.equal(core.looksLikeCalendarAlarm('Settings', ['Cancel', 'Save']), false);
  assert.equal(core.looksLikeCalendarAlarm('Standup starts in 10 minutes', []), true);
  for (const text of ['Reminder settings could not be saved', 'Dismiss changes?', 'Join meeting settings']) {
    assert.equal(core.looksLikeCalendarAlarm(text, []), false, text);
  }
});

test('accepts page-created Calendar notifications without reminder keywords', () => {
  const core = loadCore();
  assert.equal(core.shouldReportPageSignal('PAGE_NOTIFICATION', 'Design review: 10:00 AM – 10:30 AM'), true);
  assert.equal(core.shouldReportPageSignal('PAGE_ALERT', 'Reminder settings could not be saved'), false);
});

test('dedupe keys are stable inside a time bucket and change later', () => {
  const core = loadCore();
  assert.equal(core.dedupeKey(' Team sync ', 120_001), core.dedupeKey('Team  sync', 149_999));
  assert.notEqual(core.dedupeKey('Team sync', 120_001), core.dedupeKey('Team sync', 180_001));
});

test('alarm action focuses the originating Calendar tab before closing', () => {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'calendar-tabs.js'), 'utf8'), context);
  const focusCalendarTab = context.globalThis.CalendarAlarmTabs.focusCalendarTab;
  const calls = [];
  const chromeApi = {
    tabs: {
      get: async (id) => ({ id, windowId: 41, url: 'https://calendar.google.com/calendar/u/0/r' }),
      update: async (id, changes) => calls.push(['tab', id, changes]),
      query: async () => [],
      create: async () => { throw new Error('should not create'); }
    },
    windows: { update: async (id, changes) => calls.push(['window', id, changes]) }
  };
  return focusCalendarTab(chromeApi, 17).then((result) => {
    assert.equal(result, 'preferred');
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
      ['window', 41, { focused: true }],
      ['tab', 17, { active: true }]
    ]);
  });
});

test('alarm action reuses another Calendar tab before opening a new one', async () => {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'calendar-tabs.js'), 'utf8'), context);
  const focusCalendarTab = context.globalThis.CalendarAlarmTabs.focusCalendarTab;
  const calls = [];
  const chromeApi = {
    tabs: {
      get: async () => { throw new Error('gone'); },
      query: async () => [{ id: 23, windowId: 9, url: 'https://calendar.google.com/calendar/u/1/r' }],
      update: async (id, changes) => calls.push(['tab', id, changes]),
      create: async () => { throw new Error('should not create'); }
    },
    windows: { update: async (id, changes) => calls.push(['window', id, changes]) }
  };
  assert.equal(await focusCalendarTab(chromeApi, 17), 'existing');
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['window', 9, { focused: true }],
    ['tab', 23, { active: true }]
  ]);
});

test('snooze supports exactly 30s, 1m, 90s, and 2m', async () => {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'snooze.js'), 'utf8'), context);
  const snooze = context.globalThis.CalendarAlarmSnooze;
  assert.deepEqual([...snooze.DURATIONS], [30, 60, 90, 120]);

  const calls = [];
  const chromeApi = {
    storage: { local: { set: async (value) => calls.push(['store', value]) } },
    alarms: { create: async (name, options) => calls.push(['alarm', name, options]) }
  };
  const result = await snooze.schedule(chromeApi, {
    text: 'Team sync starts now',
    tabId: 17
  }, 90, 1_000_000);
  assert.equal(result.when, 1_090_000);
  assert.match(result.name, /^calendar-snooze-/);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['store', { [result.name]: { text: 'Team sync starts now', tabId: 17 } }],
    ['alarm', result.name, { when: 1_090_000 }]
  ]);
  await assert.rejects(() => snooze.schedule(chromeApi, { text: 'Nope' }, 45), /Unsupported snooze duration/);
});

test('alarm UI exposes all four snooze choices', () => {
  const html = fs.readFileSync(path.join(root, 'interrupt.html'), 'utf8');
  for (const [seconds, label] of [[30, '30 sec'], [60, '1 min'], [90, '90 sec'], [120, '2 min']]) {
    assert.match(html, new RegExp(`data-snooze="${seconds}"[^>]*>${label}`));
  }
});

test('alarm UI offers a close-only action that dismisses the presentation', () => {
  const html = fs.readFileSync(path.join(root, 'interrupt.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'interrupt.js'), 'utf8');
  assert.match(html, /<button[^>]+id="close"[^>]*>Close<\/button>/);
  assert.match(script, /querySelector\('#close'\).*DISMISS_ALARM/s);
});

test('alarm UI remains compact enough for the 600px alarm window', () => {
  const html = fs.readFileSync(path.join(root, 'interrupt.html'), 'utf8');
  assert.match(html, /\.bell\s*{[^}]*22vh/s);
  assert.match(html, /\.actions\s*{[^}]*gap:\s*12px/s);
  assert.match(html, /html\s*{[^}]*background:\s*#102b4c/s);
});

test('large alarm window uses Chrome native centering and requests attention', () => {
  const background = fs.readFileSync(path.join(root, 'background.js'), 'utf8');
  assert.match(background, /width:\s*900/);
  assert.match(background, /height:\s*600/);
  assert.match(background, /focused:\s*true/);
  assert.match(background, /drawAttention:\s*true/);
  assert.doesNotMatch(background, /\bleft:/);
  assert.doesNotMatch(background, /\btop:/);
});

test('page bridge replaces reminder alerts but preserves unrelated Calendar alerts', () => {
  const posted = [];
  const nativeAlerts = [];
  class NativeNotification {}
  const window = {
    alert: (message) => nativeAlerts.push(message),
    Notification: NativeNotification,
    postMessage: (message) => posted.push(message)
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'page-bridge.js'), 'utf8'), {
    window,
    location: { origin: 'https://calendar.google.com' }
  });

  for (const message of ['Could not save changes', 'Reminder settings could not be saved', 'Dismiss changes?', 'Join meeting settings']) {
    window.alert(message);
  }
  assert.deepEqual(nativeAlerts, ['Could not save changes', 'Reminder settings could not be saved', 'Dismiss changes?', 'Join meeting settings']);
  assert.deepEqual(posted, []);

  window.alert('Standup starts in 5 minutes');
  assert.deepEqual(nativeAlerts, ['Could not save changes', 'Reminder settings could not be saved', 'Dismiss changes?', 'Join meeting settings']);
  assert.equal(posted[0].type, 'PAGE_ALERT');
  assert.equal(posted[0].text, 'Standup starts in 5 minutes');
});

test('page bridge forwards Calendar notifications whose text is only an event title and time', () => {
  const posted = [];
  class NativeNotification {
    constructor(title, options) { this.title = title; this.options = options; }
  }
  const window = {
    alert: () => {},
    Notification: NativeNotification,
    postMessage: (message) => posted.push(message)
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'page-bridge.js'), 'utf8'), {
    window,
    location: { origin: 'https://calendar.google.com' }
  });

  const notification = new window.Notification('Design review', { body: '10:00 AM – 10:30 AM' });
  assert.equal(notification.title, 'Design review');
  assert.equal(posted[0].type, 'PAGE_NOTIFICATION');
  assert.equal(posted[0].text, 'Design review: 10:00 AM – 10:30 AM');
});

test('page bridge runs directly in the page MAIN world before Calendar starts', () => {
  const manifest = readJson('manifest.json');
  const bridge = manifest.content_scripts.find((entry) => entry.js.includes('page-bridge.js'));
  assert.ok(bridge, 'page bridge content script missing');
  assert.equal(bridge.world, 'MAIN');
  assert.equal(bridge.run_at, 'document_start');
  assert.ok(!manifest.web_accessible_resources, 'MAIN-world bridge should not need web-accessible injection');
});

test('all extension pages and scripts referenced by the manifest exist', () => {
  const manifest = readJson('manifest.json');
  const files = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.options_page,
    'calendar-tabs.js',
    'snooze.js',
    ...manifest.content_scripts.flatMap((entry) => entry.js),
  ];
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test('extension pages have titles, accessible controls, and no remote code', () => {
  for (const file of ['popup.html', 'options.html', 'interrupt.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)="https?:\/\//i);
  }
  const popup = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  assert.match(popup, /id="test-alarm"/);
  assert.match(popup, /id="calendar-status"/);
});

test('release metadata and privacy disclosures are store-ready', () => {
  const manifest = readJson('manifest.json');
  const pkg = readJson('package.json');
  const listing = fs.readFileSync(path.join(root, 'store-assets', 'LISTING.md'), 'utf8');
  const privacy = fs.readFileSync(path.join(root, 'PRIVACY.md'), 'utf8');
  assert.equal(pkg.version, manifest.version);
  assert.ok(manifest.description.length <= 132);
  assert.match(listing, /Single purpose/i);
  assert.match(listing, /Website content/i);
  assert.match(listing, /alarms[\s\S]*notifications[\s\S]*storage/i);
  assert.match(privacy, /not sold/i);
  assert.match(privacy, /stored locally/i);
});

test('Chrome Web Store artwork has the required dimensions', () => {
  assert.deepEqual(pngDimensions('store-assets/screenshot-alarm-1280x800.png'), [1280, 800]);
  assert.deepEqual(pngDimensions('store-assets/small-promo-440x280.png'), [440, 280]);
});

test('release packaging uses the validated allowlist builder', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.scripts.package, 'node scripts/build-release.mjs');
  const builder = fs.readFileSync(path.join(root, 'scripts', 'build-release.mjs'), 'utf8');
  assert.match(builder, /isFile\(\)/);
  assert.match(builder, /parent[^\n]+isSymbolicLink\(\)/s);
});
