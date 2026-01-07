import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';

export default {
    allowedAuthentication: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
    NOTIFICATIONS: {
        success: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
        },
        failure: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
        },
        outOfTime: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
        },
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig;
