/* eslint-disable import/newline-after-import,import/first */
/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */

import Performance from '../Performance';

// start the usual app
Performance.markStart('regularAppStart');
import '../../../index';
Performance.markEnd('regularAppStart');

import E2EConfig from '../../../e2e/config';
import E2EClient from './client';
import LaunchArguments from './launchArgs';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

const launchArgs = LaunchArguments.value();
console.debug('[E2E] launchArgs', launchArgs);

// import your test here, define its name and config first in e2e/config.js
const tests = {
    [E2EConfig.TEST_NAMES.AppStartTime]: require('./tests/appStartTimeTest.e2e').default,
};

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
const appReady = new Promise((resolve) => {
    Performance.subscribeToMeasurements((entry) => {
        if (entry.name !== 'TTI') {
            return;
        }

        resolve();
    });
});

const testName = E2EClient.getTestName();
const test = tests[testName];
if (!test) {
    throw new Error(`Test '${testName}' not found`);
}
console.debug(`[E2E] Configured for test ${testName}. Waiting for app to become ready`);

appReady.then(() => {
    console.debug('[E2E] App is ready, running test…');
    Performance.measureFailSafe('appStartedToReady', 'regularAppStart');
    test();
});

