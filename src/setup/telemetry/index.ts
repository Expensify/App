import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import {startSpan} from '@libs/telemetry/activeSpans';
import {browserProfilingIntegration, navigationIntegration, tracingIntegration} from '@libs/telemetry/integrations';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import pkg from '../../../package.json';
import makeDebugTransport from './debugTransport';

export default function (): void {
    const integrations = [navigationIntegration, tracingIntegration, browserProfilingIntegration].filter((integration) => !!integration);

    Sentry.init({
        dsn: CONFIG.SENTRY_DSN,
        transport: isDevelopment() ? makeDebugTransport : undefined,
        tracesSampleRate: 1.0,
        profilesSampleRate: Platform.OS === 'android' ? 0 : 1.0,
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
}
