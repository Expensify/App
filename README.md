<div align="center">
    <a href="https://new.expensify.com">
        <img src="https://raw.githubusercontent.com/Expensify/App/main/web/favicon.png" width="64" height="64" alt="New Expensify Icon">
    </a>
    <h1>
        <a href="https://new.expensify.com">
            New Expensify
        </a>
    </h1>
</div>

#### Table of Contents
* [Local Development](#local-development)
* [Testing on browsers in simulators and emulators](#testing-on-browsers-in-simulators-and-emulators)
* [Running The Tests](#running-the-tests)
* [Debugging](#debugging)
* [Deploying](#deploying)
* [Onyx derived values](#onyx-derived-values)
* [canBeMissing onyx param](#canbemissing-onyx-param)

#### Additional Reading
* [Application Philosophy](contributingGuides/philosophies/INDEX.md)
* [API Details](contributingGuides/API.md)
* [Offline First](contributingGuides/philosophies/OFFLINE.md)
* [Contributing to Expensify](contributingGuides/CONTRIBUTING.md)
* [Expensify Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributor License Agreement](CLA.md)
* [React StrictMode](contributingGuides/STRICT_MODE.md)
* [Left Hand Navigation(LHN)](contributingGuides/LEFT_HAND_NAVIGATION.md)
* [HybridApp - additional info & troubleshooting](contributingGuides/HYBRID_APP.md)

----

# Local development
These instructions should get you set up ready to work on New Expensify 🙌

## Getting Started
1. Install `nvm` then `node` & `npm`: `brew install nvm && nvm install`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. Install `mkcert`: `brew install mkcert` followed by `npm run setup-https`. If you are not using macOS, follow the instructions [here](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation).
5. Create a host entry in your local hosts file, `/etc/hosts` for dev.new.expensify.com pointing to localhost:
```
127.0.0.1 dev.new.expensify.com
```

You can use any IDE or code editing tool for developing on any platform. Use your favorite!

## Recommended `node` setup
In order to have more consistent builds, we use a strict `node` and `npm` version as defined in the `package.json` `engines` field and `.nvmrc` file. `npm install` will fail if you do not use the version defined, so it is recommended to install `node` via `nvm` for easy node version management. Automatic `node` version switching can be installed for [`zsh`](https://github.com/nvm-sh/nvm#zsh) or [`bash`](https://github.com/nvm-sh/nvm#bash) using `nvm`.

## Configuring HTTPS
The webpack development server now uses https. If you're using a mac, you can simply run `npm run setup-https`.

If you're using another operating system, you will need to ensure `mkcert` is installed, and then follow the instructions in the repository to generate certificates valid for `dev.new.expensify.com` and `localhost`. The certificate should be named `certificate.pem` and the key should be named `key.pem`. They should be placed in `config/webpack`.

## Running the web app 🕸
* To run the **development web app**: `npm run web`
* Changes applied to Javascript will be applied automatically via WebPack as configured in `webpack.dev.ts`

## Running the iOS app 📱
For an M1 Mac, read this [SO](https://stackoverflow.com/questions/64901180/how-to-run-cocoapods-on-apple-silicon-m1) for installing cocoapods.

* If you haven't already, install Xcode tools and make sure to install the optional "iOS Platform" package as well. This installation may take awhile.
    * After installation, check in System Settings that there's no update for Xcode. Otherwise, you may encounter issues later that don't explain that you solve them by updating Xcode.
* Install project gems, including cocoapods, using bundler to ensure everyone uses the same versions. In the project root, run: `bundle install`
    * If you get the error `Could not find 'bundler'`, install the bundler gem first: `gem install bundler` and try again.
    * If you are using MacOS and get the error `Gem::FilePermissionError` when trying to install the bundler gem, you're likely using system Ruby, which requires administrator permission to modify. To get around this, install another version of Ruby with a version manager like [rbenv](https://github.com/rbenv/rbenv#installation).
* Before installing iOS dependencies, you need to obtain a token from Mapbox to download their SDKs. Please run `npm run configure-mapbox` and follow the instructions.
    * For help with MapBox token, you can see [this Slack thread](https://expensify.slack.com/archives/C01GTK53T8Q/p1692740856745279?thread_ts=1692322511.804599&cid=C01GTK53T8Q)
* To install the iOS dependencies, run: `npm install && npm run pod-install`
* If you are an Expensify employee and want to point the emulator to your local VM, follow [this](https://stackoverflow.com/c/expensify/questions/7699)
* To run a on a **Development Simulator**: `npm run ios`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

If you want to run the app on an actual physical iOS device, please follow the instructions [here](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_BUILD_APP_ON_PHYSICAL_IOS_DEVICE.md).

## Running the Android app 🤖
* Before installing Android dependencies, you need to obtain a token from Mapbox to download their SDKs. Please run `npm run configure-mapbox` and follow the instructions. If you already did this step for iOS, there is no need to repeat this step.
* Go through the official React-Native instructions on [this page](https://reactnative.dev/docs/environment-setup?guide=native&platform=android) to start running the app on android.
* If you are an Expensify employee and want to point the emulator to your local VM, follow [this](https://stackoverflow.com/c/expensify/questions/7699)
* To run a on a **Development Emulator**: `npm run android`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

### Enabling prebuilt `react-native` artifacts on Android
#### Disabling build from source

By default, `react-native` is built from source when building the Android app. However, you can enable prebuilt artifacts to speed up the build process:

   - Open `android/gradle.properties` (for Standalone NewDot) or `Mobile-Expensify/Android/gradle.properties` (for HybridApp)
   - Set `patchedArtifacts.forceBuildFromSource=false`

#### Configuring GitHub CLI

To use prebuilt artifacts, you need to have GitHub CLI installed and configured:

1. Install GitHub CLI by following the instructions from [cli.github.com](https://cli.github.com/)

2. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the following scopes:
     - `repo`
     - `read:org`
     - `gist`
     - `read:packages`
   - Copy the generated token

3. Login to GitHub CLI:
   ```bash
   echo "YOUR_TOKEN" | gh auth login --with-token
   ```
4. Verify the login was successful:
   ```bash
   gh auth status
   ```
   You should see a message confirming you are authenticated with your GitHub account.

After completing these steps, you should be able to build Android apps with prebuilt `react-native` artifacts.

## Running the MacOS desktop app 🖥
* To run the **Development app**, run: `npm run desktop`, this will start a new Electron process running on your MacOS desktop in the `dist/Mac` folder.

## Receiving Mobile Push Notifications
To receive mobile push notifications in the development build while hitting the Staging or Production API, you need to use the production airship config.
### Android

#### HybridApp

Add `inProduction = true` to [Mobile-Expensify/Android/assets/airshipconfig.properties](https://github.com/Expensify/Mobile-Expensify/blob/main/Android/assets/airshipconfig.properties)

#### Standalone

Copy the [production config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/main/assets/airshipconfig.properties#L1-L7) to the [development config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/development/assets/airshipconfig.properties#L1-L8).

### iOS

#### HybridApp

Set `inProduction` to `true` in [Mobile-Expensify/iOS/AirshipConfig/Debug/AirshipConfig.plist](https://github.com/Expensify/Mobile-Expensify/blob/ab67becf5e8610c8df9b4da3132501153c7291a1/iOS/AirshipConfig/Debug/AirshipConfig.plist#L8)

#### Standalone

Replace the [development key and secret](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L7-L10) with the [production values](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L11-L14).

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into CORS errors like (in the browser dev console)
   ```sh
   Access to fetch at 'https://www.expensify.com/api/BeginSignIn' from origin 'http://localhost:8080' has been blocked by CORS policy
   ```
   You probably have a misconfigured `.env` file - remove it (`rm .env`) and try again

**Note:** Expensify engineers that will be testing with the API in your local dev environment please refer to [these additional instructions](https://stackoverflow.com/c/expensify/questions/7699/7700).

## Environment variables
Creating an `.env` file is not necessary. We advise external contributors against it. It can lead to errors when
variables referenced here get updated since your local `.env` file is ignored.

- `NEW_EXPENSIFY_URL` - The root URL used for the website
- `SECURE_EXPENSIFY_URL` - The URL used to hit the Expensify secure API
- `EXPENSIFY_URL` - The URL used to hit the Expensify API
- `EXPENSIFY_PARTNER_NAME` - Constant used for the app when authenticating.
- `EXPENSIFY_PARTNER_PASSWORD` - Another constant used for the app when authenticating. (This is OK to be public)
- `PUSHER_APP_KEY` - Key used to authenticate with Pusher.com
- `SECURE_NGROK_URL` - Secure URL used for `ngrok` when testing
- `NGROK_URL` - URL used for `ngrok` when testing
- `USE_NGROK` - Flag to turn `ngrok` testing on or off
- `USE_WDYR` - Flag to turn [`Why Did You Render`](https://github.com/welldone-software/why-did-you-render) testing on or off
- `USE_WEB_PROXY`⚠️- Used in web/desktop development, it starts a server along the local development server to proxy
   requests to the backend. External contributors should set this to `true` otherwise they'll have CORS errors.
   If you don't want to start the proxy server set this explicitly to `false`
- `CAPTURE_METRICS` (optional) - Set this to `true` to capture performance metrics and see them in Flipper
   see [PERFORMANCE.md](contributingGuides/PERFORMANCE.md#performance-metrics-opt-in-on-local-release-builds) for more information
- `ONYX_METRICS` (optional) - Set this to `true` to capture even more performance metrics and see them in Flipper
   see [React-Native-Onyx#benchmarks](https://github.com/Expensify/react-native-onyx#benchmarks) for more information
- `E2E_TESTING` (optional) - This needs to be set to `true` when running the e2e tests for performance regression testing.
   This happens usually automatically, read [this](tests/e2e/README.md) for more information

> If your changes to .env aren't having an effect, try `rm -rf .rock`, then re-run `npm run ios` or `npm run android`

----

# Testing on browsers in simulators and emulators

The development server is reached through the HTTPS protocol, and any client that access the development server needs a certificate.

You create this certificate by following the instructions in [`Configuring HTTPS`](#configuring-https) of this readme. When accessing the website served from the development server on browsers in iOS simulator or Android emulator, these virtual devices need to have the same certificate installed. Follow the steps below to install them.

#### Pre-requisite for Android flow
1. Open any emulator using Android Studio
2. Use `adb push "$(mkcert -CAROOT)/rootCA.pem" /storage/emulated/0/Download/` to push certificate to install in Download folder.
3. Install the certificate as CA certificate from the settings. On the Android emulator, this option can be found in Settings > Security > Encryption & Credentials > Install a certificate > CA certificate.
4. Close the emulator.

**Note:** If you want to run app on `https://127.0.0.1:8082`, then just install the certificate and use `adb reverse tcp:8082 tcp:8082` on every startup.

#### Android Flow
1. Run `npm run setupNewDotWebForEmulators android`
2. Select the emulator you want to run if prompted. (If single emulator is available, then it will open automatically)
3. Let the script execute till the message `🎉 Done!`.

**Note:** If you want to run app on `https://dev.new.expensify.com:8082`, then just do the Android flow and use `npm run startAndroidEmulator` to start the Android Emulator every time (It will configure the emulator).


Possible Scenario:
The flow may fail to root with error `adbd cannot run as root in production builds`. In this case, please refer to https://stackoverflow.com/a/45668555. Or use `https://127.0.0.1:8082` for less hassle.

#### iOS Flow
1. Run `npm run setupNewDotWebForEmulators ios`
2. Select the emulator you want to run if prompted. (If single emulator is available, then it will open automatically)
3. Let the script execute till the message `🎉 Done!`.

#### All Flow
1. Run `npm run setupNewDotWebForEmulators all` or `npm run setupNewDotWebForEmulators`
2. Check if the iOS flow runs first and then Android flow runs.
3. Let the script execute till the message `🎉 Done!`.

----

# Running the tests
## Unit tests
Unit tests are valuable when you want to test one component. They should be short, fast, and ideally only test one thing.
Often times in order to write a unit test, you may need to mock data, a component, or library. We use the library [Jest](https://jestjs.io/)
to help run our Unit tests.

* To run the **Jest unit tests**: `npm run test`
* UI tests guidelines can be found [here](tests/ui/README.md)

## Performance tests
We use Reassure for monitoring performance regression. More detailed information can be found [here](tests/perf-test/README.md):

----

# Debugging
### iOS
1. If running on the iOS simulator pressing `⌘D` will open the debugging menu.
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser.
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)

Alternatively, you can also set up debugger using [Flipper](https://fbflipper.com/). After installation, press `⌘D` and select "Open Debugger". This will open Flipper window. To view data stored by Onyx, go to Plugin Manager and install `async-storage` plugin.

## Android
Our React Native Android app now uses the `Hermes` JS engine which requires your browser for remote debugging. These instructions are specific to Chrome since that's what the Hermes documentation provided.
1. Navigate to `chrome://inspect`
2. Use the `Configure...` button to add the Metro server address (typically `localhost:8081`, check your `Metro` output)
3. You should now see a "Hermes React Native" target with an "inspect" link which can be used to bring up a debugger. If you don't see the "inspect" link, make sure the Metro server is running
4. You can now use the Chrome debug tools. See [React Native Debugging Hermes](https://reactnative.dev/docs/hermes#debugging-hermes-using-google-chromes-devtools)

## Web

To make it easier to test things in web, we expose the Onyx object to the window, so you can easily do `Onyx.set('bla', 1)`.

----

# Release Profiler
Often, performance issue debugging occurs in debug builds, which can introduce errors from elements such as JS Garbage Collection, Hermes debug markers, or LLDB pauses.

`react-native-release-profiler` facilitates profiling within release builds for accurate local problem-solving and broad performance analysis in production to spot regressions or collect extensive device data. Therefore, we will utilize the production build version

### Getting Started with Source Maps
To accurately profile your application, generating source maps for Android and iOS is crucial. Here's how to enable them:
1. Enable source maps on Android
Ensure the following is set in your app's `android/app/build.gradle` file.

    ```jsx
    project.ext.react = [
        enableHermes: true,
        hermesFlagsRelease: ["-O", "-output-source-map"], // <-- here, plus whichever flag was required to set this away from default
    ]
    ```

2. Enable source maps on IOS
Within Xcode head to the build phase - `Bundle React Native code and images`.

    ```jsx
    export SOURCEMAP_FILE="$(pwd)/../main.jsbundle.map" // <-- here;

    export NODE_BINARY=node
    ../node_modules/react-native/scripts/react-native-xcode.sh
    ```
3. Install the necessary packages and CocoaPods dependencies:
    ```jsx
    npm i && npm run pod-install
    ```
4. Depending on the platform you are targeting, run your Android/iOS app in production mode.
5. Upon completion, the generated source map can be found at:
  Android: `android/app/build/generated/sourcemaps/react/productionRelease/index.android.bundle.map`
  IOS: `main.jsbundle.map`
  web: `dist/merged-source-map.js.map`

### Recording a Trace:
1. Ensure you have generated the source map as outlined above.
2. Launch the app in production mode.
3. Navigate to the feature you wish to profile.
4. Initiate the profiling session by tapping with four fingers (on mobile) or `cmd+d` (on web) to open the menu and selecting **`Use Profiling`**.
5. Close the menu and interact with the app.
6. After completing your interactions, tap with four fingers or `cmd+d` again and select to stop profiling.
7. You will be presented with a **`Share`** option to export the trace, which includes a trace file (`Profile<app version>.cpuprofile`) and build info (`AppInfo<app version>.json`).

Build info:
```jsx
{
    appVersion: "1.0.0",
    environment: "production",
    platform: "IOS",
    totalMemory: "3GB",
    usedMemory: "300MB"
}
```

### How to symbolicate trace record:
1. You have two files: `AppInfo<app version>.json` and `Profile<app version>.cpuprofile`
2. Place the `Profile<app version>.cpuprofile` file at the root of your project.
3. If you have already generated a source map from the steps above for this branch, you can skip to the next step. Otherwise, obtain the app version from `AppInfo<app version>.json` switch to that branch and generate the source map as described.

`IMPORTANT:` You should generate the source map from the same branch as the trace was recorded.

4. Use the following commands to symbolicate the trace for Android and iOS, respectively:
Android: `npm run symbolicate-release:android`
IOS: `npm run symbolicate-release:ios`
web: `npm run symbolicate-release:web`
5. A new file named `Profile_trace_for_<app version>-converted.json` will appear in your project's root folder.
6. Open this file in your tool of choice:
    - SpeedScope ([https://www.speedscope.app](https://www.speedscope.app/))
    - Perfetto UI (https://ui.perfetto.dev/)
    - Google Chrome's Tracing UI (chrome://tracing)

----

# Deploying
## QA and deploy cycles
We utilize a CI/CD deployment system built using [GitHub Actions](https://github.com/features/actions) to ensure that new code is automatically deployed to our users as fast as possible. As part of this process, all code is first deployed to our staging environments, where it undergoes quality assurance (QA) testing before it is deployed to production. Typically, pull requests are deployed to staging immediately after they are merged.

Every time a PR is deployed to staging, it is added to a [special tracking issue](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) with the label `StagingDeployCash` (there will only ever be one open at a time). This tracking issue contains information about the new application version, a list of recently deployed pull requests, and any issues found on staging that are not present on production. Every weekday at 9am PST, our QA team adds the `🔐LockCashDeploys🔐` label to that tracking issue, and that signifies that they are starting their daily QA cycle. They will perform both regular regression testing and the QA steps listed for every pull request on the `StagingDeployCash` checklist.

Once the `StagingDeployCash` is locked, we won't run any staging deploys until it is either unlocked, or we run a production deploy. If severe issues are found on staging that are not present on production, a new issue (or the PR that caused the issue) will be labeled with `DeployBlockerCash`, and added to the `StagingDeployCash` deploy checklist. If we want to resolve a deploy blocker by reverting a pull request or deploying a hotfix directly to the staging environment, we can merge a pull request with the `CP Staging` label.

Once we have confirmed to the best of our ability that there are no deploy-blocking issues and that all our new features are working as expected on staging, we'll close the `StagingDeployCash`. That will automatically trigger a production deployment, open a new `StagingDeployCash` checklist, and deploy to staging any pull requests that were merged while the previous checklist was locked.

##  Key GitHub workflows
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

## Local production builds
Sometimes it might be beneficial to generate a local production version instead of testing on production. Follow the steps below for each client:

#### Local production build of the web app
In order to generate a production web build, run `npm run build`, this will generate a production javascript build in the `dist/` folder.

#### Local production build of the MacOS desktop app
The commands used to compile a production or staging desktop build are `npm run desktop-build` and `npm run desktop-build-staging`, respectively. These will product an app in the `dist/Mac` folder named NewExpensify.dmg that you can install like a normal app.

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

#### Local production build the iOS app
In order to compile a production iOS build, run `npm run ios-build`, this will generate a `Chat.ipa` in the root directory of this project.

#### Local production build the Android app
To build an APK to share run (e.g. via Slack), run `npm run android-build`, this will generate a new APK in the `android/app` folder.

# Onyx derived values
Onyx derived values are special Onyx keys which contain values derived from other Onyx values. These are available as a performance optimization, so that if the result of a common computation of Onyx values is needed in many places across the app, the computation can be done only as needed in a centralized location, and then shared across the app. Once created, Onyx derived values are stored and consumed just like any other Onyx value.

## When to use derived values?

1. **Complex Computations Across Multiple Components**
   - Multiple components need the same computed value from one or more Onyx keys
   - The computation is expensive (e.g., filtering large arrays, complex object transformations)
   - The result needs to be cached and shared to avoid redundant calculations

2. **Performance Critical Paths**
   - The computation appears in frequently rendered components
   - Profiling shows the same calculation being done repeatedly
   - The computation involves multiple Onyx dependencies that change independently

3. **Data Aggregation and Transformation**
   - You need to combine data from multiple Onyx keys into a single, normalized structure
   - The transformation logic is complex and reusable
   - The derived data structure is used in multiple places

4. **State-Dependent Calculations**
   - The value depends on multiple pieces of state that can change independently
   - The relationship between states is complex (e.g., filtering + sorting + grouping)
   - Changes in any dependency should trigger a recalculation

## When not to use derived values?

1. **Simple or Local Computations**
   - The computation is trivial (e.g., simple string manipulation, basic math)
   - The value is only used in one component

2. **Component-Specific Logic**
   - The computation is specific to a single component's UI state
   - The logic involves component-local state

3. **Temporary or Volatile Data**
   - The computed value is only needed temporarily
   - The data doesn't need to persist across component unmounts
   - The computation depends on non-Onyx values

## Creating new Onyx derived values
1. Add the new Onyx key. The keys for Onyx derived values are stored in `ONYXKEYS.ts`, in the `ONYXKEYS.DERIVED` object.
2. Declare the type for the derived value in `ONYXKEYS.ts`, in the `OnyxDerivedValuesMapping` type.
3. Add the derived value config to `ONYX_DERIVED_VALUES` in `src/libs/OnyxDerived.ts`. A derived value config is defined by:
   1. The Onyx key for the derived value
   2. An array of dependent Onyx keys (which can be any keys, not including the one from the previous step. Including other derived values!)
   3. A `compute` function, which takes an array of dependent Onyx values (in the same order as the array of keys from the previous step), and returns a value matching the type you declared in `OnyxDerivedValuesMapping`

## Best practices

1. **Keep computations pure and predictable**
   ```typescript
      // GOOD ✅
   compute: ([reports, personalDetails]) => {
     // Pure function, only depends on input
     return reports.map(report => ({
       ...report,
       authorName: personalDetails[report.authorID]?.displayName
     }));
   }

   // BAD ❌
   compute: ([reports]) => {
     // Don't use external state or cause side effects
     const currentUser = getCurrentUser(); // External dependency!
     sendAnalytics('computation-done'); // Side effect!
     return reports;
   }
   ```
2. **Handle edge cases**
   ```typescript
   // GOOD ✅
   compute: ([reports, personalDetails]: [Report[], PersonalDetails]): DerivedType => {
     if (!reports?.length || !personalDetails) {
       return { items: [], count: 0 };
     }
     // Rest of computation...
   }

   // BAD ❌
   compute: ([reports, personalDetails]) => {
     // Missing type safety and edge cases
     return reports.map(report => personalDetails[report.id]);
   }
   ```

3. **Document derived values**
   - Explain the purpose and dependencies
   - Document any special cases or performance considerations

# canBeMissing onyx param

Context https://expensify.slack.com/archives/C03TQ48KC/p1741208342513379

## What is this param and lint error for?

The idea of the param is to indicate if the component connecting to onyx expects the data to be there (and thus does not need to handle the case when it is not) or not (and thus has to handle the case when it is not).

It was added because in some places we are assuming some data will be there, but actually we never load it, which leads to hard to debug bugs.

The linter error is there till we add the param to all callers, once that happens we can make the param mandatory and remove the linter.


## How do I determine if the param should be false or true?

The main things to look at for the `canBeMissing` param are:
- Where/who loads the data? If the data is always ensured to be loaded before this component renders, then `canBeMissing` would be set to `false`. So any data that is always returned by `OpenApp` used in a component where we have a user (so not in the homepage for example) will have `canBeMissing` set to `false`
- Will the user always have data? Maybe we always try to load a piece of data, but the data can be missing/empty, in this case `canBeMissing` would be set to `false`
- If neither of above, then the param should probably be `true`, but additionally we need to make sure that the code using the data manages correctly the fact that the data might be missing



