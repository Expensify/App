// eslint-disable-next-line no-restricted-imports
import {ApprovedTransactionHand, DeniedTransactionHand, HumptyDumpty, OpenPadlock, RunOutOfTime} from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import type {
    MultifactorAuthenticationNotificationUI,
    MultifactorAuthenticationPromptUI,
    MultifactorAuthenticationUIModalConfigOptions,
} from '@libs/MultifactorAuthentication/Biometrics/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import SCENARIO from './scenarios';

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        approved: {
            illustration: ApprovedTransactionHand,
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            notification: {
                headerTitle: 'multifactorAuthentication.uiText.transactionApproved.headerTitle',
                title: 'multifactorAuthentication.uiText.transactionApproved.title',
            },
        },
        success: {
            illustration: OpenPadlock,
            iconWidth: variables.openPadlockWidth,
            iconHeight: variables.openPadlockHeight,
            padding: spacing.p2,
        },
        denied: {
            illustration: DeniedTransactionHand,
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            notification: {
                headerTitle: 'multifactorAuthentication.uiText.transactionDenied.headerTitle',
                title: 'multifactorAuthentication.uiText.transactionDenied.title',
            },
        },
        failure: {
            illustration: HumptyDumpty,
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
        },
        outOfTime: {
            illustration: RunOutOfTime,
            iconWidth: variables.runOutOfTimeWidth,
            iconHeight: variables.runOutOfTimeHeight,
            padding: spacing.p0,
            notification: {
                headerTitle: 'multifactorAuthentication.uiText.outOfTime.headerTitle',
                title: 'multifactorAuthentication.uiText.outOfTime.title',
            },
        },
    },
} as const satisfies MultifactorAuthenticationNotificationUI;

/* eslint-disable @typescript-eslint/naming-convention */
const MULTIFACTOR_AUTHENTICATION_PROMPT_UI = {
    'enable-biometrics': {
        animation: LottieAnimations.Fingerprint,
        title: 'multiFactorAuthentication.prompts.enableBiometricsPromptTitle',
        subtitle: 'multiFactorAuthentication.prompts.enableBiometricsPromptContent',
    },
    'enable-passkeys': {
        animation: LottieAnimations.Fingerprint,
        title: 'multiFactorAuthentication.prompts.enablePasskeyPromptTitle',
        subtitle: 'multiFactorAuthentication.prompts.enablePasskeyPromptContent',
    },
} as const satisfies MultifactorAuthenticationPromptUI;
/* eslint-enable @typescript-eslint/naming-convention */

const MULTIFACTOR_AUTHENTICATION_MODAL_UI = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multiFactorAuthentication.approveTransaction.denyTransactionContent',
            confirmButtonText: 'multiFactorAuthentication.approveTransaction.denyTransactionButton',
            cancelButtonText: 'common.cancel',
        },
    },
} satisfies MultifactorAuthenticationUIModalConfigOptions;

export {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI, MULTIFACTOR_AUTHENTICATION_PROMPT_UI, MULTIFACTOR_AUTHENTICATION_MODAL_UI};
