# Chrome Web Store release checklist

## Already prepared in this repository

- [x] Manifest V3 package with a root-level manifest.json
- [x] Narrow permissions and calendar.google.com-only host access
- [x] 16, 32, 48, and 128 px runtime icons
- [x] Detailed store listing and permission justifications
- [x] Privacy policy source and in-extension privacy disclosure
- [x] Required 1280×800 screenshot
- [x] 440×280 small promo tile
- [x] Automated syntax, behavior, metadata, artwork, and ZIP validation
- [x] Upload ZIP excludes tests, source artwork, store artwork, and development files

## Publisher setup — manual because it uses your account

- [ ] Register or confirm the Chrome Web Store developer account and one-time registration fee.
- [ ] Choose a public publisher name.
- [ ] Host PRIVACY.md at a stable public HTTPS URL and enter that URL in the Privacy tab.
- [ ] Host SUPPORT.md at a stable public HTTPS URL and use it as the listing's support URL.
- [ ] Enter a monitored support email in the Account tab.
- [ ] Optionally provide a support/homepage URL and verify the publisher website through Google Search Console.

## Upload and listing

- [ ] Run `npm run release`.
- [ ] Upload `calendar-alarm.zip` in the Chrome Web Store Developer Dashboard.
- [ ] Copy product details and detailed description from `store-assets/LISTING.md`.
- [ ] Select Productivity and English (United States).
- [ ] Upload `store-assets/screenshot-alarm-1280x800.png`.
- [ ] Upload `store-assets/small-promo-440x280.png`.
- [ ] Confirm the 128 px icon rendered from the package.

## Privacy tab

- [ ] Paste the Single purpose text from `store-assets/LISTING.md`.
- [ ] Paste each permission justification exactly.
- [ ] Declare Website content because reminder text is processed locally.
- [ ] State that Calendar Alarm does not transmit reminder text off-device.
- [ ] Certify the Limited Use disclosures.
- [ ] Confirm dashboard disclosures, the hosted privacy policy, and extension behavior agree.

## Distribution and review

- [ ] Choose Public or Unlisted distribution and the intended regions.
- [ ] Confirm the item is not designed for children and contains no mature content.
- [ ] Use deferred publishing for the first submission so approval does not immediately make it public.
- [ ] Submit for review.
- [ ] Monitor the publisher email for reviewer questions or rejection details.
- [ ] After approval, install the staged store build in a clean Chrome profile and run the test alarm before publishing.

## Automating later releases

The first store item, listing/privacy setup, visibility selection, and initial publication remain manual. After that, load the Hermes `chrome-web-store-publishing` skill to use the official Chrome Web Store API v2.

Required protected environment variables:

- `CWS_CLIENT_ID`
- `CWS_CLIENT_SECRET`
- `CWS_REFRESH_TOKEN`
- `CWS_PUBLISHER_ID`
- `CWS_EXTENSION_ID`

Keep validation, upload, and review submission separate:

```sh
CWS="$HOME/.hermes/skills/devops/chrome-web-store-publishing/scripts/cws_publish.py"
python3 "$CWS" doctor --zip calendar-alarm.zip
python3 "$CWS" status
python3 "$CWS" upload --zip calendar-alarm.zip --confirm-upload --wait
python3 "$CWS" submit --confirm-submit
```

Uploading changes the draft package but does not begin review. Submission is a separate external action and should receive separate approval.
