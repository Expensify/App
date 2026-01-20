import type {MultifactorAuthenticationDefaultUIConfig, MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import NoEligibleMethodsDescription from '@components/MultifactorAuthentication/NoEligibleMethodsDescription';
// Spacing utilities are needed for icon padding configuration in notification defaults
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';

/**
 * Default UI configuration for all multifactor authentication scenarios with modals and notifications.
 */
const DEFAULT_CONFIG = {
    NOTIFICATIONS: {
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
 * Merges custom scenario configuration with default UI configuration for modals and notifications.
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

    const NOTIFICATIONS = {
        ...DEFAULT_CONFIG.NOTIFICATIONS,
        ...config.NOTIFICATIONS,
        success: {
            ...DEFAULT_CONFIG.NOTIFICATIONS.success,
            ...config.NOTIFICATIONS?.success,
        },
        failure: {
            ...DEFAULT_CONFIG.NOTIFICATIONS.failure,
            ...config.NOTIFICATIONS?.failure,
        },
        outOfTime: {
            ...DEFAULT_CONFIG.NOTIFICATIONS.outOfTime,
            ...config.NOTIFICATIONS?.outOfTime,
        },
        noEligibleMethods: {
            ...DEFAULT_CONFIG.NOTIFICATIONS.noEligibleMethods,
            ...config.NOTIFICATIONS?.noEligibleMethods,
        },
    } as const;

    return {
        ...DEFAULT_CONFIG,
        ...config,
        MODALS,
        NOTIFICATIONS,
    } as const;
}

export default DEFAULT_CONFIG;
export {customConfig};
