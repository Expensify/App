import type {MultifactorAuthenticationDefaultUIConfig, MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import NoEligibleMethodsDescription from '@components/MultifactorAuthentication/NoEligibleMethodsDescription';
// Spacing utilities are needed for icon padding configuration in outcomes defaults
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';

/**
 * Default UI configuration for all multifactor authentication scenarios with modals and outcomes.
 */
const DEFAULT_CONFIG = {
    OUTCOMES: {
        success: {
            illustration: 'OpenPadlock',
            iconWidth: variables.openPadlockWidth,
            iconHeight: variables.openPadlockHeight,
            padding: spacing.p2,
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
            title: 'multifactorAuthentication.biometricsTest.authenticationSuccessful',
            description: 'multifactorAuthentication.biometricsTest.successfullyAuthenticatedUsing',
        },
        failure: {
            illustration: 'HumptyDumpty',
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
            title: 'multifactorAuthentication.oops',
            description: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
        },
        outOfTime: {
            illustration: 'RunOutOfTime',
            iconWidth: variables.runOutOfTimeWidth,
            iconHeight: variables.runOutOfTimeHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
            title: 'multifactorAuthentication.youRanOutOfTime',
            description: 'multifactorAuthentication.looksLikeYouRanOutOfTime',
        },
        noEligibleMethods: {
            illustration: 'HumptyDumpty',
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
            title: 'multifactorAuthentication.biometricsTest.youCouldNotBeAuthenticated',
            description: 'multifactorAuthentication.biometricsTest.youCouldNotBeAuthenticated',
            customDescription: NoEligibleMethodsDescription,
        },
    },
    MODALS: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multifactorAuthentication.biometricsTest.areYouSureToReject',
            confirmButtonText: 'multifactorAuthentication.biometricsTest.rejectAuthentication',
            cancelButtonText: 'common.cancel',
        },
    },
    nativePromptTitle: 'multifactorAuthentication.letsVerifyItsYou',
} as const satisfies MultifactorAuthenticationDefaultUIConfig;

/**
 * Merges custom scenario configuration with default UI configuration for modals and outcomes.
 */
function customConfig<const T extends MultifactorAuthenticationScenarioCustomConfig<never>>(config: T) {
    const MODALS = {
        ...DEFAULT_CONFIG.MODALS,
        ...config.MODALS,
        cancelConfirmation: {
            ...DEFAULT_CONFIG.MODALS.cancelConfirmation,
            ...config.MODALS?.cancelConfirmation,
        },
    } as const;

    const OUTCOMES = {
        ...DEFAULT_CONFIG.OUTCOMES,
        ...config.OUTCOMES,
        success: {
            ...DEFAULT_CONFIG.OUTCOMES.success,
            ...config.OUTCOMES?.success,
        },
        failure: {
            ...DEFAULT_CONFIG.OUTCOMES.failure,
            ...config.OUTCOMES?.failure,
        },
        outOfTime: {
            ...DEFAULT_CONFIG.OUTCOMES.outOfTime,
            ...config.OUTCOMES?.outOfTime,
        },
        noEligibleMethods: {
            ...DEFAULT_CONFIG.OUTCOMES.noEligibleMethods,
            ...config.OUTCOMES?.noEligibleMethods,
        },
    } as const;

    return {
        ...DEFAULT_CONFIG,
        ...config,
        MODALS,
        OUTCOMES,
    } as const;
}

export default DEFAULT_CONFIG;
export {customConfig};
