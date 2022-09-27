/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */

// start the usual app
import '../../../index';
import Performance from '../Performance';
import E2EConfig from '../../../e2e/config';
import E2EClient from './client';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

// import your test here, define its name and config first in e2e/config.js
const tests = {
    [E2EConfig.TEST_NAMES.AppStartTime]: require('./tests/appStartTimeTest.e2e'),
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

const testConfig = E2EClient.getTestConfig();

console.debug('[E2E] App startup time test launched, waiting for app to become ready…');
testConfig.then((config) => {
    const test = tests[config.name];
    if (!test) {
        // instead of throwing, report the error to the server, which is better for UX
        return E2EClient.submitTestResults({
            name: config.name,
            error: `Test ${config.name} not found`,
        });
    }

    appReady.then(() => {
        test();
    });
});

