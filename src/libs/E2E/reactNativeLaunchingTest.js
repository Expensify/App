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

console.log('==========================');
console.log('==== Running e2e test ====');
console.log('==========================');

// import your test here, define its name and config first in e2e/config.js
const tests = {
    [E2EConfig.TEST_NAMES.AppStartTime]: require('../../../tests/e2e/tests/appStartTimeTest.e2e').default,
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

console.log('[E2E] Sending get test config request');
E2EClient.getTestConfig().then((config) => {
    const test = tests[config.name];
    if (!test) {
        // instead of throwing, report the error to the server, which is better for DX
        return E2EClient.submitTestResults({
            name: config.name,
            error: `Test '${config.name}' not found`,
        });
    }
    console.log(`[E2E] Configured for test ${config.name}. Waiting for app to become ready`);

    appReady.then(() => {
        console.log('[E2E] App is ready, running test…');
        Performance.measureFailSafe('appStartedToReady', 'regularAppStart');
        test();
    });
});

