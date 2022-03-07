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
* [Running The Tests](#running-the-tests)
* [Debugging](#debugging)
* [App Structure and Conventions](#app-structure-and-conventions)
* [Philosophy](#Philosophy)
* [Internationalization](#Internationalization)
* [Deploying](#deploying)

#### Additional Reading
* [Contributing to Expensify](./CONTRIBUTING.md)
* [Expensify Code of Conduct](./CODE_OF_CONDUCT.md)
* [Contributor License Agreement](./CLA.md)

----

# Local development
These instructions should get you set up ready to work on New Expensify 🙌

## Getting Started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`

You can use any IDE or code editing tool for developing on any platform. Use your favorite!

## Running the web app 🕸
* To run the **development web app**: `npm run web`
* Changes applied to Javascript will be applied automatically via WebPack as configured in `webpack.dev.js`

## Running the iOS app 📱
For an M1 Mac, read this [SO](https://stackoverflow.com/c/expensify/questions/11580) for installing cocoapods.

* To install the iOS dependencies, run: `npm install && cd ios/ && pod install && cd ..`
* To run a on a **Development Simulator**: `npm run ios`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile


## Running the Android app 🤖
* To install the Android dependencies, run: `npm install`
* Go through the instructions on [this page](https://reactnative.dev/docs/environment-setup#development-os) for "React Native CLI Quickstart" > Mac OS > Android
* To run a on a **Development Emulator**: `npm run android`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

## Running the MacOS desktop app 🖥
* To run the **Development app**, run: `npm run desktop`, this will start a new Electron process running on your MacOS desktop in the `dist/Mac` folder.

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into CORS errors like (in the browser dev console)
   ```sh
   Access to fetch at 'https://www.expensify.com/api?command=GetAccountStatus' from origin 'http://localhost:8080' has been blocked by CORS policy
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
   see [PERFORMANCE.md](PERFORMANCE.md#performance-metrics-opt-in-on-local-release-builds) for more information
- `ONYX_METRICS` (optional) - Set this to `true` to capture even more performance metrics and see them in Flipper
   see [React-Native-Onyx#benchmarks](https://github.com/Expensify/react-native-onyx#benchmarks) for more information


----

# Running the tests
## Unit tests
Unit tests are valuable when you want to test one component. They should be short, fast, and ideally only test one thing.
Often times in order to write a unit test, you may need to mock data, a component, or library. We use the library [Jest](https://jestjs.io/)
to help run our Unit tests.

* To run the **Jest unit tests**: `npm run test`

----

# Debugging
### iOS
1. If running on the iOS simulator pressing `⌘D` will open the debugging menu.
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser.
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)

Alternatively, you can also setup debugger using [Flipper](https://fbflipper.com/). After installation, press `⌘D` and select "Open Debugger". This will open Flipper window. To view data stored by Onyx, go to Plugin Manager and install `async-storage` plugin.

## Android
Our React Native Android app now uses the `Hermes` JS engine which requires your browser for remote debugging. These instructions are specific to Chrome since that's what the Hermes documentation provided.
1. Navigate to `chrome://inspect`
2. Use the `Configure...` button to add the Metro server address (typically `localhost:8081`, check your `Metro` output)
3. You should now see a "Hermes React Native" target with an "inspect" link which can be used to bring up a debugger. If you don't see the "inspect" link, make sure the Metro server is running.
4. You can now use the Chrome debug tools. See [React Native Debugging Hermes](https://reactnative.dev/docs/hermes#debugging-hermes-using-google-chromes-devtools)

---

# App Structure and Conventions

## Onyx
This is a persistent storage solution wrapped in a Pub/Sub library. In general that means:

- Onyx stores and retrieves data from persistent storage
- Data is stored as key/value pairs, where the value can be anything from a single piece of data to a complex object
- Collections of data are usually not stored as a single key (eg. an array with multiple objects), but as individual keys+ID (eg. `report_1234`, `report_4567`, etc.). Store collections as individual keys when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.
- Onyx allows other code to subscribe to changes in data, and then publishes change events whenever data is changed
- Anything needing to read Onyx data needs to:
    1. Know what key the data is stored in (for web, you can find this by looking in the JS console > Application > local storage)
    2. Subscribe to changes of the data for a particular key or set of keys. React components use `withOnyx()` and non-React libs use `Onyx.connect()`.
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
    Onyx.merge(ONYXKEYS.ACCOUNT, {loading: true});
    API.Authenticate({
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
            Onyx.merge(ONYXKEYS.ACCOUNT, {loading: false});
        });
}
```

Keeping our `Onyx.merge()` out of the view layer and in actions helps organize things as all interactions with device storage and API handling happen in the same place. In addition, actions that are called from inside views should not ever use the `.then()` method to set loading/error states, navigate or do any additional data processing. All of this stuff should ideally go into `Onyx` and be fed back to the component via `withOnyx()`. Design your actions so they clearly describe what they will do and encapsulate all their logic in that action.

```javascript
// Bad
validateAndSubmitForm() {
    // validate...
    this.setState({loading: true});
    signIn()
        .then((response) => {
            if (result.jsonCode === 200) {
                return;
            }

            this.setState({error: response.message});
        })
        .finally(() => {
            this.setState({loading: false});
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
`<pageName>Page` if there are components used only inside one page, they should live in its own directory named after the `<pageName>`.
- styles: These files define styles used among components/pages

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
- iOS/Android => `index.ios.js`/`index.android.js`
- Web => `index.website.js`
- Desktop => `index.desktop.js`

Note that `index.js` should be the default and only platform-specific implementations should be done in their respective files. i.e: If you have mobile-specific implementation in `index.native.js`, then the desktop/web implementation can be contained in a shared `index.js`. Furthermore, `index.native.js` should not be included in the same module as `index.ios.js` or `index.android.js`.

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

# Philosophy
This application is built with the following principles.
1. **Data Flow** - Ideally, this is how data flows through the app:
    1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> Onyx).
    >**Note:** Currently the code only does this with report comments. Until we make more server changes, this steps is actually done by the client requesting data from the server via XHR and then storing the response in Onyx.
    2. Disk pushes data to the UI (Onyx -> withOnyx() -> React component).
    3. UI pushes data to people's brains (React component -> device screen).
    4. Brain pushes data into UI inputs (Device input -> React component).
    5. UI inputs push data to the server (React component -> Action -> XHR to server).
    6. Go to 1
    ![New Expensify Data Flow Chart](/web/data_flow.png)
1. **Offline first**
    - All data that is brought into the app and is necessary to display the app when offline should be stored on disk in persistent storage (eg. localStorage on browser platforms). [AsyncStorage](https://reactnative.dev/docs/asyncstorage) is a cross-platform abstraction layer that is used to access persistent storage.
    - All data that is displayed, comes from persistent storage.
1. **UI Binds to data on disk**
    - Onyx is a Pub/Sub library to connect the application to the data stored on disk.
    - UI components subscribe to Onyx (using `withOnyx()`) and any change to the Onyx data is published to the component by calling `setState()` with the changed data.
    - Libraries subscribe to Onyx (with `Onyx.connect()`) and any change to the Onyx data is published to the callback with the changed data.
    - The UI should never call any Onyx methods except for `Onyx.connect()`. That is the job of Actions (see next section).
    - The UI always triggers an Action when something needs to happen (eg. a person inputs data, the UI triggers an Action with this data).
    - The UI should be as flexible as possible when it comes to:
        - Incomplete or missing data. Always assume data is incomplete or not there. For example, when a comment is pushed to the client from a pusher event, it's possible that Onyx does not have data for that report yet. That's OK. A partial report object is added to Onyx for the report key `report_1234 = {reportID: 1234, isUnread: true}`. Then there is code that monitors Onyx for reports with incomplete data, and calls `fetchChatReportsByIDs(1234)` to get the full data for that report. The UI should be able to gracefully handle the report object not being complete. In this example, the sidebar wouldn't display any report that doesn't have a report name.
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
    1. If the reason you can't write cross platform code is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.
    1. If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing if (platform=iOS) { }, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.
    1. Put all platform specific code in dedicated files and folders, like /platform, and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.

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
  - Use the [`updateProtectedBranch` workflow](https://github.com/Expensify/App/blob/main/.github/workflows/updateProtectedBranch.yml) to update the `staging` branch.
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
In order to compile a production desktop build, run `npm run desktop-build`, this will generate a production app in the `dist/Mac` folder named `Chat.app`.

#### Local production build the iOS app
In order to compile a production iOS build, run `npm run ios-build`, this will generate a `Chat.ipa` in the root directory of this project.

#### Local production build the Android app
To build an APK to share run (e.g. via Slack), run `npm run android-build`, this will generate a new APK in the `android/app` folder.
