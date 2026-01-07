import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {biometricsTest} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';

export default {
    allowedAuthentication: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
    action: biometricsTest,
    pure: true,
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
