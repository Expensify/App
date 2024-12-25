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
* [App Structure and Conventions](#app-structure-and-conventions)
* [Philosophy](#Philosophy)
* [Security](#Security)
* [Internationalization](#Internationalization)
* [Deploying](#deploying)

#### Additional Reading
* [API Details](contributingGuides/API.md)
* [Offline First](contributingGuides/OFFLINE_UX.md)
* [Contributing to Expensify](contributingGuides/CONTRIBUTING.md)
* [Expensify Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributor License Agreement](contributingGuides/CLA.md)
* [React StrictMode](contributingGuides/STRICT_MODE.md)
* [Left Hand Navigation(LHN)](contributingGuides/LEFT_HAND_NAVIGATION.md)

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

## Running the MacOS desktop app 🖥
* To run the **Development app**, run: `npm run desktop`, this will start a new Electron process running on your MacOS desktop in the `dist/Mac` folder.

## Receiving Notifications
To receive notifications on development build of the app while hitting the Staging or Production API, you need to use the production airship config.
### Android
1. Copy the [production config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/main/assets/airshipconfig.properties#L1-L7) to the [development config](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/android/app/src/development/assets/airshipconfig.properties#L1-L8).
2. Rebuild the app.

### iOS
1. Replace the [development key and secret](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L7-L10) with the [production values](https://github.com/Expensify/App/blob/d7c1256f952c0020344d809ee7299b49a4c70db2/ios/AirshipConfig.plist#L11-L14).
2. Rebuild the app.

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

# App Structure and Conventions

## Onyx
This is a persistent storage solution wrapped in a Pub/Sub library. In general that means:

- Onyx stores and retrieves data from persistent storage
- Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object
- Collections of data are usually not stored as a single key (eg. an array with multiple objects), but as individual keys+ID (eg. `report_1234`, `report_4567`, etc.). Store collections as individual keys when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.
- Onyx allows other code to subscribe to changes in data, and then publishes change events whenever data is changed
- Anything needing to read Onyx data needs to:
    1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > IndexedDB > OnyxDB > keyvaluepairs)
    2. Subscribe to changes of the data for a particular key or set of keys. React components use `withOnyx()` and non-React libs use `Onyx.connect()`
    3. Get initialized with the current value of that key from persistent storage (Onyx does this by calling `setState()` or triggering the `callback` with the values currently on disk as part of the connection process)
- Subscribing to Onyx keys is done using a constant defined in `ONYXKEYS`. Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (eg. display a list of them in the nav menu), then it would subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

## Actions
Actions are responsible for managing what is on disk. This is usually:

- Subscribing to Pusher events to receive data from the server that will get put immediately into Onyx
- Making XHRs to request necessary data from the server and then immediately putting that data into Onyx
- Handling any business logic with input coming from the UI layer

## The UI layer
This layer is solely responsible for:

- Reflecting exactly the data that is in persistent storage by using `withOnyx()` to bind to Onyx data.
- Taking user input and passing it to an action

As a convention, the UI layer should never interact with device storage directly or call `Onyx.set()` or `Onyx.merge()`. Use an action! For example, check out this action that is signing in the user [here](https://github.com/Expensify/App/blob/919c890cc391ad38b670ca1b266c114c8b3c3285/src/pages/signin/PasswordForm.js#L78-L78).

```js
validateAndSubmitForm() {
    // validate...
    signIn(this.state.password, this.state.twoFactorAuthCode);
}
```

That action will then call `Onyx.merge()` to [set default data and a loading state, then make an API request, and set the response with another `Onyx.merge()`](https://github.com/Expensify/App/blob/919c890cc391ad38b670ca1b266c114c8b3c3285/src/libs/actions/Session.js#L228-L247).

```js
function signIn(password, twoFactorAuthCode) {
    Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
    Authentication.Authenticate({
        ...defaultParams,
        password,
        twoFactorAuthCode,
    })
        .then((response) => {
            Onyx.merge(ONYXKEYS.SESSION, {authToken: response.authToken});
        })
        .catch((error) => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {error: error.message});
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        });
}
```

Keeping our `Onyx.merge()` out of the view layer and in actions helps organize things as all interactions with device storage and API handling happen in the same place. In addition, actions that are called from inside views should not ever use the `.then()` method to set loading/error states, navigate or do any additional data processing. All of this stuff should ideally go into `Onyx` and be fed back to the component via `withOnyx()`. Design your actions so they clearly describe what they will do and encapsulate all their logic in that action.

```javascript
// Bad
validateAndSubmitForm() {
    // validate...
    this.setState({isLoading: true});
    signIn()
        .then((response) => {
            if (result.jsonCode === 200) {
                return;
            }

            this.setState({error: response.message});
        })
        .finally(() => {
            this.setState({isLoading: false});
        });
}

// Good
validateAndSubmitForm() {
    // validate...
    signIn();
}
```

## Directory structure
Almost all the code is located in the `src` folder, inside it there's some organization, we chose to name directories that are
created to house a collection of items in plural form and using camelCase (eg: pages, libs, etc), the main ones we have for now are:

- components: React native components that are re-used in several places.
- libs: Library classes/functions, these are not React native components (ie: they are not UI)
- pages: These are components that define pages in the app. The component that defines the page itself should be named
`<pageName>Page` if there are components used only inside one page, they should live in its own directory named after the `<pageName>`
- styles: These files define styles used among components/pages
- contributingGuides: This is just a set of markdown files providing guides and insights to aid developers in learning how to contribute to this repo

**Note:** There is also a directory called `/docs`, which houses the Expensify Help site. It's a static site that's built with Jekyll and hosted on GitHub Pages.

## File naming/structure
Files should be named after the component/function/constants they export, respecting the casing used for it. ie:

- If you export a constant named `CONST`, its file/directory should be named the `CONST`.
- If you export a component named `Text`, the file/directory should be named `Text`.
- If you export a function named `guid`, the file/directory should be named `guid`.
- For files that are utilities that export several functions/classes use the UpperCamelCase version ie: `DateUtils`.
- [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) (HOCs) should be named in camelCase, like `withOnyx`.
- All React components should be PascalCase (a.k.a. UpperCamelCase 🐫).

## Platform-Specific File Extensions
In most cases, the code written for this repo should be platform-independent. In such cases, each module should have a single file, `index.js`, which defines the module's exports. There are, however, some cases in which a feature is intrinsically tied to the underlying platform. In such cases, the following file extensions can be used to export platform-specific code from a module:
- Mobile => `index.native.js`
- iOS Native App/Android Native App => `index.ios.js`/`index.android.js`
- Web => `index.website.js`
- Desktop => `index.desktop.js`

**Note:** `index.js` should be the default and only platform-specific implementations should be done in their respective files. i.e: If you have mobile-specific implementation in `index.native.js`, then the desktop/web implementation can be contained in a shared `index.js`.

`index.ios.js` and `index.android.js` are used when the app is running natively on respective platforms. These files are not used when users access the app through mobile browsers, but `index.website.js` is used instead. `index.native.js` are for both iOS and Android native apps. `index.native.js` should not be included in the same module as `index.ios.js` or `index.android.js`.

## API building
When adding new API commands (and preferably when starting using a new one that was not yet used in this codebase) always
prefer to return the created/updated data in the command itself, instead of saving and reloading. ie: if we call `CreateTransaction`,
we should prefer making `CreateTransaction` return the data it just created instead of calling `CreateTransaction` then `Get` rvl=transactionList

## Storage Eviction

Different platforms come with varying storage capacities and Onyx has a way to gracefully fail when those storage limits are encountered. When Onyx fails to set or modify a key the following steps are taken:
1. Onyx looks at a list of recently accessed keys (access is defined as subscribed to or modified) and locates the key that was least recently accessed
2. It then deletes this key and retries the original operation

By default, Onyx will not evict anything from storage and will presume all keys are "unsafe" to remove unless explicitly told otherwise.

**To flag a key as safe for removal:**
- Add the key to the `safeEvictionKeys` option in `Onyx.init(options)`
- Implement `canEvict` in the Onyx config for each component subscribing to a key
- The key will only be deleted when all subscribers return `true` for `canEvict`

e.g.
```js
Onyx.init({
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
});
```

```js
export default withOnyx({
    reportActions: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        canEvict: props => !props.isActiveReport,
    },
})(ReportActionsView);
```

## Things to know or brush up on before jumping into the code
1. The major difference between React Native and React are the [components](https://reactnative.dev/docs/components-and-apis) that are used in the `render()` method. Everything else is exactly the same. Any React skills you have can be applied to React Native.
1. The application uses [`react-navigation`](https://reactnavigation.org/) for navigating between parts of the app.
1. [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) are used to connect React components to persistent storage via [`react-native-onyx`](https://github.com/Expensify/react-native-onyx).

----
# HybridApp

Currently, the production Expensify app contains both "Expensify Classic" and "New Expensify". The file structure is as follows:

- 📂 [**App**](https://github.com/Expensify/App)
    - 📂 [**android**](https://github.com/Expensify/App/tree/main/android): New Expensify Android specific code (not a part of HybridApp native code)
    - 📂 [**ios**](https://github.com/Expensify/App/tree/main/ios): New Expensify iOS specific code (not a part of HybridApp native code)
    - 📂 [**src**](https://github.com/Expensify/App/tree/main/src): New Expensify TypeScript logic
    - 📂 [**Mobile-Expensify**](https://github.com/Expensify/Mobile-Expensify): `git` submodule that is pointed to [Mobile-Expensify](https://github.com/Expensify/Mobile-Expensify)
        - 📂 [**Android**](https://github.com/Expensify/Mobile-Expensify/tree/main/Android): Expensify Classic Android specific code
        - 📂 [**iOS**](https://github.com/Expensify/Mobile-Expensify/tree/main/iOS): Expensify Classic iOS specific code
        - 📂 [**app**](https://github.com/Expensify/Mobile-Expensify/tree/main/app): Expensify Classic JavaScript logic (aka YAPL)

You can only build HybridApp if you have been granted access to [`Mobile-Expensify`](https://github.com/Expensify/Mobile-Expensify). For most contributors, you will be working on the standalone NewDot application.

## Getting started with HybridApp

1. If you haven't, please follow [these instructions](https://github.com/Expensify/App?tab=readme-ov-file#getting-started) to setup the NewDot local environment.
2. Run `git submodule update --init --progress --depth 100` to download the `Mobile-Expensify` sourcecode.
- If you have access to `Mobile-Expensify` and the command fails, add this to your `~/.gitconfig` file:

    ```
    [url "https://github.com/"]
        insteadOf = ssh://git@github.com/
    ```

At this point, the default behavior of some `npm` scripts will change to target HybridApp:
- `npm run android` - build HybridApp for Android
- `npm run ios` - build HybridApp for iOS
- `npm run ipad` - build HybridApp for iPad
- `npm run ipad-sm` - build HybridApp for small iPad
- `npm run pod-install` - install pods for HybridApp
- `npm run clean` - clean native code of HybridApp

If for some reason, you need to target the standalone NewDot application, you can append `*-standalone` to each of these scripts (eg. `npm run ios-standalone` will build NewDot instead of HybridApp). The same concept applies to the installation of standalone NewDot node modules. To skip the installation of HybridApp-specific patches and node modules, use `npm run i-standalone` or `npm run install-standalone`.

## Working with HybridApp
Day-to-day work with HybridApp shouldn't differ much from the work on the standalone NewDot repo. 

The main difference is that the native code which runs React Native is located in `./Mobile-Expensify/Android` and `./Mobile-Expensify/iOS` directories. It means, that changes in `./android` and `./ios` folders in the root **won't affect the HybridApp build**. 

In that case, if you'd like to eg. remove `Pods`, you need to do it in `./Mobile-Expensify/iOS`. The same rule applies to Android builds - if you'd like to delete `.cxx`, `build` or `.gradle` directories, you need to go to `./Mobile-Expensify/android` first. 

Additionally, If you'd like to open the HybridApp project in Android Studio or XCode, you **must choose a workspace located in the `Mobile-Expensify`** directory:

- Android: `./Mobile-Expensify/Android`
- iOS: `./Mobile-Expensify/iOS/Expensify.xcworkspace`

### Updating the Mobile-Expensify submodule

`Mobile-Expensify` directory is a git submodule. It means, that it points to a specific commit on the `Mobile-Expensify` repository. If you'd like to download the most recent changes from `main`, please use the following command:

`git submodule update --remote`

### Modifying Mobile-Expensify code

It's important to emphasise that a git submodule is just a **regular git repository** after all. It means that you can switch branches, pull the newest changes, and execute all regular git commands within the `Mobile-Expensify` directory. 

> [!Note]  
> #### For external contributors
>
> If you'd like to modify the `Mobile-Expensify` source code, it is best that you create your own fork. Then, you can swap origin of the remote repository by executing this command:
>
> `cd Mobile-Expensify && git remote set-url origin <YOUR_FORK_URL>`
>
> This way, you'll attach the submodule to your fork repository.

### Adding HybridApp-related patches

Applying patches from the `patches` directory is performed automatically with the `npm install` command executed in `Expensify/App`.

If you'd like to add HybridApp-specific patches, use the `--patch-dir` flag:

`npx patch-package <PACKAGE_NAME> --patch-dir Mobile-Expensify/patches`

### HybridApp troubleshooting

#### Cleaning the repo
- `npm run clean` - deep clean of all HybridApp artifacts (including NewDot's `node_modules`)
- `npm run clean -- --ios` - clean only iOS HybridApp artifacts (`Pods`, `build` folder, `DerivedData`)
- `npm run clean -- --android` - clean only Android HybridApp artifacts (`.cxx`, `build`, and `.gradle` folders, execute `./gradlew clean`)

If you'd like to do it manually, remember to `cd Mobile-Expensify` first!

#### Common errors
1. **Please check your internet connection** - set `_isOnDev` in `api.js` to always return `false` 
2. **CDN: trunk URL couldn't be downloaded** - `cd Mobile-Expensify/iOS && pod repo remove trunk`

3. **Task :validateSigningRelease FAILED** - open `Mobile-Expensify/Android/build.gradle` and do the following:
    ```
    - signingConfig signingConfigs.release
    + signingConfig signingConfigs.debug
    ```
4. **Build service could not create build operation: unknown error while handling message: MsgHandlingError(message: "unable to initiate PIF transfer session (operation in progress?)")** - reopen XCode

----

# Philosophy
This application is built with the following principles.
1. **Data Flow** - Ideally, this is how data flows through the app:
    1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> Onyx).
    >**Note:** Currently the code only does this with report comments. Until we make more server changes, this step is actually done by the client requesting data from the server via XHR and then storing the response in Onyx.
    2. Disk pushes data to the UI (Onyx -> withOnyx() -> React component).
    3. UI pushes data to people's brains (React component -> device screen).
    4. Brain pushes data into UI inputs (Device input -> React component).
    5. UI inputs push data to the server (React component -> Action -> XHR to server).
    6. Go to 1
    ![New Expensify Data Flow Chart](/contributingGuides/data_flow.png)
1. **Offline first**
    - Be sure to read [OFFLINE_UX.md](contributingGuides/OFFLINE_UX.md)!
    - All data that is brought into the app and is necessary to display the app when offline should be stored on disk in persistent storage (eg. localStorage on browser platforms). [AsyncStorage](https://reactnative.dev/docs/asyncstorage) is a cross-platform abstraction layer that is used to access persistent storage.
    - All data that is displayed, comes from persistent storage.
1. **UI Binds to data on disk**
    - Onyx is a Pub/Sub library to connect the application to the data stored on disk.
    - UI components subscribe to Onyx (using `withOnyx()`) and any change to the Onyx data is published to the component by calling `setState()` with the changed data.
    - Libraries subscribe to Onyx (with `Onyx.connect()`) and any change to the Onyx data is published to the callback with the changed data.
    - The UI should never call any Onyx methods except for `Onyx.connect()`. That is the job of Actions (see next section).
    - The UI always triggers an Action when something needs to happen (eg. a person inputs data, the UI triggers an Action with this data).
    - The UI should be as flexible as possible when it comes to:
        - Incomplete or missing data. Always assume data is incomplete or not there. For example, when a comment is pushed to the client from a pusher event, it's possible that Onyx does not have data for that report yet. That's OK. A partial report object is added to Onyx for the report key `report_1234 = {reportID: 1234, isUnread: true}`. Then there is code that monitors Onyx for reports with incomplete data, and calls `openReport(1234)` to get the full data for that report. The UI should be able to gracefully handle the report object not being complete. In this example, the sidebar wouldn't display any report that does not have a report name.
        - The order that actions are done in. All actions should be done in parallel instead of sequence.
            - Parallel actions are asynchronous methods that don't return promises. Any number of these actions can be called at one time and it doesn't matter what order they happen in or when they complete.
            - In-Sequence actions are asynchronous methods that return promises. This is necessary when one asynchronous method depends on the results from a previous asynchronous method. Example: Making an XHR to `command=CreateChatReport` which returns a reportID which is used to call `command=Get&rvl=reportStuff`.
1. **Actions manage Onyx Data**
    - When data needs to be written to or read from the server, this is done through Actions only.
    - Action methods should only have return values (data or a promise) if they are called by other actions. This is done to encourage that action methods can be called in parallel with no dependency on other methods (see discussion above).
    - Actions should favor using `Onyx.merge()` over `Onyx.set()` so that other values in an object aren't completely overwritten.
    - Views should not call `Onyx.merge()` or `Onyx.set()` directly and should call an action instead.
    - In general, the operations that happen inside an action should be done in parallel and not in sequence (eg. don't use the promise of one Onyx method to trigger a second Onyx method). Onyx is built so that every operation is done in parallel and it doesn't matter what order they finish in. XHRs on the other hand need to be handled in sequence with promise chains in order to access and act upon the response.
    - If an Action needs to access data stored on disk, use a local variable and `Onyx.connect()`
    - Data should be optimistically stored on disk whenever possible without waiting for a server response. Example of creating a new optimistic comment:
        1. user adds a comment
        2. comment is shown in the UI (by mocking the expected response from the server)
        3. comment is created in the server
        4. server responds
        5. UI updates with data from the server

1. **Cross Platform 99.9999%**
    1. A feature isn't done until it works on all platforms.  Accordingly, don't even bother writing a platform-specific code block because you're just going to need to undo it.
    1. If the reason you can't write cross-platform code is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.
    1. If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing if (platform=iOS) { }, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.
    1. Put all platform specific code in dedicated files and folders, like /platform, and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.

----

# Security
Updated rules for managing members across all types of chats in New Expensify.

- **Nobody can leave or be removed from something they were automatically added to. For example:**

    - DM members can't leave or be removed from their DMs
    - Members can't leave or be removed from their own workspace chats
    - Admins can't leave or be removed from workspace chats
    - Members can't leave or be removed from the #announce room
    - Admins can't leave or be removed from #admins
    - Domain members can't leave or be removed from their domain chat
    - Report submitters can't leave or be removed from their reports
    - Report managers can't leave or be removed from their reports
    - Group owners cannot be removed from their groups - they need to transfer ownership first
- **Excepting the above, admins can remove anyone. For example:**
    - Group admins can remove other group admins, as well as group members
    - Workspace admins can remove other workspace admins, as well as workspace members, and invited guests
- **Excepting the above, members can remove guests. For example:**
    - Workspace members can remove non-workspace guests.
- **Excepting the above, anybody can remove themselves from any object**

1. ### DM
    |  | Member
    | :---: | :---:
    | **Invite** | ❌
    | **Remove** | ❌
    | **Leave**  | ❌
    | **Can be removed**  | ❌
- DM always has two participants. None of the participant can leave or be removed from the DM. Also no additional member can be invited to the chat.

2. ### Workspace
    1. #### Workspace
        |   |  Creator  |  Member(Employee/User) | Admin |  Auditor?
        | :---: | :---:  |  :---: | :---: | :---:
        | **Invite** | ✅ |  ❌ |  ✅ | ❌
        | **Remove** | ✅ |  ❌ |  ✅ | ❌
        | **Leave**  | ❌ |  ✅ |  ❌ | ✅
        | **Can be removed**  | ❌ |  ✅ | ✅ | ✅

        - Creator can't leave or be removed from their own workspace
        - Admins can't leave from the workspace
        - Admins can remove other workspace admins, as well as workspace members, and invited guests
        - Creator can remove other workspace admins, as well as workspace members, and invited guests
        - Members and Auditors cannot invite or remove anyone from the workspace

    2. #### Workspace #announce room
        |   |  Member(Employee/User) | Admin |  Auditor?
        | :---: | :---:  |  :---: | :---:
        | **Invite** | ❌ |  ❌ |  ❌
        | **Remove** | ❌ |  ❌ |  ❌
        | **Leave**  | ❌ |  ❌ |  ❌
        | **Can be removed**  | ❌ |  ❌ |  ❌ |

       - No one can leave or be removed from the #announce room

    3. #### Workspace #admin room
        |   |  Admin |
        | :---: | :---:
        | **Invite** | ❌
        | **Remove** | ❌
        | **Leave**  | ❌
        | **Can be removed**  | ❌

        - Admins can't leave or be removed from #admins

    4. #### Workspace rooms
        |   |  Creator | Member | Guest(outside of the workspace)
        | :---: | :---:  |  :---: | :---:
        | **Invite** | ✅ | ✅ | ✅
        | **Remove** | ✅ | ✅ | ❌
        | **Leave**  | ✅ | ✅ | ✅
        | **Can be removed**  | ✅ | ✅ | ✅

        - Everyone can be removed/can leave from the room including creator
        - Guests are not able to remove anyone from the room

    4. #### Workspace chats
        |   |  Admin | Member(default) | Member(invited)
        | :---: | :---:  |  :---:  |  :---:
        | **Invite** | ✅ |  ✅ | ❌
        | **Remove** | ✅ |  ✅ | ❌
        | **Leave**  | ❌ |  ❌  | ✅
        | **Can be removed**  | ❌ | ❌ | ✅

        - Admins are not able to leave/be removed from the workspace chat
        - Default members(automatically invited) are not able to leave/be removed from the workspace chat
        - Invited members(invited by members) are not able to invite or remove from the workspace chat
        - Invited members(invited by members) are able to leave the workspace chat
        - Default members and admins are able to remove invited members

3. ### Domain chat
    |   |  Member
    | :---: | :---:
    | **Remove** | ❌
    | **Leave**  | ❌
    | **Can be removed**  | ❌

- Domain members can't leave or be removed from their domain chat

4. ### Reports
    |   |  Submitter | Manager
    | :---: | :---:  | :---:
    | **Remove** | ❌ | ❌
    | **Leave**  | ❌ | ❌
    | **Can be removed**  | ❌ | ❌

- Report submitters can't leave or be removed from their reports (eg, if they are the report.accountID)
- Report managers can't leave or be removed from their reports (eg, if they are the report.managerID)

----

# Internationalization
This application is built with Internationalization (I18n) / Localization (L10n) support, so it's important to always
localize the following types of data when presented to the user (even accessibility texts that are not rendered):

- Texts: See [translate method](https://github.com/Expensify/App/blob/655ba416d552d5c88e57977a6e0165fb7eb7ab58/src/libs/translate.js#L15)
- Date/time: see [DateUtils](https://github.com/Expensify/App/blob/f579946fbfbdc62acc5bd281dc75cabb803d9af0/src/libs/DateUtils.js)
- Numbers and amounts: see [NumberFormatUtils](https://github.com/Expensify/App/blob/55b2372d1344e3b61854139806a53f8a3d7c2b8b/src/libs/NumberFormatUtils.js) and [LocaleDigitUtils](https://github.com/Expensify/App/blob/55b2372d1344e3b61854139806a53f8a3d7c2b8b/src/libs/LocaleDigitUtils.js)
- Phones: see [LocalPhoneNumber](https://github.com/Expensify/App/blob/bdfbafe18ee2d60f766c697744f23fad64b62cad/src/libs/LocalePhoneNumber.js#L51-L52)

In most cases, you will be needing to localize data used in a component, if that's the case, there's a HOC [withLocalize](https://github.com/Expensify/App/blob/37465dbd07da1feab8347835d82ed3d2302cde4c/src/components/withLocalize.js).
It will abstract most of the logic you need (mostly subscribe to the [NVP_PREFERRED_LOCALE](https://github.com/Expensify/App/blob/6cf1a56df670a11bf61aa67eeb64c1f87161dea1/src/ONYXKEYS.js#L88) Onyx key)
and is the preferred way of localizing things inside components.

Some pointers:

- All translations are stored in language files in [src/languages](https://github.com/Expensify/App/tree/b114bc86ff38e3feca764e75b3f5bf4f60fcd6fe/src/languages).
- We try to group translations by their pages/components
- A common rule of thumb is to move a common word/phrase to be shared when it's in 3 places
- Always prefer longer and more complex strings in the translation files. For example
  if you need to generate the text `User has sent $20.00 to you on Oct 25th at 10:05am`, add just one
  key to the translation file and use the arrow function version, like so:
  `nameOfTheKey: ({amount, dateTime}) => "User has sent " + amount + " to you on " + dateTime,`.
  This is because the order of the phrases might vary from one language to another.
- When working with translations that involve plural forms, it's important to handle different cases correctly.

  For example:
  - zero: Used when there are no items **(optional)**. 
  - one: Used when there's exactly one item.
  - two: Used when there's two items. **(optional)**
  - few: Used for a small number of items **(optional)**.
  - many: Used for larger quantities **(optional)**.
  - other: A catch-all case for other counts or variations.

  Here’s an example of how to implement plural translations:

  messages: () => ({
      zero: 'No messages',
      one: 'One message',
      two: 'Two messages',
      few: (count) => `${count} messages`,
      many: (count) => `You have ${count} messages`,
      other: (count) => `You have ${count} unread messages`,
  })

  In your code, you can use the translation like this:

  `translate('common.messages', {count: 1});`
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

## Local production builds
Sometimes it might be beneficial to generate a local production version instead of testing on production. Follow the steps below for each client:

#### Local production build of the web app
In order to generate a production web build, run `npm run build`, this will generate a production javascript build in the `dist/` folder.

#### Local production build of the MacOS desktop app
The commands used to compile a production or staging desktop build are `npm run desktop-build` and `npm run desktop-build-staging`, respectively. These will product an app in the `dist/Mac` folder named NewExpensify.dmg that you can install like a normal app.

HOWEVER, by default those commands will try to notarize the build (signing it as Expensify) and publish it to the S3 bucket where it's hosted for users. In most cases you won't actually need or want to do that for your local testing. To get around that and disable those behaviors for your local build, apply the following diff:

```diff
diff --git a/config/electronBuilder.config.js b/config/electronBuilder.config.js
index e4ed685f65..4c7c1b3667 100644
--- a/config/electronBuilder.config.js
+++ b/config/electronBuilder.config.js
@@ -42,9 +42,6 @@ module.exports = {
         entitlements: 'desktop/entitlements.mac.plist',
         entitlementsInherit: 'desktop/entitlements.mac.plist',
         type: 'distribution',
-        notarize: {
-            teamId: '368M544MTT',
-        },
     },
     dmg: {
         title: 'New Expensify',
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
