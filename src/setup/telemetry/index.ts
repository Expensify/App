import * as Sentry from '@sentry/react-native';
import CONFIG from '@src/CONFIG';
import pkg from '../../../package.json';

const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
});

export default function (): void {
    Sentry.init({
        dsn: 'https://c30560649568161d294f43893a3d0f5e@o4509989802344448.ingest.us.sentry.io/4509990212730880',
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        enableUserInteractionTracing: true,
        integrations: [Sentry.mobileReplayIntegration(), navigationIntegration],
        environment: `${CONFIG.ENVIRONMENT}-${CONFIG.IS_HYBRID_APP ? 'hybrid' : 'standalone'}`,
        release: `${pkg.name}@${pkg.version}`,
    });
}

export {navigationIntegration};
