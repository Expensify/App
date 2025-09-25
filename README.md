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

#### Additional Reading
* [Application Philosophy](contributingGuides/philosophies/INDEX.md)
* [API Details](contributingGuides/API.md)
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
