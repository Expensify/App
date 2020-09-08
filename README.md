# React Native Chat

# Philosophy
This application is built with the following principles.
1. **Data Flow** - Ideally, this is how data flows through the app:
    1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> Ion).
    1. Disk pushes data to the UI (Ion -> withIon()/connect() -> React component).
    1. UI pushes data to people's brains (React component -> device screen).
    1. Brain pushes data into UI inputs (Device input -> React component).
    1. UI inputs pushes data to the server (React component -> Action -> XHR to server).
    1. Go to 1
1. **Offline first** 
    - All data that is brought into the app should be stored immediately on disk in persistent storage (eg. localStorage on browser platforms).
    - All data that is displayed, comes from persistent storage.
1. **UI Binds to data on disk** 
    - Ion is a Pub/Sub library to connect the application to the data stored on disk.
    - UI components bind to Ion (using `withIon()`) and any change to the Ion data is automatically reflected in the component by calling `setState()` with the changed data.
    - Libraries bind to Ion (with `Ion.connect()`) and use a callback which is triggered with the changed data.
    - The UI should never call any Ion methods except for `Ion.connect()`. That is the job of Actions (see next section).
    - The UI always interacts with an Action when something needs to happen (eg. a person inputs data, the UI passes that data to an Action to be processed).
    - The UI should be as flexible as possible when it comes to:
        - Incomplete or missing data (always assume data is incomplete or not there)
        - Order of events (all operations can and should happen in parallel rather than in sequence)
1. **Actions manage Ion Data** 
    - When data needs to be written to or read from the server, this is done through Actions only.
    - Action methods should never return anything (not data or a promise). There are very few exceptions to this. The only time an action is allowed to return a promise or data is for internal use by that action only. Any libraries, actions, or React components that need access to the data from the action should be subscribing to that data with Ion.
    - Actions should favor using `Ion.merge()` over `Ion.set()` so that other values in an object aren't completely overwritten.
    - All Ion operations should happen in parallel and never in sequence (eg. don't use the promise of one Ion method to trigger a second Ion method).
    - The only time Actions should use promises to do operations in sequence is when working with XHRs.
    - If an Action needs to access data stored on disk, use a local variable and `Ion.connect()`
    - Data should be optimistically stored on disk whenever possible without waiting for a server response (eg. creating a new comment)
1. **Cross Platform 99.9999%**
    1. A feature isn't done until it works on all platforms.  Accordingly, don't even bother writing a platform-specific code block because you're just going to need to undo it.
    1. If the reason you can't write cross platform code is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.
    1. If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing if (platform=iOS) { }, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.
    1. Put all platform specific code in a dedicated files and folders, like /platform, and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.

## Getting Started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. Run `cp .env.example .env` and edit `.env` to have your local config options

You can use any IDE or code editing tool for developing on any platform. Use your favorite!

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

## Things to know or brush up on before jumping into the code
1. The major difference between React-Native and React are the [components](https://reactnative.dev/docs/components-and-apis) that are used in the `render()` method. Everything else is exactly the same. If you learn React, you've already learned 98% of React-Native.
1. The application uses [React-Router](https://reactrouter.com/native/guides/quick-start) for navigating between parts of the app.
1. [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) are used to connect React components to persistent storage via Ion.

## Structure of the app
These are the main pieces of the application.

### Ion
This is a persistent storage solution wrapped in a Pub/Sub library. In general that means:

- Ion stores and retrieves data from persistent storage
- Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object
- Collections of data are usually not stored as a single key (eg. an array with multiple objects), but as individual keys+ID (eg. `report_1234`, `report_4567`, etc.)
- Ion allows other code to subscribe to changes in data, and then publishes change events whenever data is changed
- Anything needing to read Ion data needs to:
    1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > local storage)
    2. Subscribe to changes of the data for a particular key or set of keys. React components use `withIon()` and non-React libs use `Ion.connect()`.
    3. Get initialized with the current value of that key from persistent storage (Ion does this automatically as part of the connection process)
- Subscribing to Ion keys is done using a regex pattern. For example, since all reports are stored as individual keys like `report_1234`, then if code needs to know about all the reports (eg. display a list of them in the nav menu), then it would subscribe to the key pattern `report_[0-9]+$`.

### Actions
Actions are responsible for managing what is on disk. This is usually:

- Subscribing to Pusher events to receive data from the server that will get put immediately into Ion
- Making XHRs to request necessary data from the server and then immediately putting that data into Ion
- Handling any business logic with input coming from the UI layer

### The UI layer
This layer is solely responsible for:

- Reflecting exactly the data that is in persistent storage by using `withIon()` to bind to Ion data.
- Taking user input and passing it to an action
