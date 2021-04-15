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
1. `LARGE_SECRET_PASSPHRASE` - decrypts secrets stored in various encrypted files stored in GitHub repository. To create updated versions of these encrypted files, refer to steps 1-4 of [this encrypted secrets help page](https://docs.github.com/en/actions/reference/encrypted-secrets#limits-for-secrets) using the `LARGE_SECRET_PASSPHRASE`.
   1. `android/app/my-upload-key.keystore.gpg`
   2. `android/app/android-fastlane-json-key.json.gpg`
   3. `ios/chat_expensify_appstore.mobileprovision`
   4. `ios/Certificates.p12.gpg`
2. `SLACK_WEBHOOK` - Sends Slack notifications via Slack WebHook https://expensify.slack.com/services/B01AX48D7MM
3. `OS_BOTIFY_TOKEN` - Personal access token for @OSBotify user in GitHub
4. `CLA_BOTIFY_TOKEN` - Personal access token for @CLABotify user in GitHub   
5. `CSC_LINK` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
6. `CSC_KEY_PASSWORD` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
7. `APPLE_ID` - Required for notarizing desktop code in `desktop/notarize.js`
8. `APPLE_ID_PASSWORD` - Required for notarizing desktop code in `desktop/notarize.js`
9. `AWS_ACCESS_KEY_ID` - Required for hosting website and desktop compiled code
10. `AWS_SECRET_ACCESS_KEY` - Required for hosting website and desktop compiled code
11. `CLOUDFLARE_TOKEN` - Required for hosting website
12. `APPLE_CONTACT_EMAIL` - Email used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
13. `APPLE_CONTACT_PHONE` - Phone number used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
14. `APPLE_DEMO_EMAIL` - Demo account email used for https://appstoreconnect.apple.com/
15. `APPLE_DEMO_PASSWORD` - Demo account password used for https://appstoreconnect.apple.com/

## Actions

All these _workflows_ are comprised of atomic _actions_. Most of the time, we can use pre-made and independently maintained actions to create powerful workflows that meet our needs. However, when we want to do something very specific or have a more complex or robust action in mind, we can create our own _actions_.

All our actions are stored in the neighboring directory [`.github/actions`](https://github.com/Expensify/Expensify.cash/tree/main/.github/actions). Each action is a module comprised of three parts:

1) An [action metadata file](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action#creating-an-action-metadata-file) called `action.yml`. This describes the action, gives it a name, and defines its inputs and outputs.
2) A Node.js script, whose name matches the module. This is where you can implement the custom logic for your action.
3) A compiled file called index.js. This is a compiled output of the file from (2) and should _NEVER_ be directly modified.

### Why do actions need to be compiled?

From the [GitHub Actions documentation](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github):

> GitHub downloads each action run in a workflow during runtime and executes it as a complete package of code before you can use workflow commands like run to interact with the runner machine. This means you must include any package dependencies required to run the JavaScript code. You'll need to check in the toolkit core and github packages to your action's repository.

If you make any changes to an action's implementation, you must always recompile it in order for the changes to take effect. The action metadata file should use the compiled node.js executable script (`index.js`), _not_ the source file.

### How are actions compiled?

In order to bundle actions with their dependencies into a single Node.js executable script, we use [`ncc`](https://github.com/vercel/ncc). In order to make this easier, we've added an `npm` script to `package.json`, so you can just run `npm run gh-actions-build`. If you create a new action, make sure that you update `.github/scripts/buildActions.sh` to include your new action. Also, be sure that you always run `npm install` before recompiling if you added new dependencies, or they won't be included in the bundled executable. :)

### Important tips about creating GitHub Actions

- When calling your GitHub Action from one of our workflows, you must:
    - First call `@actions/checkout`.
    - Use the absolute path of the action in GitHub, including the repo name, path, and branch ref, like so:
      ```yaml
      - name: Generate Version
        uses: Expensify/Expensify.cash/.github/actions/bumpVersion@main
      ```
       Do not try to use a relative path.
- Confusingly, paths in action metadata files (`action.yml`) _must_ use relative paths.
- You can't use any dynamic values or environment variables in a `uses` statement
