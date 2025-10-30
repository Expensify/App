import * as Sentry from '@sentry/react-native';
import {isDevelopment} from '@libs/Environment/Environment';
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
        profilesSampleRate: 1.0,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations: [navigationIntegration],
        environment: CONFIG.ENVIRONMENT,
        release: `${pkg.name}@${pkg.version}`,
    });

    Sentry.captureMessage('Sentry initialized successfully!');
}

export {navigationIntegration};
