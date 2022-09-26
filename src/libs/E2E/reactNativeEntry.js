/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */

// start the usual app
import '../../../index';

import * as E2EClient from './client';
import Performance from '../Performance';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

// Start to listen to websocket commands
E2EClient.listenForServerCommands();

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
Performance.subscribeToMeasurements((entry) => {
    if (entry.name !== 'TTI') {
        return;
    }

    E2EClient.markAppReady();
});
