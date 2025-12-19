import type {MultifactorAuthenticationDefaultUIConfig, MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';

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

function customConfig<const T extends MultifactorAuthenticationScenarioCustomConfig<never>>(config: T) {
    const MODALS = {
        ...config.MODALS,
        cancelConfirmation: {
            ...DEFAULT_CONFIG.MODALS.cancelConfirmation,
            ...config.MODALS?.cancelConfirmation,
        },
    } as const;

    const NOTIFICATIONS = {
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
