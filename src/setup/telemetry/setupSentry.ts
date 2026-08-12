import {isDevelopment} from '@libs/Environment/Environment';
import {
    breadcrumbsIntegration,
    browserProfilingIntegration,
    consoleIntegration,
    navigationIntegration,
    reportingObserverIntegration,
    thirdPartyErrorFilterIntegration,
    tracingIntegration,
} from '@libs/telemetry/integrations';
import {processBeforeSendLogs, processBeforeSendTransactions} from '@libs/telemetry/middlewares';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

import pkg from '../../../package.json';
import makeDebugTransport from './debugTransport';

/**
 * Schemes browser extensions inject code under. An error whose top stack frame lives at one of these
 * URLs was thrown inside extension code, not ours, so there is nothing for us to act on.
 *
 * These have to be matched here rather than by Sentry's server-side browser-extension inbound filter:
 * the React Native SDK's `rewriteFrames` integration flattens every frame's filename to `app:///...`
 * before the event is sent, so the server never sees the original scheme. `denyUrls` is evaluated by
 * `inboundFilters`, which the SDK registers ahead of `rewriteFrames`, so it still reads the real URL.
 *
 * Safari ships two schemes: `safari-extension://` for legacy app extensions and
 * `safari-web-extension://` for the WebExtension API, and neither string contains the other.
 */
const EXTENSION_DENY_URLS = [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i, /^safari-web-extension:\/\//i];

function setupSentry(): void {
    const integrations = [
        navigationIntegration,
        tracingIntegration,
        browserProfilingIntegration,
        breadcrumbsIntegration,
        consoleIntegration,
        reportingObserverIntegration,
        thirdPartyErrorFilterIntegration,
    ].filter((integration): integration is NonNullable<typeof integration> => integration !== undefined);

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
        // UPDATE_REQUIRED is not a real error and makes our errors in Spotnana spike and get rate limited when we bump the app min version, so ignore it
        ignoreErrors: [CONST.ERROR.UPDATE_REQUIRED],
        denyUrls: EXTENSION_DENY_URLS,
        beforeSendTransaction: processBeforeSendTransactions,
        enableLogs: true,
        beforeSendLog: processBeforeSendLogs,
        // Native SDK is initialized early in Application.onCreate (Android) and AppDelegate (iOS)
        // via SentryNativeSDKManager so native code can report to Sentry before JS loads.
        autoInitializeNativeSdk: false,
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
