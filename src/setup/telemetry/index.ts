import * as SentryReact from '@sentry/react';
import * as Sentry from '@sentry/react-native';
import {Platform} from 'react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import processBeforeSendTransactions from '@libs/telemetry/middlewares';
import CONFIG from '@src/CONFIG';
import pkg from '../../../package.json';

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

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
        integrations: [navigationIntegration, SentryReact.browserProfilingIntegration(), SentryReact.browserTracingIntegration(), Sentry.reactNativeTracingIntegration()],
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
        beforeSendTransaction: processBeforeSendTransactions,
    });
}

export {navigationIntegration};
