# [New Expensify](https://new.expensify.com) GitHub Workflows

## Important tip for creating GitHub Workflows
All inputs and outputs to GitHub Actions and any data passed between jobs or workflows is JSON-encoded (AKA, strings). Keep this in mind whenever writing GitHub workflows – you may need to JSON-decode variables to access them accurately. Here's an example of a common way to misuse GitHub Actions data:



```yaml
name: CI
on: pull_request
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - id: myTrueAction
        uses: Expensify/my-action-outputs-true@main

      - id: myFalseAction
        uses: Expensify/my-action-outputs-false@main

      # This correctly outputs `true`, but it's a string
      - run: echo ${{ steps.myTrueAction.outputs.isTrue }}

      # This correctly outputs `false`, but it's a string
      - run: echo ${{ steps.myFalseAction.outputs.isFalse }}

      # This correctly outputs `true`, and it's a boolean
      - run: echo ${{ true == true }}

      # This correctly outputs `false`, and it's a boolean.
      - run: echo ${{ true == false }}

      # Watch out! This seems like it should be true, but it's false!
      # What we have here is `'false' || true`, and since the first half is a string the expression resolves to 'false'
      - run: echo ${{ steps.myFalseAction.outputs.isFalse || github.actor == 'roryabraham' }}
```

We've found that the best way to avoid this pitfall is to always wrap any reference to the output of an action in a call to `fromJSON`. This should force it to resolve to the expected type.

**Note:** Action inputs and outputs aren't the only thing that's JSON-encoded! Any data passed between jobs via a `needs` parameter is also JSON-encoded!

## Fast fetch
Due to the large, ever-growing history of this repo, do not do any full-fetches of the repo:

```yaml
# Bad
- uses: actions/checkout@v3
  with:
    fetch-depth: 0

# Good
- uses: actions/checkout@v3
```

```sh
# Bad
git fetch origin # This will fetch all history of all branches and tags
git fetch origin main # This will fetch the full history of the main branch, plus all tags

# Good
git fetch origin main --no-tags --depth=1 # This will just fetch the latest commit from main
git fetch origin tag 1.0.0-0 --no-tags --depth=1 # This will fetch the latest commit from the 1.0.0-0 tag and create a local tag to match
git fetch origin tag 1.0.1-0 --no-tags --shallow-exclude=1.0.0-0 # This will fetch all commits from the 1.0.1-0 tag, except for those that are reachable from the 1.0.0-0 tag.
```

## Security Rules 🔐
1. Do **not** use `pull_request_target` trigger unless an external fork needs access to secrets, or a _write_ `GITHUB_TOKEN`.
1. Do **not ever** write a `pull_request_target` trigger with an explicit PR checkout, e.g. using `actions/checkout@v2`. This is [discussed further here](https://securitylab.github.com/research/github-actions-preventing-pwn-requests)
1. **Do use** the `pull_request` trigger as it does not send internal secrets and only grants a _read_ `GITHUB_TOKEN`.
1. If an untrusted (i.e: not maintained by GitHub) external action needs access to any secret (`GITHUB_TOKEN` or internal secret), use the commit hash of the workflow to prevent a modification of underlying source code at that version. For example:
    1. **Bad:** `hmarr/auto-approve-action@v2.0.0` Relies on the tag
    1. **Good:** `hmarr/auto-approve-action@7782c7e2bdf62b4d79bdcded8332808fd2f179cd` Explicit Git hash
1. When creating secrets, use tightly scoped secrets that only allow access to that specific action's requirement
1. Review all modifications to our workflows with extra scrutiny, it is important to get it correct the first time.
1. Test workflow changes in your own public fork, for example: https://github.com/Andrew-Test-Org/Public-Test-Repo
1. Only trusted users will be allowed write access to the repository, however, it's good to add logic checks in actions to prevent human error.
1. Do not add repo secrets to the environment at the workflow or job level. Only add them to the environment at the step level.

## Further Reading 📖
1. https://securitylab.github.com/research/github-actions-preventing-pwn-requests
1. https://stackoverflow.com/a/62143130/1858217

## Secrets
The GitHub workflows require a large list of secrets to deploy, notify and test the code:
1. `LARGE_SECRET_PASSPHRASE` - decrypts secrets stored in various encrypted files stored in GitHub repository. To create updated versions of these encrypted files, refer to steps 1-4 of [this encrypted secrets help page](https://docs.github.com/en/actions/reference/encrypted-secrets#limits-for-secrets) using the `LARGE_SECRET_PASSPHRASE`.
   1. `android/app/my-upload-key.keystore.gpg`
   1. `android/app/android-fastlane-json-key.json.gpg`
   1. `ios/chat_expensify_adhoc.mobileprovision.gpg`
   1. `ios/chat_expensify_appstore.mobileprovision.gpg`
   1. `ios/Certificates.p12.gpg`
1. `SLACK_WEBHOOK` - Sends Slack notifications via Slack WebHook https://expensify.slack.com/services/B01AX48D7MM
1. `OS_BOTIFY_TOKEN` - Personal access token for @OSBotify user in GitHub
1. `CLA_BOTIFY_TOKEN` - Personal access token for @CLABotify user in GitHub
1. `CSC_LINK` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
1. `CSC_KEY_PASSWORD` - Required to be set for desktop code signing: https://www.electron.build/code-signing.html#travis-appveyor-and-other-ci-servers
1. `APPLE_ID` - Required for notarizing desktop code in `desktop/notarize.js`
1. `APPLE_ID_PASSWORD` - Required for notarizing desktop code in `desktop/notarize.js`
1. `AWS_ACCESS_KEY_ID` - Required for hosting website and desktop compiled code
1. `AWS_SECRET_ACCESS_KEY` - Required for hosting website and desktop compiled code
1. `CLOUDFLARE_TOKEN` - Required for hosting website
1. `APPLE_CONTACT_EMAIL` - Email used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
1. `APPLE_CONTACT_PHONE` - Phone number used for contact between Expensify and Apple for https://appstoreconnect.apple.com/
1. `APPLE_DEMO_EMAIL` - Demo account email used for https://appstoreconnect.apple.com/
1. `APPLE_DEMO_PASSWORD` - Demo account password used for https://appstoreconnect.apple.com/
1. `BROWSERSTACK` - Used to access Browserstack's API

## Actions

All these _workflows_ are comprised of atomic _actions_. Most of the time, we can use pre-made and independently maintained actions to create powerful workflows that meet our needs. However, when we want to do something very specific or have a more complex or robust action in mind, we can create our own _actions_.

All our actions are stored in the neighboring directory [`.github/actions`](https://github.com/Expensify/App/tree/main/.github/actions). There are two kinds of actions, [composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action), and [JavaScript actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action).

All actions must have an "action metadata file" called `action.yml`. This describes the action, gives it a name, and defines its inputs and outputs. For composite actions, it also includes the run steps.

JavaScript actions are modules comprised of three parts:

1. An [action metadata file](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action#creating-an-action-metadata-file) called `action.yml`.
1. A Node.js script, whose name matches the module. This is where you can implement the custom logic for your action.
1. A compiled file called index.js. This is a compiled output of the file from (2) and should _NEVER_ be directly modified.

### Why do actions need to be compiled?

From the [GitHub Actions documentation](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github):

> GitHub downloads each action run in a workflow during runtime and executes it as a complete package of code before you can use workflow commands like run to interact with the runner machine. This means you must include any package dependencies required to run the JavaScript code. You'll need to check in the toolkit core and github packages to your action's repository.

If you make any changes to an action's implementation, you must always recompile it in order for the changes to take effect. The action metadata file should use the compiled node.js executable script (`index.js`), _not_ the source file.

### How are actions compiled?

In order to bundle actions with their dependencies into a single Node.js executable script, we use [`ncc`](https://github.com/vercel/ncc). In order to make this easier, we've added an `npm` script to `package.json`, so you can just run `npm run gh-actions-build`. If you create a new action, make sure that you update `.github/scripts/buildActions.sh` to include your new action. Also, be sure that you always run `npm install` before recompiling if you added new dependencies, or they won't be included in the bundled executable. :)

**Note:** If you have a Windows machine, the compiled output will be different than on a Unix machine, which will cause test failures in your PR. So you'll need to run the compilation script on a Mac or Linux machine instead, using whatever means suits you (i.e: another physical device, Docker container, EC2 instance, etc...)

### Important tips about creating GitHub Actions

- When calling your GitHub Action from one of our workflows, you must:
    - First call `@actions/checkout`.
    - Use the absolute path of the action in GitHub, including the repo name, path, and branch ref, like so:
      ```yaml
      - name: Generate Version
        uses: Expensify/App/.github/actions/javascript/bumpVersion@main
      ```
       Do not try to use a relative path.
- Confusingly, paths in action metadata files (`action.yml`) _must_ use relative paths.
- You can't use any dynamic values or environment variables in a `uses` statement
- In general, it is a best practice to minimize any side-effects of each action. Using atomic ("dumb") actions that have a clear and simple purpose will promote reuse and make it easier to understand the workflows that use them.