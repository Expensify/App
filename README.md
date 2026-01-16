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
* [Platform-Specific Setup](#platform-specific-setup)
* [Testing on browsers in simulators and emulators](#testing-on-browsers-in-simulators-and-emulators)
* [Running The Tests](#running-the-tests)

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
4. Run the specific platform with the following command: `npm run <platform>`, e.g. `npm run web`

You can use any IDE or code editing tool for developing on any platform. Use your favorite!

## Recommended `node` setup
In order to have more consistent builds, we use a strict `node` and `npm` version as defined in the `package.json` `engines` field and `.nvmrc` file. `npm install` will fail if you do not use the version defined, so it is recommended to install `node` via `nvm` for easy node version management. Automatic `node` version switching can be installed for [`zsh`](https://github.com/nvm-sh/nvm#zsh) or [`bash`](https://github.com/nvm-sh/nvm#bash) using `nvm`.

# Platform-Specific Setup
For detailed setup instructions for each platform, see the following guides:

* **🕸 Web Development**: [Web Setup Instructions](contributingGuides/SETUP_WEB.md)
* **📱 iOS Development**: [iOS Setup Instructions](contributingGuides/SETUP_IOS.md)  
* **🤖 Android Development**: [Android Setup Instructions](contributingGuides/SETUP_ANDROID.md)

## General Troubleshooting
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
- `USE_REDUX_DEVTOOLS` - Flag to enable [Redux DevTools](https://github.com/reduxjs/redux-devtools) for Onyx state debugging
- `USE_WEB_PROXY`⚠️- Used in web development, it starts a server along the local development server to proxy
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

# Running the tests
## Unit tests
Unit tests are valuable when you want to test one component. They should be short, fast, and ideally only test one thing.
Often times in order to write a unit test, you may need to mock data, a component, or library. We use the library [Jest](https://jestjs.io/)
to help run our Unit tests.

* To run the **Jest unit tests**: `npm run test`
* UI tests guidelines can be found [here](tests/ui/README.md)

## Performance tests
We use Reassure for monitoring performance regression. More detailed information can be found [here](tests/perf-test/README.md):

## CodeCov

[CodeCov](https://about.codecov.io/) is the service we use to measure and track code coverage. You can find out more about it [here](contributingGuides/CodeCov.md)

----
