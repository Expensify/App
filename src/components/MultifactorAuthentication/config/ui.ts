import LottieAnimations from '@components/LottieAnimations';
import type {MultifactorAuthenticationNotificationMap, MultifactorAuthenticationNotificationMapEntry} from '@components/MultifactorAuthentication/types';
import {toLowerCase} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {
    MultifactorAuthenticationNotificationUI,
    MultifactorAuthenticationPromptUI,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationUIModalConfigOptions,
} from '@libs/MultifactorAuthentication/Biometrics/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import SCENARIO from './scenarios';

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        approved: {
            illustration: 'ApprovedTransactionHand',
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            notification: {
                headerTitle: 'multifactorAuthentication.uiText.transactionApproved.headerTitle',
                title: 'multifactorAuthentication.uiText.transactionApproved.title',
            },
        },
        success: {
            illustration: 'OpenPadlock',
            iconWidth: variables.openPadlockWidth,
            iconHeight: variables.openPadlockHeight,
            padding: spacing.p2,
        },
        denied: {
            illustration: 'DeniedTransactionHand',
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            notification: {
                headerTitle: 'multifactorAuthentication.uiText.transactionDenied.headerTitle',
                title: 'multifactorAuthentication.uiText.transactionDenied.title',
            },
        },
        failure: {
            illustration: 'HumptyDumpty',
            iconWidth: variables.humptyDumptyWidth,
            iconHeight: variables.humptyDumptyHeight,
            padding: spacing.p0,
        },
        outOfTime: {
            illustration: 'RunOutOfTime',
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
        title: 'multifactorAuthentication.prompts.enableBiometricsPromptTitle',
        subtitle: 'multifactorAuthentication.prompts.enableBiometricsPromptContent',
    },
    'enable-passkeys': {
        animation: LottieAnimations.Fingerprint,
        title: 'multifactorAuthentication.prompts.enablePasskeyPromptTitle',
        subtitle: 'multifactorAuthentication.prompts.enablePasskeyPromptContent',
    },
} as const satisfies MultifactorAuthenticationPromptUI;
/* eslint-enable @typescript-eslint/naming-convention */

const MULTIFACTOR_AUTHENTICATION_MODAL_UI = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multifactorAuthentication.approveTransaction.denyTransactionContent',
            confirmButtonText: 'multifactorAuthentication.approveTransaction.denyTransactionButton',
            cancelButtonText: 'common.cancel',
        },
    },
} satisfies MultifactorAuthenticationUIModalConfigOptions;

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP = Object.entries(MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI).reduce(
    (_, [key, config]) =>
        Object.assign(
            config,
            Object.entries(config).reduce((entry, [name, ui]) => {
                // eslint-disable-next-line no-param-reassign
                entry[`${toLowerCase(key as MultifactorAuthenticationScenario)}-${toLowerCase(name as keyof typeof config)}`] = ui;
                return entry;
            }, {} as MultifactorAuthenticationNotificationMapEntry),
        ),
    {} as MultifactorAuthenticationNotificationMap,
);

export {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI, MULTIFACTOR_AUTHENTICATION_PROMPT_UI, MULTIFACTOR_AUTHENTICATION_MODAL_UI, MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP};
