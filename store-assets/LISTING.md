# Chrome Web Store listing

## Product details

- Name: Calendar Alarm
- Summary: Make Google Calendar reminders harder to miss with high-visibility notifications and an optional alarm window.
- Category: Productivity
- Language: English (United States)

## Detailed description

Calendar Alarm makes Google Calendar reminders harder to miss.

When Google Calendar displays a supported reminder, Calendar Alarm requests a long-lived Chrome notification and—if you choose—a large focused alarm window with optional sound. Open Calendar, close the reminder, or snooze it for 30 seconds, 1 minute, 90 seconds, or 2 minutes.

Features:

- Long-lived Chrome notifications where the browser and operating system support them
- Optional full-screen alarm window with a repeating chime
- Keeps a pinned Google Calendar tab open and awake so reminders can fire
- Short, durable snoozes powered by Chrome alarms
- An Open Calendar button in the alarm window that returns to the Calendar tab that raised the reminder
- A separate Close action when you do not want to open Calendar or snooze
- Built-in test alarm and troubleshooting status
- Configurable alarm window and sound
- No analytics, ads, account, subscription, or external server

Important limitation: Calendar Alarm amplifies reminders that Google Calendar surfaces in an open Calendar page. It does not access the Google Calendar API, independently read your calendar, or create its own reminder schedule. Keep a Google Calendar tab open and make sure Calendar, Chrome, and operating-system notifications are enabled.

Privacy by design: reminder text is processed and stored locally in Chrome only as needed to show the latest alert or a pending snooze. It is not sent to the developer or third parties.

Built by Dustin Davis. Feature ideas and questions are welcome on X: @DustinDavis (https://x.com/DustinDavis). Open source at https://github.com/djedi/gcal-meeting-alerter

Google Calendar is a trademark of Google LLC. Calendar Alarm is an independent extension and is not affiliated with or endorsed by Google.

## Single purpose

Detect supported reminder signals displayed by Google Calendar and amplify them with persistent local notifications, an optional focused alarm window, and user-requested short snoozes.

## Permission justifications

- alarms: Schedules the four user-selected snooze durations using durable one-shot Chrome alarms.
- notifications: Creates persistent local reminder notifications and clears them when the reminder is handled.
- storage: Saves the three user preferences, local diagnostic timestamps, the most recent alert text, and pending snooze payloads.
- Host access to https://calendar.google.com/*: Runs the reminder detector only on Google Calendar so the extension can recognize supported reminder dialogs and page-created reminder signals.

The extension does not request the tabs permission. Chrome permits opening and focusing tabs through the user-facing extension workflow without that broad permission.

## Privacy practices dashboard

Data handled:

- Website content: Calendar Alarm locally examines page-created alert and notification text plus reminder-dialog content on calendar.google.com. Unrelated alert/dialog text is discarded immediately. Every page-created Web Notification on Calendar is treated as a reminder signal because its title may contain only an event name; qualifying text can include an event title and time.

Data handling declarations:

- Used only for the extension's single purpose.
- Not sold to third parties.
- Not used or transferred for purposes unrelated to the single purpose.
- Not used or transferred for creditworthiness or lending.
- Reminder text is not transmitted off the user's device by Calendar Alarm.
- Preference settings may be synced by Chrome when the user enables Chrome Sync.
- Certify compliance with the Chrome Web Store User Data Policy's Limited Use requirements.

## Store artwork

- Screenshot: store-assets/screenshot-alarm-1280x800.png
- Small promo tile: store-assets/small-promo-440x280.png
- Store icon: icons/icon-128.png

## Support copy

Calendar Alarm amplifies reminders shown by an open Google Calendar tab. If an alert does not appear, run the extension's test alarm first, then verify Calendar event notifications, Chrome site notification permission for calendar.google.com, operating-system Chrome notifications, and that a Calendar tab remains open.
