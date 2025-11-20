import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import {startSpan} from '@libs/telemetry/activeSpans';
import {browserTracingIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';

export default function (): void {
    if (isDevelopment()) {
        return;
    }
    Sentry.init({
        dsn: CONFIG.SENTRY_DSN,
        tracesSampleRate: 1.0,
        profilesSampleRate: Platform.OS === 'android' ? 0 : 1.0,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations: [navigationIntegration, tracingIntegration, browserTracingIntegration, SentryReact.browserProfilingIntegration()],
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
    });

    startSpan(CONST.TELEMETRY.SPAN_APP_STARTUP, {
        name: CONST.TELEMETRY.SPAN_APP_STARTUP,
        op: CONST.TELEMETRY.SPAN_APP_STARTUP,
    });
}
