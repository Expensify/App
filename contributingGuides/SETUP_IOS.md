# iOS Setup Instructions

## Running the mobile application using Rock 🪨

This project uses [Rock](https://rockjs.dev/) to manage native builds. Rather than compiling native code locally when running commands like `npm run ios`, Rock first attempts to download remote builds (artifacts prebuilt on CI) from S3. If a matching remote build isn’t available, it automatically falls back to building locally.

By storing complete native build artifacts remotely, Rock reduces the need for local compilation and simplifies setup through automated downloads.

**Note:** Any changes to files involved in generating a fingerprint (e.g., `package.json`) will trigger a local build.

The following steps describe how to configure the project to fully utilize Rock.

### Running the mobile application 📱
* To install project dependencies run: `npm install`
* To start metro server run: `npm run start`
**Note:** For now this is a required step — metro needs to be called manually in a separate terminal.
* To run application on a **Development Simulator**:
    - For standalone `npm run ios-standalone`
    - For hybrid app `npm run ios` 

After completing these steps, you should be able to start both mobile platform apps using the remote build.

### Troubleshooting
If you haven't done any intentional edits outside of `src/` (like adding new dependencies) but your app is still running into a full build, remember that it's way easier to debug and address a remote cache miss rather than any compilation error.

* Try re-installing dependencies:
    - `npm run i-standalone` for the standalone app
    - `npm install` for the hybrid app

* Try running:
    - For standalone `npm run ios-standalone`
    - For hybrid app `npm run ios`

* If you’re still encountering errors, you can try running:
    - `git clean -fdx ios/` when running standalone app
    - `git clean -fdx ./Mobile-Expensify` when running hybrid app

* Then try running again: 
    - For standalone `npm run ios-standalone`
    - For hybrid app `npm run ios`

* If the issue persists, verify that both workflows in the GitHub repository have completed successfully:
    - [iOS builds](https://github.com/Expensify/App/actions/workflows/remote-build-ios.yml)
    If the workflows are still running, open them and verify they match your fingerprint. Once complete, Rock should download the remote build. If not, check whether the last main commit hash merged into your branch has the same fingerprint as yours.

    If the fingerprints do not match, run:
    - `npx rock fingerprint -p ios --verbose`
    Compare the results with the GitHub Actions output to see which files have different fingerprints.

* In the event of workflow failures, it is recommended to have the option to manually build the application. The following steps will cover the manual build process.  

## Running the mobile application using manual builds

### iOS-Specific Prerequisites
For an M1 Mac, read this [Stack Overflow post](https://stackoverflow.com/questions/64901180/how-to-run-cocoapods-on-apple-silicon-m1) for installing cocoapods.

1. **Install Xcode and iOS Platform**
   - Install Xcode tools and make sure to install the optional "iOS Platform" package as well. This installation may take awhile.
   - After installation, check in System Settings that there's no update for Xcode. Otherwise, you may encounter issues later that don't explain that you solve them by updating Xcode.

2. **Install Ruby and Bundler**
   - Install project gems, including cocoapods, using bundler to ensure everyone uses the same versions. In the project root, run: `bundle install`
   - If you get the error `Could not find 'bundler'`, install the bundler gem first: `gem install bundler` and try again.
   - If you are using MacOS and get the error `Gem::FilePermissionError` when trying to install the bundler gem, you're likely using system Ruby, which requires administrator permission to modify. To get around this, install another version of Ruby with a version manager like [rbenv](https://github.com/rbenv/rbenv#installation).

3. **Configure MapBox**
   - Before installing iOS dependencies, you need to obtain a token from Mapbox to download their SDKs. Please run `npm run configure-mapbox` and follow the instructions.
   - For help with MapBox token, you can see [this Slack thread](https://expensify.slack.com/archives/C01GTK53T8Q/p1692740856745279?thread_ts=1692322511.804599&cid=C01GTK53T8Q)

4. **Install iOS Dependencies**
   - To install the iOS dependencies, run: `npm install && npm run pod-install`

## Running the iOS App

### Development Simulator
- To run on a **Development Simulator**: `npm run ios`
- Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

### Physical iOS Device
If you want to run the app on an actual physical iOS device, please follow the instructions [here](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_BUILD_APP_ON_PHYSICAL_IOS_DEVICE.md).

### Expensify Employees
If you are an Expensify employee and want to point the emulator to your local VM, follow [this](https://stackoverflow.com/c/expensify/questions/7699)

## Push Notifications Setup

To receive mobile push notifications in the development build while hitting the Staging or Production API, you need to use the production airship config.

### HybridApp
Set `inProduction` to `true` in [Mobile-Expensify/iOS/AirshipConfig/Debug/AirshipConfig.plist](https://github.com/Expensify/Mobile-Expensify/blob/ab67becf5e8610c8df9b4da3132501153c7291a1/iOS/AirshipConfig/Debug/AirshipConfig.plist#L8)

### Standalone
Replace the [development key and secret](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L7-L10) with the [production values](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L11-L14).

## Testing Web App in iOS Simulator Browsers

To test the web app in iOS simulator browsers, you need to install the development certificate. The development server uses HTTPS protocol, so the iOS simulator needs the same certificate installed.

### Prerequisites
You must first configure HTTPS certificates by following the instructions in the [Web Setup Guide](SETUP_WEB.md#configuring-https).

### iOS Simulator Setup
1. Run `npm run setupNewDotWebForEmulators ios`
2. Select the emulator you want to run if prompted. (If single emulator is available, then it will open automatically)
3. Let the script execute till the message `🎉 Done!`.

### All Platforms Setup
If you want to set up both iOS and Android simulators at once:
1. Run `npm run setupNewDotWebForEmulators all` or `npm run setupNewDotWebForEmulators`
2. Check if the iOS flow runs first and then Android flow runs.
3. Let the script execute till the message `🎉 Done!`.

## Debugging

### iOS Simulator Debugging
1. If running on the iOS simulator pressing `⌘D` will open the debugging menu.
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser.
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)

### Flipper Debugging
Alternatively, you can also set up debugger using [Flipper](https://fbflipper.com/). After installation, press `⌘D` and select "Open Debugger". This will open Flipper window. To view data stored by Onyx, go to Plugin Manager and install `async-storage` plugin.

## Release Profiling

### Enable Source Maps for iOS
Within Xcode head to the build phase - `Bundle React Native code and images`.

```jsx
export SOURCEMAP_FILE="$(pwd)/../main.jsbundle.map" // <-- here;

export NODE_BINARY=node
../node_modules/react-native/scripts/react-native-xcode.sh
```

### Recording Traces
1. Install the necessary packages and CocoaPods dependencies: `npm i && npm run pod-install`
2. Run your iOS app in production mode
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

4. Upon completion, the generated source map can be found at: `main.jsbundle.map`
5. Use the following command to symbolicate the trace: `npm run symbolicate-release:ios`
6. A new file named `Profile_trace_for_<app version>-converted.json` will appear in your project's root folder.
7. Open this file in your tool of choice:
   - SpeedScope ([https://www.speedscope.app](https://www.speedscope.app/))
   - Perfetto UI (https://ui.perfetto.dev/)
   - Google Chrome's Tracing UI (chrome://tracing)

## Troubleshooting

1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. For additional iOS-specific troubleshooting, see the [HybridApp documentation](contributingGuides/HYBRID_APP.md)

**Note:** Expensify engineers that will be testing with the API in your local dev environment please refer to [these additional instructions](https://stackoverflow.com/c/expensify/questions/7699/7700).
