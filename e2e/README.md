# E2E performance regression tests

This directory contains the scripts and configuration files for running the
performance regression tests. These tests are called E2E tests because they
run the app on a real device (physical or emulated).

![Example of a e2e test run](./example.gif)

To run the e2e tests:

1. Connect an android device. The tests are currently designed to run only on android. It can be
   a physical device or an emulator.

2. Make sure Fastlane was initialized by running `bundle install`

3. Run the tests with `npm run test:e2e`.

## Performance regression testing

The output of the tests is a set of performance metrics (see video above).
The test will tell you if the performance significantly worsened for any test case.

For this to work you need a baseline you test against. The baseline is set by default
to the `main` branch.

The test suite will run each test-case twice, once on the baseline, and then on the branch
you are currently on.

It will run the tests of a test case multiple time to average out the results.

## Adding tests

To add a test checkout the [designed guide](./ADDING_TESTS.md).

## Structure

For the test suite, no additional tooling was used. It is made of the following
components:

- Test server:
  - A nodeJS application that starts an HTTP server.
  - Receives test results from the app.
  - Located in `e2e/server`.

- Client:
  - Client-side code (app) for communication with the test server.
  - Located in `src/libs/E2E/client.js`.

- The tests themselves :
  - Currently, there is only one test case, which tests the performance of the app start time.
  - As opposed to other test frameworks, the tests are _inside the app_, and execute logic using app code (e.g. `navigationRef.navigate('Signin')`)
  - Located inside the app `src/libs/E2E/reactNativeLaunchingTest.js`

- The test runner:
    - Orchestrates the test suite.
    - Runs the app with the tests on a device
    - Responsible for gathering and comparing results
    - Located in `e2e/testRunner.js`.


## How a test gets executed

There exists a custom android entry point for the app, which is used for the e2e tests.
The entry file used is `src/libs/E2E/reactNativeEntry.js`, and here we can add our test case.

The test case should only execute its test once. The _test runner_ is responsible for running the
test multiple time to average out the results.

Any results of the test (which is usually a duration, like "Time it took to reopen chat", or "TTI") should be
submitted to the test server using the client:

```js
import E2EClient from './client';

// ... run you test logic
const someDurationWeCollected = // ...

E2EClient.submitTestResults({
    name: 'My test name',
    duration: someDurationWeCollected,
});
```

Submitting test results doesn't automatically finish the test. This enables you do submit multiple test results
from one test (e.g. measuring multiple things at the same time).

To finish a test call `E2EClient.submitTestDone()`.


## Android specifics

The tests are designed to run on android (although adding support for iOS should be easy to add).
To test under realistic conditions during the tests a release build is used.

However, to be able to call our local HTTP test server, we need to allow
[cleartext http traffic](https://developer.android.com/training/articles/security-config#CleartextTrafficPermitted).
Therefore, a customized release build type is needed, which is called `e2eRelease`. This build type has clear
text traffic enabled but works otherwise just like a release build.

In addition to that, another entry file will be used (instead of `index.js`). The entry file used is
`src/libs/E2E/reactNativeEntry.js`. By using a custom entry file we avoid bundling any e2e testing code
into the actual release app.

For the app to detect that it is currently running e2e tests, an environment variable called `E2E_TESTING=true` must
be set. There is a custom environment file in `e2e/.env.e2e` that contains the env setup needed. The build automatically
picks this file for configuration.

It can be useful to debug the app while running the e2e tests (to catch errors durign development of a test).
You can simply add the `debuggable true` property to the `e2eRelease` buildType config in `android/app/build.gradle`.
Then rebuild the app. You can now monitor the app's logs using `logcat` (`adb logcat | grep "ReactNativeJS"`).

## Test the accuracy of the test suite

If you run the tests on the same branch, the result should ideally be a difference of 0%. However, as the tests
get executed on an emulator, there will be some variance. This variance is mitigated by using statistical tools
such as [z-test](https://en.wikipedia.org/wiki/Z-test). However, when running on the same branch, the results
should be below 5% of change.
You might want to tweak the values in `e2e/config.js` to adjust those values.

