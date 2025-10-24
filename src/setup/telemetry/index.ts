import * as Sentry from '@sentry/react-native';
import CONFIG from '@src/CONFIG';
import pkg from '../../../package.json';

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

export default function (): void {
    Sentry.init({
        dsn: 'https://7b463fb4d4402d342d1166d929a62f4e@o4510228013121536.ingest.us.sentry.io/4510228107427840',
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        enableAutoPerformanceTracing: true,
        enableUserInteractionTracing: true,
        integrations: [navigationIntegration],
        environment: `${CONFIG.ENVIRONMENT}-${CONFIG.IS_HYBRID_APP ? 'hybrid' : 'standalone'}`,
        release: `${pkg.name}@${pkg.version}`,
    });

    Sentry.captureMessage('Sentry initialized successfully!');
}

export {navigationIntegration};
