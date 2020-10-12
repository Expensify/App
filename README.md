# React Native Chat

# Philosophy
This application is built with the following principles.
1. **Data Flow** - Ideally, this is how data flows through the app:
    1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> Ion). Currently the code only does this with report comments. Until we make more server changes, this steps is actually done by the client requesting data from the server via XHR and then storing the response in Ion.
    1. Disk pushes data to the UI (Ion -> withIon()/connect() -> React component).
    1. UI pushes data to people's brains (React component -> device screen).
    1. Brain pushes data into UI inputs (Device input -> React component).
    1. UI inputs push data to the server (React component -> Action -> XHR to server).
    1. Go to 1
1. **Offline first** 
    - All data that is brought into the app and is necessary to display the app when offline should be stored on disk in persistent storage (eg. localStorage on browser platforms). [AsyncStorage](https://react-native-community.github.io/async-storage/) is a cross-platform abstraction layer that is used to access persistent storage.
    - All data that is displayed, comes from persistent storage.
1. **UI Binds to data on disk** 
    - Ion is a Pub/Sub library to connect the application to the data stored on disk.
    - UI components subscribe to Ion (using `withIon()`) and any change to the Ion data is published to the component by calling `setState()` with the changed data.
    - Libraries subscribe to Ion (with `Ion.connect()`) and any change to the Ion data is published to the callback with the changed data.
    - The UI should never call any Ion methods except for `Ion.connect()`. That is the job of Actions (see next section).
    - The UI always triggers an Action when something needs to happen (eg. a person inputs data, the UI triggers an Action with this data).
    - The UI should be as flexible as possible when it comes to:
        - Incomplete or missing data. Always assume data is incomplete or not there. For example, when a comment is pushed to the client from a pusher event, it's possible that Ion does not have data for that report yet. That's OK. A partial report object is added to Ion for the report key `report_1234 = {reportID: 1234, isUnread: true}`. Then there is code that monitors Ion for reports with incomplete data, and calls `fetchChatReportsByIDs(1234)` to get the full data for that report. The UI should be able to gracefully handle the report object not being complete. In this example, the sidebar wouldn't display any report that doesn't have a report name.
        - The order that actions are done in. All actions should be done in parallel instead of sequence. 
            - Parallel actions are asynchronous methods that don't return promises. Any number of these actions can be called at one time and it doesn't matter what order they happen in or when they complete.
            - In-Sequence actions are asynchronous methods that return promises. This is necessary when one asynchronous method depends on the results from a previous asynchronous method. Example: Making an XHR to `command=CreateChatReport` which returns a reportID which is used to call `command=Get&rvl=reportStuff`.
1. **Actions manage Ion Data** 
    - When data needs to be written to or read from the server, this is done through Actions only.
    - Public action methods should never return anything (not data or a promise). This is done to ensure that action methods can be called in parallel with no dependency on other methods (see discussion above).
    - Actions should favor using `Ion.merge()` over `Ion.set()` so that other values in an object aren't completely overwritten.
    - In general, the operations that happen inside an action should be done in parallel and not in sequence (eg. don't use the promise of one Ion method to trigger a second Ion method). Ion is built so that every operation is done in parallel and it doesn't matter what order they finish in. XHRs on the other hand need to be handled in sequence with promise chains in order to access and act upon the response.
    - If an Action needs to access data stored on disk, use a local variable and `Ion.connect()`
    - Data should be optimistically stored on disk whenever possible without waiting for a server response. Example of creating a new optimistic comment:
        1. user adds a comment 
        2. comment is shown in the UI (by mocking the expected response from the server) 
        3. comment is created in the server 
        4. server responds 
        5. UI updates with data from the server
        
1. **Cross Platform 99.9999%**
    1. A feature isn't done until it works on all platforms.  Accordingly, don't even bother writing a platform-specific code block because you're just going to need to undo it.
    1. If the reason you can't write cross platform code is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.
    1. If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing if (platform=iOS) { }, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.
    1. Put all platform specific code in dedicated files and folders, like /platform, and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.

# Local development
## Getting started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. Run `cp .env.example .env` and edit `.env` to have your local config options.

You can use any IDE or code editing tool for developing on any platform. Use your favorite!

## Running the web app 🕸
* To run a **Development Server**: `npm run web`
* To build a **production build**: `npm run build`
* Changes applied to Javascript will be applied automatically via WebPack as configured in `webpack.dev.js`

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

## Running the MacOS desktop app 🖥
 * To run the **Development app**, run: `npm run desktop`, this will start a new Electron process running on your MacOS desktop in the `dist/Mac` folder.

## Running the tests 🎰
* To run the **Jest Unit Tests**: `npm run test`

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into issues communicating with `expensify.com.dev` (CORS, SSL, etc.), running via `ngrok` is recommended, see step 3 in **_Getting Started_**

## Debugging
### iOS
1. If running on the iOS simulator pressing `⌘D` will open the debugging menu. 
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser. 
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)

### Android
Our React Native Android app now uses the `Hermes` JS engine which requires your browser for remote debugging. These instructions are specific to Chrome since that's what the Hermes documentation provided.
1. Navigate to `chrome://inspect`
2. Use the `Configure...` button to add the Metro server address (typically `localhost:8081`, check your `Metro` output)
3. You should now see a "Hermes React Native" target with an "inspect" link which can be used to bring up a debugger. If you don't see the "inspect" link, make sure the Metro server is running.
4. You can now use the Chrome debug tools. See [React Native Debugging Hermes](https://reactnative.dev/docs/hermes#debugging-hermes-using-google-chromes-devtools)

## Things to know or brush up on before jumping into the code
1. The major difference between React-Native and React are the [components](https://reactnative.dev/docs/components-and-apis) that are used in the `render()` method. Everything else is exactly the same. If you learn React, you've already learned 98% of React-Native.
1. The application uses [React-Router](https://reactrouter.com/native/guides/quick-start) for navigating between parts of the app.
1. [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) are used to connect React components to persistent storage via Ion.

## Platform-Specific File Extensions
In most cases, the code written for this repo should be platform-independent. In such cases, each module should have a single file, `index.js`, which defines the module's exports. There are, however, some cases in which a feature is intrinsically tied to the underlying platform. In such cases, the following file extensions can be used to export platform-specific code from a module:
- Mobile => `index.native.js`
- iOS/Android => `index.ios.js`/`index.android.js`
- Web => `index.website.js`
- Desktop => `index.desktop.js`

Note that `index.js` should be the default. i.e: If you have mobile-specific implementation in `index.native.js`, then the desktop/web implementation can be contained in a shared `index.js`. Furthermore, `index.native.js` should not be included in the same module as `index.ios.js` or `index.android.js`, nor should `index.js` be included in the same module as `index.website.js` or `index.desktop.js`.

## Structure of the app
These are the main pieces of the application.

### Ion
This is a persistent storage solution wrapped in a Pub/Sub library. In general that means:

- Ion stores and retrieves data from persistent storage
- Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object
- Collections of data are usually not stored as a single key (eg. an array with multiple objects), but as individual keys+ID (eg. `report_1234`, `report_4567`, etc.). Store collections as individual keys when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `SidebarLink.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.
- Ion allows other code to subscribe to changes in data, and then publishes change events whenever data is changed
- Anything needing to read Ion data needs to:
    1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > local storage)
    2. Subscribe to changes of the data for a particular key or set of keys. React components use `withIon()` and non-React libs use `Ion.connect()`.
    3. Get initialized with the current value of that key from persistent storage (Ion does this by calling `setState()` or triggering the `callback` with the values currently on disk as part of the connection process)
- Subscribing to Ion keys is done using a constant defined in `IONKEYS`. Each Ion key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (eg. display a list of them in the nav menu), then it would subscribe to the key `IONKEYS.COLLECTION.REPORT`.

### Actions
Actions are responsible for managing what is on disk. This is usually:

- Subscribing to Pusher events to receive data from the server that will get put immediately into Ion
- Making XHRs to request necessary data from the server and then immediately putting that data into Ion
- Handling any business logic with input coming from the UI layer

### The UI layer
This layer is solely responsible for:

- Reflecting exactly the data that is in persistent storage by using `withIon()` to bind to Ion data.
- Taking user input and passing it to an action

# Deploying 
##  Continuous deployment / GitHub workflows
Every PR merged into `master` will kick off the **Create a new version** GitHub workflow defined in `.github/workflows/version.yml`.
It will look at the current version and increment it by one build version (using [`react-native-version`](https://www.npmjs.com/package/react-native-version)), create a PR with that new version, and tag the version.

The PR will be merged automatically by the GitHub workflow **automerge** to keep the version always up to date.

When a new tag is pushed, it will trigger a deploy of all four clients:
1. The **web** app automatically deploys via a GitHub Action in `.github/workflows/main.yml`
2. The **MacOS desktop** app automatically deploys via a GitHub Action in `.github/workflows/desktop.yml`
3. The **Android** app automatically deploys via a GitHub Action in `.github/workflows/android.yml`
4. The **iOS** app automatically deploys via a GitHub Action in `.github/workflows/ios.yml`

## Local production build
Sometimes it might be beneficial to generate a local production version instead of testing on production. Follow the steps below for each client:

## Local production build of the web app
In order to generate a production web build, run `npm run build`, this will generate a production javascript build in the `dist/` folder.

## Local production build of the MacOS desktop app
In order to compile a production desktop build, run `npm run desktop-build`, this will generate a production app in the `dist/Mac` folder named `Chat.app`.
  
#### Local production build the iOS app
In order to compile a production iOS build, run `npm run ios-build`, this will generate a `Chat.ipa` in the root directory of this project. 

#### Local production build the Android app
To build an APK to share run (e.g. via Slack), run `npm run android-build`, this will generate a new APK in the `android/app` folder.
