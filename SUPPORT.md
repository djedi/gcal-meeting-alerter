# Calendar Alarm Support

## Start with the built-in test

Open Calendar Alarm from Chrome's toolbar and select **Run test alarm**. If the test notification and alarm window appear, the extension is working and the remaining issue is likely in Google Calendar, Chrome site permissions, or operating-system notification settings.

## If the test alarm does not appear

1. Open **Extension settings** and confirm Calendar Alarm is enabled.
2. Confirm **Show alarm window** is enabled if you expect the large window.
3. Open `chrome://extensions`, find Calendar Alarm, and confirm it is enabled.
4. Reload the extension after installing an update.
5. Review Chrome and operating-system notification permissions.

## If tests work but real reminders do not

1. Keep a Google Calendar tab open. Calendar Alarm does not independently query your calendar or schedule reminders.
2. In Google Calendar, open **Settings → Notification settings** and enable desktop notifications or alerts.
3. Under the affected calendar, confirm event notifications are configured.
4. Allow notifications for `calendar.google.com` in Chrome site settings.
5. Allow Chrome notifications, banners/alerts, and sound in your operating system.
6. Refresh open Calendar tabs after installing or updating Calendar Alarm.

Google's Calendar notification help: https://support.google.com/calendar/answer/37242

## Known limitation

Calendar Alarm can amplify only reminder signals surfaced by an open Google Calendar page. Browser tab freezing or changes to Google Calendar's reminder implementation can prevent a page-based detector from seeing a reminder. The extension does not access the Google Calendar API.

## Privacy and bug reports

Review [PRIVACY.md](PRIVACY.md) before sending a report. Do not include private event titles or calendar details. Use the support contact on the Chrome Web Store listing and include:

- Chrome version
- Operating system
- Whether **Run test alarm** worked
- Whether a Google Calendar tab was open
- The extension version shown in `chrome://extensions`
