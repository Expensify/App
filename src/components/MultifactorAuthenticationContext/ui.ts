import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationNotificationUI, MultifactorAuthenticationPromptUI} from '@libs/MultifactorAuthentication/Biometrics/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import SCENARIO from './scenarios';

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        approved: {
            illustration: Illustrations.ApprovedTransactionHand,
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
        },
        success: {
            illustration: Illustrations.OpenPadlock,
            iconWidth: variables.openPadlockWidth,
            iconHeight: variables.openPadlockHeight,
            padding: spacing.p2,
        },
        denied: {
            illustration: Illustrations.DeniedTransactionHand,
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
        },
        failure: {
            illustration: Illustrations.HumptyDumpty,
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
        },
        outOfTime: {
            illustration: Illustrations.RunOutOfTime,
            iconWidth: variables.runOutOfTimeWidth,
            iconHeight: variables.runOutOfTimeHeight,
            padding: spacing.p0,
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

export {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI, MULTIFACTOR_AUTHENTICATION_PROMPT_UI};
