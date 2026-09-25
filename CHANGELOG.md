# Changelog

All notable changes to Calendar Alarm will be documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [2.3.0] - 2026-09-25

### Fixed

- Detect reminders Google Calendar shows through `ServiceWorkerRegistration.showNotification()`, which bypassed the `Notification` constructor hook.
- Detect reminder dialogs whose content is filled in after insertion, or that reuse an existing dialog node.
- Reload already-open Calendar tabs on install/update so detection works without a manual refresh.
- Keep-open no longer pins a duplicate Calendar tab on each extension reload (explicit `calendar.google.com` host permission, loading-tab detection, and serialized checks).

### Added

- "Keep Google Calendar open" setting (on by default): opens a pinned background Calendar tab when none is open and prevents Chrome Memory Saver from discarding Calendar tabs.
- The alarm window now opens maximized and its chime repeats until you interact (up to two minutes).
- Notification clicks focus the existing Calendar tab instead of opening a new one.
- Terminal / Matrix-style theme across the popup, settings page, and alarm window (shared `terminal.css` and `rain.js`), with a live setup checklist and the Desktop notifications recommendation.
- Alarm window keyboard shortcuts: Enter opens Calendar, Esc closes.
- New neon terminal-style icon, with simplified 16px/32px versions for legibility in the toolbar.

## [2.2.1] - 2026-08-20

### Fixed

- Restored amplification for Google Calendar desktop notifications whose title/body contain only an event name and time, without explicit words such as “reminder” or “starts in.”
- Kept strict filtering for blocking page alerts so unrelated Calendar errors and settings prompts still use their native behavior.

## [2.2.0] - 2026-08-17

### Added

- Manifest V3 architecture with layered Google Calendar reminder detection.
- High-visibility Chrome notifications and an optional focused alarm window.
- Short durable snoozes using `chrome.alarms`.
- Open Calendar and close-only alarm actions.
- Built-in test alarm, settings, diagnostics, privacy disclosure, and support guide.
- Chrome Web Store listing artwork, release validation, and allowlisted ZIP packaging.

### Security and privacy

- No analytics, advertising, account system, remote code, or developer-operated server.
- Calendar access is limited to `https://calendar.google.com/*`.
- Unrelated page alerts are preserved and unrelated notification text is discarded immediately.
- Reminder data remains in Chrome local storage only as described in [PRIVACY.md](PRIVACY.md).

[2.2.1]: https://github.com/djedi/gcal-meeting-alerter/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/djedi/gcal-meeting-alerter/releases/tag/v2.2.0
