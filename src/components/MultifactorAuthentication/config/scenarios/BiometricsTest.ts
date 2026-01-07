import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {biometricsTest} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

export default {
    allowedAuthentication: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
    action: biometricsTest,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST,
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
