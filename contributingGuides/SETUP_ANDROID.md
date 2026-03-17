# Android Setup Instructions

## Running the mobile application using Rock 🪨

This project uses [Rock](https://rockjs.dev/) to manage native builds. Rather than compiling native code locally when running commands like `npm run android`, Rock first attempts to download remote builds (artifacts prebuilt on CI) from S3. If a matching remote build isn’t available, it automatically falls back to building locally.

By storing complete native build artifacts remotely, Rock reduces the need for local compilation and simplifies setup through automated downloads.

**Note:** Any changes to files involved in generating a fingerprint (e.g., `package.json`) will trigger a local build.

The following steps describe how to configure the project to fully utilize Rock.

### Running the mobile application 📱
* To install project dependencies run: `npm install`
* To start metro server run: `npm run start`
**Note:** For now this is a required step — metro needs to be called manually in a separate terminal.
* To run application on a **Development Simulator**:
    - For standalone `npm run android-standalone`
    - For hybrid app `npm run android`

After completing these steps, you should be able to start both mobile platform apps using the remote build.

### Troubleshooting
If you haven't done any intentional edits outside of `src/` (like adding new dependencies) but your app is still running into a full build, remember that it's way easier to debug and address a remote cache miss rather than any compilation error.

* Try re-installing dependencies:
    - `npm run i-standalone` for the standalone app
    - `npm install` for the hybrid app

* Try running:
    - For standalone `npm run android-standalone`
    - For hybrid app `npm run android`

* If you’re still encountering errors, you can try running:
    - `git clean -fdx android/` when running standalone app
    - `git clean -fdx ./Mobile-Expensify` when running hybrid app

* Then try running again: 
    - For standalone `npm run android-standalone`
    - For hybrid app `npm run android`

* If the issue persists, verify that workflow in the GitHub repository have completed successfully:
    - [Android builds](https://github.com/Expensify/App/actions/workflows/remote-build-android.yml)
    If the workflow is still running, open it and verify it matches your fingerprint. Once complete, Rock should download the remote build. If not, check whether the last main commit hash merged into your branch has the same fingerprint as yours.

    If the fingerprints do not match, run:
    - `npx rock fingerprint -p android --verbose`
    Compare the results with the GitHub Actions output to see which files have different fingerprints.

* In the event of workflow failures, it is recommended to have the option to manually build the application. The following steps will cover the manual build process.

## Running the mobile application using manual builds

### Android-Specific Prerequisites

1. **Configure MapBox**
   - Before installing Android dependencies, you need to obtain a token from Mapbox to download their SDKs. Please run `npm run configure-mapbox` and follow the instructions. If you already did this step for iOS, there is no need to repeat this step.

2. **React Native Environment Setup**
   - Go through the official React-Native instructions on [this page](https://reactnative.dev/docs/environment-setup?guide=native&platform=android) to start running the app on android.

3. **ccache Setup (Optional)**
   - The Android project can utilize [ccache](https://ccache.dev/) to significantly reduce compilation times. Since C/C++ code doesn't change as frequently, ccache can cache compilation results and reuse them across builds.
   - Install ccache via Homebrew: `brew install ccache`
   - Once installed, the build system will automatically detect and use ccache when available.
   - To view cumulative statistics on cache usage, run: `ccache --show-stats`
   - **Note:** If you encounter any issues with the ccache cache, our clean command (via Rock CLI) will automatically clean the ccache directory as well.

## Running the Android App

### Development Emulator
- To run on a **Development Emulator**: `npm run android`
- Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

### Expensify Employees
If you are an Expensify employee and want to point the emulator to your local VM, follow [this](https://stackoverflow.com/c/expensify/questions/7699)

## Enabling Prebuilt React Native Artifacts

By default, `react-native` is built from source when building the Android app. However, you can enable prebuilt artifacts to speed up the build process:

### Disabling Build from Source
- Open `android/gradle.properties` (for Standalone NewDot) or `Mobile-Expensify/Android/gradle.properties` (for HybridApp)
- Set `patchedArtifacts.forceBuildFromSource=false`

### Configuring GitHub CLI

To use prebuilt artifacts, you need to have GitHub CLI installed and configured:

1. **Install GitHub CLI**
   - Install GitHub CLI by following the instructions from [cli.github.com](https://cli.github.com/)

2. **Create a GitHub Personal Access Token**
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the following scopes:
     - `repo`
     - `read:org`
     - `gist`
     - `read:packages`
   - Copy the generated token

3. **Login to GitHub CLI**
   ```bash
   echo "YOUR_TOKEN" | gh auth login --with-token
   ```

4. **Verify Login**
   ```bash
   gh auth status
   ```
   You should see a message confirming you are authenticated with your GitHub account.

After completing these steps, you should be able to build Android apps with prebuilt `react-native` artifacts.

## Push Notifications Setup

To receive mobile push notifications in the development build while hitting the Staging or Production API, you need to use the production airship config.

### HybridApp
Add `inProduction = true` to [Mobile-Expensify/Android/assets/airshipconfig.properties](https://github.com/Expensify/Mobile-Expensify/blob/main/Android/assets/airshipconfig.properties)

### Standalone
Copy the [production config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/main/assets/airshipconfig.properties#L1-L7) to the [development config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/development/assets/airshipconfig.properties#L1-L8).

## Testing Web App in Android Emulator Browsers

To test the web app in Android emulator browsers, you need to install the development certificate. The development server uses HTTPS protocol, so the Android emulator needs the same certificate installed.

### Prerequisites
You must first configure HTTPS certificates by following the instructions in the [Web Setup Guide](SETUP_WEB.md#configuring-https).

### Manual Certificate Installation
1. Open any emulator using Android Studio
2. Use `adb push "$(mkcert -CAROOT)/rootCA.pem" /storage/emulated/0/Download/` to push certificate to install in Download folder.
3. Install the certificate as CA certificate from the settings. On the Android emulator, this option can be found in Settings > Security > Encryption & Credentials > Install a certificate > CA certificate.
4. Close the emulator.

**Note:** If you want to run app on `https://127.0.0.1:8082`, then just install the certificate and use `adb reverse tcp:8082 tcp:8082` on every startup.

### Automated Setup
1. Run `npm run setupNewDotWebForEmulators android`
2. Select the emulator you want to run if prompted. (If single emulator is available, then it will open automatically)
3. Let the script execute till the message `🎉 Done!`.

**Note:** If you want to run app on `https://dev.new.expensify.com:8082`, then just do the Android flow and use `npm run startAndroidEmulator` to start the Android Emulator every time (It will configure the emulator).

### All Platforms Setup
If you want to set up both iOS and Android simulators at once:
1. Run `npm run setupNewDotWebForEmulators all` or `npm run setupNewDotWebForEmulators`
2. Check if the iOS flow runs first and then Android flow runs.
3. Let the script execute till the message `🎉 Done!`.

### Troubleshooting
The flow may fail to root with error `adbd cannot run as root in production builds`. In this case, please refer to https://stackoverflow.com/a/45668555. Or use `https://127.0.0.1:8082` for less hassle.

## Debugging

Our React Native Android app now uses the `Hermes` JS engine which requires your browser for remote debugging. These instructions are specific to Chrome since that's what the Hermes documentation provided.

### Chrome Debugging Setup
1. Navigate to `chrome://inspect`
2. Use the `Configure...` button to add the Metro server address (typically `localhost:8081`, check your `Metro` output)
3. You should now see a "Hermes React Native" target with an "inspect" link which can be used to bring up a debugger. If you don't see the "inspect" link, make sure the Metro server is running
4. You can now use the Chrome debug tools. See [React Native Debugging Hermes](https://reactnative.dev/docs/hermes#debugging-hermes-using-google-chromes-devtools)

## Release Profiling

### Enable Source Maps for Android
Ensure the following is set in your app's `android/app/build.gradle` file.

```jsx
project.ext.react = [
    enableHermes: true,
    hermesFlagsRelease: ["-O", "-output-source-map"], // <-- here, plus whichever flag was required to set this away from default
]
```

### Recording Traces
1. Install the necessary packages: `npm i`
2. Run your Android app in production mode
3. Navigate to the feature you wish to profile.
4. Initiate the profiling session by tapping with four fingers to open the menu and selecting **`Use Profiling`**.
5. Close the menu and interact with the app.
6. After completing your interactions, tap with four fingers again and select to stop profiling.
7. You will be presented with a **`Share`** option to export the trace, which includes a trace file (`Profile<app version>.cpuprofile`) and build info (`AppInfo<app version>.json`).

### How to Symbolicate Trace Records
1. You have two files: `AppInfo<app version>.json` and `Profile<app version>.cpuprofile`
2. Place the `Profile<app version>.cpuprofile` file at the root of your project.
3. If you have already generated a source map from the steps above for this branch, you can skip to the next step. Otherwise, obtain the app version from `AppInfo<app version>.json` switch to that branch and generate the source map as described.

**IMPORTANT:** You should generate the source map from the same branch as the trace was recorded.

4. Upon completion, the generated source map can be found at: `android/app/build/generated/sourcemaps/react/productionRelease/index.android.bundle.map`
5. Use the following command to symbolicate the trace: `npm run symbolicate-release:android`
6. A new file named `Profile_trace_for_<app version>-converted.json` will appear in your project's root folder.
7. Open this file in your tool of choice:
   - SpeedScope ([https://www.speedscope.app](https://www.speedscope.app/))
   - Perfetto UI (https://ui.perfetto.dev/)
   - Google Chrome's Tracing UI (chrome://tracing)

## Troubleshooting

1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. For additional Android-specific troubleshooting, see the [HybridApp documentation](contributingGuides/HYBRID_APP.md)

**Note:** Expensify engineers that will be testing with the API in your local dev environment please refer to [these additional instructions](https://stackoverflow.com/c/expensify/questions/7699/7700).
