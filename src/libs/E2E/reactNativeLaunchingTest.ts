/* eslint-disable import/newline-after-import,import/first */

/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */
import type {ValueOf} from 'type-fest';
import * as Metrics from '@libs/Metrics';
import Performance from '@libs/Performance';
import Config from 'react-native-config';
import E2EConfig from '../../../tests/e2e/config';
import E2EClient from './client';
import installNetworkInterceptor from './utils/NetworkInterceptor';
import LaunchArgs from './utils/LaunchArgs';
import type { TestConfig } from './types';

type Tests = Record<ValueOf<typeof E2EConfig.TEST_NAMES>, (config: TestConfig) => void>;

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

// Check if the performance module is available
if (!Metrics.canCapturePerformanceMetrics()) {
    throw new Error('Performance module not available! Please set CAPTURE_METRICS=true in your environment file!');
}

const appInstanceId = Config.E2E_BRANCH
if (!appInstanceId) {
    throw new Error('E2E_BRANCH not set in environment file!');
}


// import your test here, define its name and config first in e2e/config.js
const tests: Tests = {
    [E2EConfig.TEST_NAMES.AppStartTime]: require('./tests/appStartTimeTest.e2e').default,
    [E2EConfig.TEST_NAMES.OpenChatFinderPage]: require('./tests/openChatFinderPageTest.e2e').default,
    [E2EConfig.TEST_NAMES.ChatOpening]: require('./tests/chatOpeningTest.e2e').default,
    [E2EConfig.TEST_NAMES.ReportTyping]: require('./tests/reportTypingTest.e2e').default,
    [E2EConfig.TEST_NAMES.Linking]: require('./tests/linkingTest.e2e').default,
};

// Once we receive the TII measurement we know that the app is initialized and ready to be used:
const appReady = new Promise<void>((resolve) => {
    Performance.subscribeToMeasurements((entry) => {
        if (entry.name !== 'TTI') {
            return;
        }

        resolve();
    });
});

// Install the network interceptor
installNetworkInterceptor(
    () => E2EClient.getNetworkCache(appInstanceId),
    (networkCache) => E2EClient.updateNetworkCache(appInstanceId, networkCache),
    LaunchArgs.mockNetwork ?? false
)

E2EClient.getTestConfig()
    .then((config): Promise<void> | undefined => {
        const test = tests[config.name];
        if (!test) {
            console.error(`[E2E] Test '${config.name}' not found`);
            // instead of throwing, report the error to the server, which is better for DX
            return E2EClient.submitTestResults({
                name: config.name,
                error: `Test '${config.name}' not found`,
                isCritical: false, 
            });
        }

        console.debug(`[E2E] Configured for test ${config.name}. Waiting for app to become ready`);
        appReady
            .then(() => {
                console.debug('[E2E] App is ready, running test…');
                Performance.measureFailSafe('appStartedToReady', 'regularAppStart');
                test(config);
            })
            .catch((error) => {
                console.error('[E2E] Error while waiting for app to become ready', error);
            });
    })
    .catch((error) => {
        console.error("[E2E] Error while running test. Couldn't get test config!", error);
    });

// start the usual app
Performance.markStart('regularAppStart');
import '../../../index';
Performance.markEnd('regularAppStart');
