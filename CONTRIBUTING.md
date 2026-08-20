# Contributing to Calendar Alarm

Thanks for helping make Calendar reminders harder to miss.

## Before opening an issue

- Search existing issues first.
- For missed reminders, run the built-in **Run test alarm** action and follow [SUPPORT.md](SUPPORT.md).
- Do not include private event titles, calendar details, OAuth credentials, or Chrome profile data.
- Report security issues privately as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Development setup

Requirements:

- Chrome 111 or newer
- Node.js 20 or newer
- No runtime npm dependencies

Clone the repository and run the quality gate:

```sh
git clone git@github.com:djedi/gcal-meeting-alerter.git
cd gcal-meeting-alerter
npm run check
```

Load the repository as an unpacked extension from `chrome://extensions`, enable Developer mode, and refresh open Google Calendar tabs after each extension reload.

## Making changes

1. Create a focused branch from `main`.
2. Keep permissions minimal. New permissions require a clear user-facing need and updated privacy/listing disclosures.
3. Keep all executable code inside the extension package; remote code is not permitted.
4. Add tests before changing behavior.
5. Run:

   ```sh
   npm run check
   npm run package
   ```

6. Test the unpacked extension in Chrome, including the toolbar popup and **Run test alarm** flow.
7. Open a pull request explaining the behavior change, privacy/permission impact, and verification performed.

## Code style

- Match the existing dependency-free JavaScript style.
- Prefer small pure helpers for logic that can be tested with Node's built-in test runner.
- Preserve unrelated Google Calendar alerts and native notification behavior.
- Avoid broad reminder heuristics that can match settings or error messages.
- Keep extension pages accessible and free of remote scripts or styles.

## Pull requests

A pull request should include:

- A concise problem statement and solution.
- Tests for behavioral changes.
- Screenshots for visible UI changes.
- Any manifest, permission, privacy, or store-listing implications.
- Confirmation that `npm run check` passes.

By contributing, you agree that your contributions are licensed under the repository's MIT License.
