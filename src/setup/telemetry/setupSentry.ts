import * as Sentry from '@sentry/react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import {processBeforeSendLogs, processBeforeSendTransactions} from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';
import makeDebugTransport from './debugTransport';

function setupSentry(): void {
    const integrations = [navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration];

    Sentry.init({
        dsn: CONFIG.SENTRY_DSN,
        // In development, debugTransport replaces the default Sentry transport.
        // When "Send data to Sentry" toggle is ON, it forwards envelopes to Sentry via fetch.
        // When the toggle is OFF, it silently discards envelopes (returns 200 noop).
        // When "Log Sentry to console" toggle is ON, it logs envelope contents to the console.
        transport: isDevelopment() ? makeDebugTransport : undefined,
        tracesSampleRate: 1.0,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations,
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
        enableLogs: true,
        beforeSendLog: processBeforeSendLogs,
        // In HybridApp, native SDK is initialized early in Application.onCreate (Android) and
        // AppDelegate (iOS) to capture breadcrumbs during native startup before JS loads.
        autoInitializeNativeSdk: !CONFIG.IS_HYBRID_APP,
        // We set experimental lifecycle value to enable profiling for whole spans. Without this option profile often is dropped early and we haven't the whole picture
        // See https://github.com/Expensify/App/issues/87489
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _experiments: {
            profilingOptions: {
                // When updating the profile sample rate, make sure it will not blow up our current limit in Sentry.
                // This option replaces `profilesSampleRate`
                profileSessionSampleRate: 0.1,
                lifecycle: 'trace',
            },
        },
    });

    Sentry.setTag(CONST.TELEMETRY.TAGS.BUILD_TYPE, CONFIG.IS_HYBRID_APP ? CONST.TELEMETRY.BUILD_TYPE_HYBRID_APP : CONST.TELEMETRY.BUILD_TYPE_STANDALONE);
}

export default setupSentry;
