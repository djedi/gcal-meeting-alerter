# Security Policy

## Supported versions

Security fixes are applied to the latest released version of Calendar Alarm. Users should keep the extension updated and use a currently supported Chrome release.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting from the repository's **Security** tab:

https://github.com/djedi/gcal-meeting-alerter/security/advisories/new

Include:

- A clear description of the issue and potential impact.
- Reproduction steps or a minimal proof of concept.
- The affected extension and Chrome versions.
- Any suggested remediation, if known.

Do not include real calendar event text, OAuth credentials, Chrome profile data, or other users' information.

You should receive an acknowledgement within seven days. Please allow a reasonable remediation window before public disclosure.

## Scope

Security-sensitive areas include:

- Google Calendar page/content-script boundaries.
- Extension message validation.
- Permission or host-access expansion.
- Data persistence or unexpected transmission.
- Remote-code or content-security-policy bypasses.
- Release-package or publishing credential exposure.

Ordinary reminder-detection misses and UI bugs belong in public issues unless they expose private data or create a security boundary failure.
