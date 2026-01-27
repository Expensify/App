import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {troubleshootMultifactorAuthentication} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

/**
 * Configuration for the biometrics test multifactor authentication scenario.
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: troubleshootMultifactorAuthentication,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST,
    pure: true,
    OUTCOMES: {
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
