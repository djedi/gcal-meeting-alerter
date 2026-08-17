# Changelog

All notable changes to Calendar Alarm will be documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

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

[2.2.0]: https://github.com/djedi/gcal-meeting-alerter/releases/tag/v2.2.0
