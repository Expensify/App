import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {troubleshootMultifactorAuthentication} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

/**
 * Configuration for the SET_PIN_ORDER_CARD multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder sets their PIN during the card ordering process.
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: troubleshootMultifactorAuthentication,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.SET_PIN_ORDER_CARD,
    pure: true,
    OUTCOMES: {
        success: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        },
        failure: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        },
        outOfTime: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        },
        noEligibleMethods: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        },
        unsupportedDevice: {
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        },
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig;
