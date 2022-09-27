/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */

// start the usual app
import '../../../index';
import Performance from '../Performance';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

const tests = [
    require('./tests/appStartTimeTest.e2e').default,
];

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
const appReady = new Promise((resolve) => {
    Performance.subscribeToMeasurements((entry) => {
        if (entry.name !== 'TTI') {
            return;
        }

        resolve();
    });
});

console.debug('[E2E] App startup time test launched, waiting for app to become ready…');
appReady.then(() => {
    // TODO: when supporting multiple test cases, this file will decide which test to run.
    //       The test cases will then be separated in a accompanying /tests folder.
    tests[0]();
});

