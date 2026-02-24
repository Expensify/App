import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import performance, {PerformanceObserver} from 'react-native-performance';
import {isDevelopment} from '@libs/Environment/Environment';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {breadcrumbsIntegration, browserProfilingIntegration, consoleIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';
import makeDebugTransport from './debugTransport';

export default function (): void {
    // With Sentry enabled in dev mode, profiling on iOS and Android does not work
    // If you want to enable Sentry in dev, set ENABLE_SENTRY_ON_DEV=true in .env
    // or comment out the condition below
    if (isDevelopment() && !CONFIG.ENABLE_SENTRY_ON_DEV) {
        return;
    }

    const integrations = [navigationIntegration, tracingIntegration, browserProfilingIntegration, breadcrumbsIntegration, consoleIntegration].filter((integration) => !!integration);

    Sentry.init({
        dsn: CONFIG.SENTRY_DSN,
        transport: isDevelopment() ? makeDebugTransport : undefined,
        tracesSampleRate: 1.0,
        // 1. Profiling for Android is currently disabled because it causes crashes sometimes.
        // 2. When updating the profile sample rate, make sure it will not blow up our current limit in Sentry.
        profilesSampleRate: Platform.OS === 'android' ? 0 : 0.3,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations,
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
        enableLogs: true,
    });

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });

    const runJsBundleStartEntries = performance.getEntriesByName('runJsBundleStart');
    if (runJsBundleStartEntries.length > 0) {
        const jsParseStartSecs = (runJsBundleStartEntries.at(0)?.startTime ?? 0) / 1000;

        startSpan(CONST.TELEMETRY.SPAN_JS_PARSE_TIME, {
            name: CONST.TELEMETRY.SPAN_JS_PARSE_TIME,
            op: CONST.TELEMETRY.SPAN_JS_PARSE_TIME,
            startTime: jsParseStartSecs,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_APP_STARTUP),
        });

        const finishJsParseSpan = (endTimeSecs: number) => {
            endSpan(CONST.TELEMETRY.SPAN_JS_PARSE_TIME, endTimeSecs);
        };

        const runJsBundleEndEntries = performance.getEntriesByName('runJsBundleEnd');
        if (runJsBundleEndEntries.length > 0) {
            finishJsParseSpan((runJsBundleEndEntries.at(0)?.startTime ?? 0) / 1000);
        } else {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntriesByName('runJsBundleEnd');
                if (entries.length > 0) {
                    finishJsParseSpan((entries.at(0)?.startTime ?? 0) / 1000);
                    observer.disconnect();
                }
            });
            observer.observe({type: 'mark', buffered: true});
        }
    }
}
