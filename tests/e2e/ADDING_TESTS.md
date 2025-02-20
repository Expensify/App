# Adding new E2E Tests

## Creating a new test

Tests are executed on device, inside the app code.

The tests are located in `src/libs/E2E/tests`.

You have to register your test in the `e2e/config`, see the following diff:

### e2e/config.js

First, set the name for you test.

```diff
 const OUTPUT_DIR = 'e2e/.results';
 // add your test name here …
 const TEST_NAMES = {
     AppStartTime: 'App start time',
+    AnotherTest: 'Another test',
 };
```

Then you provide a configuration for you test. At least, you need to
set a name property for the config. You can, however, add any other values
that you might need to pass to the test running inside the app:

```diff
 module.exports = {
    // …
    TESTS_CONFIG: {
+        [TEST_NAMES.AnotherTest]: {
+            name: TEST_NAMES.AnotherTest,
+
+            // ... any additional config you might need
+        },
    },
```

### Create the actual test

We created a new test file in `src/libs/E2E/tests/`. Typically, the
tests ends on `.e2e.js`, so we can distinguish it from the other tests.

Inside this test, we write logic that gets executed in the app. You can basically do
anything here, like connecting to onyx, calling APIs, navigating.

There are some common actions that are common among different test cases:

- `src/libs/E2E/actions/e2eLogin.ts` - Log a user into the app.

The test will be called once the app is ready, which mean you can immediately start.
Your test is expected to default export its test function.

An example test, which test the time it takes to navigate to a screen might looks like this:

```js
// new file in src/libs/E2E/tests/anotherTest.e2e.js

import Navigation from "src/libs/Navigation/Navigation";
import Performance from "src/libs/Performance";
import E2EClient from "./client.js";

const test = () => {
  const firstReportIDInList = // ... some logic to get a report

  performance.markStart("navigateToReport");
  Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(firstReportIDInList));

  // markEnd will be called in the Screen's implementation
  Performance.subscribeToMeasurements((measurement) => {
      if (measurement.name !== "navigateToReport") {
        return;
      }

      E2EClient.submitTestResults({
          name: "Navigate to report",
          metric: measurement.duration,
          unit: 'ms',
      }).then(E2EClient.submitTestDone)
  });

};

export default test;
```

### Last step: register the test in the e2e react native entry

In `src/lib/E2E/reactNativeLaunchingTest.ts` you have to add your newly created
test file:

```diff
 // import your test here, define its name and config first in e2e/config.js
 const tests = {
     [E2EConfig.TEST_NAMES.AppStartTime]: require('./tests/appStartTimeTest.e2e').default,
+    [E2EConfig.TEST_NAMES.AnotherTest]: require('./tests/anotherTest.e2e').default,
 };
```

Done! When you now start the test runner, your new test will be executed as well.

## Quickly test your test

> [!TIP]
> You can only run a specific test by specifying the `--includes` flag:
> ```sh
> npm run test:e2e:dev -- --includes "My new test name"
> ```

It is recommended to run a debug build of the e2e tests first to iterate quickly on your test. Follow the explanation in the [README](./README.md) to create a debug build.

## Debugging your test

You can use regular console statements to debug your test. The output will be visible
in logcat. I recommend opening the android studio logcat window and filter for `ReactNativeJS` to see the output you'd otherwise typically see in your metro bundler instance.
