# React Native Chat

# Philosophy
This application is built with the following principles.
1. **Offline first** 
    - All data that is brought into the app should be stored immediately in Ion which puts the data into persistent storage (eg. localStorage on browser platforms)
    - All data that is displayed, comes from persistent storage (Ion)
1. **UI Binds to Ion** 
    - UI components bind to Ion (with `Ion.connect()`) so that any change to the Ion data is automatically reflected in the component by calling setState() with the changed data.
    - Libraries bind to Ion (with `Ion.connect()`) and use a callback instead of having `setState()` be called
    - The UI should be as flexible as possible when it comes to:
        - Incomplete data (always assume data is incomplete or not there)
        - Order of events (all operations can and should happen in parallel rather than in sequence)
1. **Actions manage Ion Data** 
    - When data needs to be written to or read from the server, this is done through Actions exclusively
    - Actions should never return data, see the first point. Example:  if the action is `fetchReports()`, it does not return the reports, `fetchReports()` returns nothing. The action makes an XHR, then puts the data into Ion (using `Ion.set()` or `Ion.merge()`).
    - Actions should favor using `Ion.merge()` over `Ion.set()` so that other values in an object aren't completely overwritten
    - All Ion operations should happen in parallel and never in sequence
    - If an Action needs access to Ion data, use a local variable and `Ion.connect()`
    - Data should be optimistically added to Ion whenever possible without waiting for a server response
1. **Cross Platform 99.9999%**
    1. A feature isn't done until it works on all platforms.  Accordingly, don't even bother writing a platform-specific code block because you're just going to need to undo it.
    1. If the reason you can't write cross platform code is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.
    1. If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing if (platform=iOS) { }, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.
    1. Put all platform specific code in a dedicated files and folders, like /platform, and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.
1. **Data Flow** - Ideally, this is how data flows through the app:
    1. Server pushes data to the disk of any client
    1. Disk pushes data to the UI
    1. UI pushes data to people's brains
    1. Brain pushes data into UI inputs
    1. UI inputs pushes data to the server
    1. Go to 1

## Getting Started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. Run `cp .env.example .env` and edit `.env` to have your local config options


## Running the web app 🕸
* To run a **Development Server**: `npm run web`
* To build a **production build**: `npm run build`
* Changes applied to Javascript will be applied automatically

#### Deploying the web app
* The web app automatically deploys via a GitHub Action in `.github/workflows/main.yml`

## Running the iOS app 📱
* To install the iOS dependencies, run: `cd ios/ && pod install`
* To run a on a **Development Simulator**: `npm run ios`
    * If the app is booting on a simulator for the first time, run the following two commands:
    ```bash
    xcrun simctl keychain booted add-root-cert ~/Expensidev/config/ssl/rootCA.crt #Adds root cert and trusts it
    xcrun simctl keychain booted add-cert ~/Expensidev/config/ssl/expensify.com.dev.pem #Adds .dev cert and trusts it
    ```
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

## Running the Android app 🤖
* Running via `ngrok` is required to communicate with the API
    * Start ngrok (`Expensidev/script/ngrok.sh`), replace `expensify.com.dev` value in `.env` with your ngrok value
* To run a on a **Development Emulator**: `npm run android`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

#### Deploying the iOS & Android app
* To install the required tools to deploy, run `bundle install` from the root of this project
* To deploy the iOS app run: `npm run deploy-ios`
* The Android app automatically deploys via a GitHub action to: [https://chat.expensify.com/app-release.apk](https://chat.expensify.com/app-release.apk)
* To build an APK to share run (e.g. via Slack): `Build > Generate Signed Bundle / APK...` from Android Studio

## Running the desktop app 🖥
 * To run the **Development app**, run: `npm run desktop`
 * To build a **production build**, run: `npm run desktop-build`
 
#### Deploying the desktop app
 * The desktop app automatically deploys via a GitHub Action in `.github/workflows/desktop.yml`

## Running the tests 🎰
* To run the **Jest Unit Tests**: `npm run test`

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into issues communicating with `expensify.com.dev` (CORS, SSL, etc.), running via `ngrok` is recommended, see step 3 in **_Getting Started_**

## Debugging
1. If running on the iOS simulator `⌘D`, or `⌘M` on Android emulator will open the debugging menu. 
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser. 
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)
