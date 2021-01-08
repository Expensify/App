# [Expensify.cash](https://expensify.cash) GitHub Workflows

## Security Rules 🔐
1. Do **not** use `pull_request_target` trigger unless an external fork needs access to secrets, or a _write_ `GITHUB_TOKEN`.
1. Do **not ever** write a `pull_request_target` trigger with an explicit PR checkout, e.g. using `actions/checkout@v2`. This is [discussed further here](https://securitylab.github.com/research/github-actions-preventing-pwn-requests)
1. **Do use** the `pull_request` trigger as it does not send internal secrets and only grants a _read_ `GITHUB_TOKEN`.   
1. If an external action needs access to any secret (`GITHUB_TOKEN` or internal secret), use the commit hash of the workflow to prevent a modification of underlying source code at that version. For example:
    1. **Bad:** `hmarr/auto-approve-action@v2.0.0` Relies on the tag
    1. **Good:** `hmarr/auto-approve-action@7782c7e2bdf62b4d79bdcded8332808fd2f179cd` Explicit Git hash
1. When creating secrets, use tightly scoped secrets that only allow access to that specific action's requirement
1. Review all modifications to our workflows with extra scrutiny, it is important to get it correct the first time.
1. Test workflow changes in your own public fork, for example: https://github.com/Andrew-Test-Org/Public-Test-Repo
1. Only trusted users will be allowed write access to the repository, however, it's good to add logic checks in actions to prevent human error.

## Further Reading 📖
1. https://securitylab.github.com/research/github-actions-preventing-pwn-requests
1. https://stackoverflow.com/a/62143130/1858217

## Secrets
The GitHub workflows require a large list of secrets to deploy, notify and test the code:
1. `LARGE_SECRET_PASSPHRASE` - decrypts secrets stored in various encrypted files stored in GitHub repository:
   1. `android/app/my-upload-key.keystore.gpg`
   2. `android/app/android-fastlane-json-key.json.gpg`
   3. `ios/chat_expensify_appstore.mobileprovision`
   4. `ios/Certificates.p12.gpg`
2. `SLACK_WEBHOOK` - Sends Slack notifications via Slack WebHook https://expensify.slack.com/services/B01AX48D7MM
3. `OS_BOTIFY_TOKEN` - Personal access token for @OSBotify user in GitHub
4. `CSC_LINK` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
5. `CSC_KEY_PASSWORD` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
6. `APPLE_ID` - Required for notarizing desktop code in `desktop/notarize.js`
7. `APPLE_ID_PASSWORD` - Required for notarizing desktop code in `desktop/notarize.js`
8. `AWS_ACCESS_KEY_ID` - Required for hosting website and desktop compiled code
9. `AWS_SECRET_ACCESS_KEY` - Required for hosting website and desktop compiled code
10. `CLOUDFLARE_TOKEN` - Required for hosting website
11. `APPLE_CONTACT_EMAIL` - Email used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
12. `APPLE_CONTACT_PHONE` - Phone number used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
13. `APPLE_DEMO_EMAIL` - Demo account email used for https://appstoreconnect.apple.com/
14. `APPLE_DEMO_PASSWORD` - Demo account password used for https://appstoreconnect.apple.com/
