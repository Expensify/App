import * as Sentry from '@sentry/react-native';
import {isDevelopment} from '@libs/Environment/Environment';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
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
        beforeSend: (event) => {
            const email = event.user?.email;
            const lowerEmail = typeof email === 'string' ? email.toLowerCase() : '';
            if (lowerEmail.endsWith(CONST.EMAIL.QA_DOMAIN) || lowerEmail.endsWith('applauseauto.com')) {
                return null;
            }
            return event;
        },
    });
}

export {navigationIntegration};
