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
        // When ENABLE_SENTRY_ON_DEV=true, it forwards envelopes to Sentry via fetch.
        // When ENABLE_SENTRY_ON_DEV=false, it silently discards envelopes (returns 200 noop),
        // so Sentry is initialized and collects data locally but nothing is sent to the server.
        // In both modes, when Sentry debug is enabled in the Troubleshoot panel, it logs envelope contents to the console.
        transport: isDevelopment() ? makeDebugTransport : undefined,
        tracesSampleRate: 1.0,
        // 1. Profiling for Android is currently disabled because it causes crashes sometimes.
        // 2. When updating the profile sample rate, make sure it will not blow up our current limit in Sentry.
        profilesSampleRate: 0.1,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations,
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
        enableLogs: true,
        beforeSendLog: processBeforeSendLogs,
    });

    Sentry.setTag(CONST.TELEMETRY.TAGS.BUILD_TYPE, CONFIG.IS_HYBRID_APP ? CONST.TELEMETRY.BUILD_TYPE_HYBRID_APP : CONST.TELEMETRY.BUILD_TYPE_STANDALONE);
}

export default setupSentry;
