# Calendar Alarm Privacy Policy

Effective: August 20, 2026

Calendar Alarm is a browser extension that makes Google Calendar reminders harder to miss. It is designed to work locally in the browser without analytics, advertising, accounts, or a developer-operated server.

## Data the extension handles

Calendar Alarm examines text passed to page-created alerts, page-created Web Notifications, and reminder dialogs displayed by `calendar.google.com`. Reminder-like alerts and dialogs are used as signals; unrelated alert/dialog text is discarded immediately. Because Google Calendar uses page-created Web Notifications as its desktop reminder channel and their titles may contain only an event name, Calendar Alarm treats every page-created Web Notification on `calendar.google.com` as a reminder signal. Notification text can include an event title, time, or other text entered in Google Calendar.

The extension stores the following information:

- Reminder text in Chrome local storage for the most recent alert and temporarily while a snoozed reminder is pending.
- Local diagnostic timestamps indicating when Calendar was last detected and when an alert last appeared.
- Settings for whether the extension is enabled, whether to show the alarm window, and whether to play sound. Chrome may sync these settings through the user's signed-in Chrome profile.

Reminder text is stored locally on the user's device. It is not sent to the developer, an analytics provider, an advertising network, or any other third party by Calendar Alarm.

## How data is used

Data is used only to provide Calendar Alarm's single purpose: detecting supported Google Calendar reminders and presenting persistent local alerts, including user-requested snoozes.

User data is not sold. Calendar Alarm does not use data for advertising, credit decisions, profiling, or purposes unrelated to reminder alerts. The developer does not allow humans to read users' reminder data because the extension never transmits that data to the developer.

## Sharing and disclosure

Calendar Alarm does not share or transfer reminder text or browsing activity. Chrome itself may sync the extension's three preference settings when Chrome Sync is enabled; that service is governed by Google's privacy policy.

## Retention and deletion

A pending snooze payload is deleted after the snoozed reminder fires. The most recent alert text and diagnostic timestamps remain in Chrome local extension storage until they are replaced, the extension's local data is cleared, or the extension is uninstalled. Synced preferences can be removed through Chrome Sync controls.

## Security

Calendar Alarm contains no remote code and makes no developer-operated network requests. It runs only on `calendar.google.com` and uses the minimum Chrome permissions needed for local alarms, notifications, and storage.

## Chrome Web Store Limited Use disclosure

Calendar Alarm's use of information received from Google APIs and Google services adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data access is limited to what is necessary to provide the extension's clearly disclosed reminder-amplification feature.

## Changes and contact

Material changes will be reflected by updating this policy's effective date. For privacy questions, use the developer support contact shown on Calendar Alarm's Chrome Web Store listing.
