# Deploying Philosophy
This describes the deployment processes, QA cycles, and build workflows for the New Expensify application.

#### Related Philosophies
- [Offline Philosophy](/contributingGuides/philosophies/OFFLINE.md)

#### Terminology
- **StagingDeployCash** - Special tracking issue for managing staging deployments
- **Deploy Blocker** - Critical issue that prevents production deployment
- **QA Cycle** - Quality assurance testing performed before production release
- **Cherry Pick (CP)** - Deploying specific changes directly to staging

## Rules

### - All code MUST be deployed to staging before production
We utilize a CI/CD deployment system built using [GitHub Actions](https://github.com/features/actions) to ensure that new code is automatically deployed to our users as fast as possible. All code is first deployed to our staging environments, where it undergoes quality assurance (QA) testing before it is deployed to production.

### - Pull requests SHOULD be deployed to staging immediately after merge
Typically, pull requests are deployed to staging immediately after they are merged if the checklist is unlocked.

### - StagingDeployCash MUST be used to track deployment progress
Every time a PR is deployed to staging, it is added to a [special tracking issue](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) with the label `StagingDeployCash` (there will only ever be one open at a time). This tracking issue contains information about the new application version, a list of recently deployed pull requests, and any issues found on staging that are not present on production.

### - QA team MUST lock deploys during testing cycles
Every weekday at 9am PST, our QA team adds the `🔐LockCashDeploys🔐` label to that tracking issue, and that signifies that they are starting their daily QA cycle. They will perform both regular regression testing and the QA steps listed for every pull request on the `StagingDeployCash` checklist.

### - Deploy blockers MUST prevent production deployment
Once the `StagingDeployCash` is locked, we won't run any staging deploys until it is either unlocked, or we run a production deploy. If severe issues are found on staging that are not present on production, a new issue (or the PR that caused the issue) will be labeled with `DeployBlockerCash`, and added to the `StagingDeployCash` deploy checklist.

### - A hotfix MAY be deployed directly to staging using CP Staging label
If we want to resolve a deploy blocker by reverting a pull request or deploying a hotfix directly to the staging environment, we can merge a pull request with the `CP Staging` label.

### - Production deployment MUST be triggered by closing StagingDeployCash
Once we have confirmed to the best of our ability that there are no deploy-blocking issues and that all our new features are working as expected on staging, we'll close the `StagingDeployCash`. That will automatically trigger a production deployment, open a new `StagingDeployCash` checklist, and deploy to staging any pull requests that were merged while the previous checklist was locked.

## Key GitHub Workflows

These are some of the most central [GitHub Workflows](https://github.com/Expensify/App/tree/main/.github/workflows). There is more detailed information in the README [here](https://github.com/Expensify/App/blob/main/.github/workflows/README.md).

### preDeploy
The [preDeploy workflow](https://github.com/Expensify/App/blob/main/.github/workflows/preDeploy.yml) executes whenever a pull request is merged to `main`, and at a high level does the following:

- If the `StagingDeployCash` is locked, comment on the merged PR that it will be deployed later.
- Otherwise:
  - Create a new version by triggering the [`createNewVersion` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/createNewVersion.yml)
  - Update the `staging` branch from main.
- Also, if the pull request has the `CP Staging` label, it will execute the [`cherryPick` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/cherryPick.yml) to deploy the pull request directly to staging, even if the `StagingDeployCash` is locked.

### deploy
The [`deploy` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/deploy.yml) is really quite simple. It runs when code is pushed to the `staging` or `production` branches, and:

- If `staging` was updated, it creates a tag matching the new version, and pushes tags.
- If `production` was updated, it creates a GitHub Release for the new version.

### platformDeploy
The [`platformDeploy` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/platformDeploy.yml) is what actually runs the deployment on all four platforms (iOS, Android, Web, macOS Desktop). It runs a staging deploy whenever a new tag is pushed to GitHub, and runs a production deploy whenever a new release is created.

### lockDeploys
The [`lockDeploys` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/lockDeploys.yml) executes when the `StagingDeployCash` is locked, and it waits for any currently running staging deploys to finish, then gives Applause the :green_circle: to begin QA by commenting in the `StagingDeployCash` checklist.

### finishReleaseCycle
The [`finishReleaseCycle` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/finishReleaseCycle.yml) executes when the `StagingDeployCash` is closed. It updates the `production` branch from `staging` (triggering a production deploy), deploys `main` to staging (with a new `PATCH` version), and creates a new `StagingDeployCash` deploy checklist.

### testBuild
The [`testBuild` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/testBuild.yml) builds ad-hoc staging apps (hybrid iOS, hybrid Android, web, and desktop) from pull requests submitted to the App and Mobile-Expensify repositories. This process enables testers to review modifications before they are merged into the main branch and deployed to the staging environment. This workflow accepts up to two inputs:
- A PR number from the App repository for testing New Dot (ND) changes.
- A PR number from the Mobile-Expensify repository for testing Old Dot (OD) changes.

Both PR numbers can be entered simultaneously if the changes from both repositories need to be combined and tested. Additionally, contributors can explicitly link related PRs from the Mobile-Expensify repository in the App repository PR description if required. Guidance on linking PRs can be found [in PR template](https://github.com/Expensify/App/blob/main/.github/PULL_REQUEST_TEMPLATE.md?plain=1#L25-L30)

## Local Production Builds

Sometimes it might be beneficial to generate a local production version instead of testing on production. Follow the steps below for each client:

### - Web app local production builds SHOULD use `npm run build`
In order to generate a production web build, run `npm run build`, this will generate a production javascript build in the `dist/` folder.

### - MacOS desktop app local production builds SHOULD disable publishing for local testing
The commands used to compile a production or staging desktop build are `npm run desktop-build` and `npm run desktop-build-staging`, respectively. These will produce an app in the `dist/Mac` folder named NewExpensify.dmg that you can install like a normal app.

HOWEVER, by default those commands will try to notarize the build (signing it as Expensify) and publish it to the S3 bucket where it's hosted for users. In most cases you won't actually need or want to do that for your local testing. To get around that and disable those behaviors for your local build, apply the following diff:

```diff
diff --git a/scripts/build-desktop.sh b/scripts/build-desktop.sh
index 791f59d733..526306eec1 100755
--- a/scripts/build-desktop.sh
+++ b/scripts/build-desktop.sh
@@ -35,4 +35,4 @@ npx webpack --config config/webpack/webpack.desktop.ts --env file=$ENV_FILE
 title "Building Desktop App Archive Using Electron"
 info ""
 shift 1
-npx electron-builder --config config/electronBuilder.config.js --publish always "$@"
+npx electron-builder --config config/electronBuilder.config.js --publish never "$@"
```

There may be some cases where you need to test a signed and published build, such as when testing the update flows. Instructions on setting that up can be found in [Testing Electron Auto-Update](https://github.com/Expensify/App/blob/main/desktop/README.md#testing-electron-auto-update). Good luck 🙃

### - iOS app local production builds SHOULD use `npm run ios-build`
In order to compile a production iOS build, run `npm run ios-build`, this will generate a `Chat.ipa` in the root directory of this project.

### - Android app local production builds SHOULD use `npm run android-build`
To build an APK to share run (e.g. via Slack), run `npm run android-build`, this will generate a new APK in the `android/app` folder.
