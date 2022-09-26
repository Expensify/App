/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */

// start the usual app
import '../../../index';

import _ from 'underscore';
import Performance from '../Performance';
import E2ELogin from './actions/e2eLogin';
import E2EClient from './client';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
const appReady = new Promise((resolve) => {
    Performance.subscribeToMeasurements((entry) => {
        if (entry.name !== 'TTI') {
            return;
        }

        resolve();
    });
});

// TODO: when supporting multiple test cases, this file will decide which test to run.
//       The test cases will then be separated in a accompanying /tests folder.

const test = () => {
    const email = 'applausetester+perf2@applause.expensifail.com';
    const password = 'Password123';

    console.debug('[E2E] App startup time test launched, waiting for app to become ready…');
    appReady.then(() => {
        console.debug('[E2E] App is ready, logging in…');

        // check for login (if already logged in the action won't do anything)
        E2ELogin(email, password).then(() => {
            console.debug('[E2E] Logged in, getting metrics and submitting them…');

            // collect performance metrics and submit
            const metrics = Performance.getPerformanceMetrics();

            // underscore promises in sequence without for-loop
            _.reduce(metrics, (promise, metric) => promise.then(() => E2EClient.submitTestResults({
                name: metric.name,
                duration: metric.duration,
            })), Promise.resolve()).then(() => {
                console.debug('[E2E] Done, exiting…');
                E2EClient.submitTestDone();
            });
        });
    });
};
test();

