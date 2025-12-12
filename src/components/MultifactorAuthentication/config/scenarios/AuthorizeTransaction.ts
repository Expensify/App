import type {MultifactorAuthenticationScenarioConfig} from '@components/MultifactorAuthentication/config/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import {authorizeTransaction} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

type Payload = {
    transactionID: string;
};

export default {
    allowedAuthentication: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
    action: authorizeTransaction,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.APPROVE_TRANSACTION,
    NOTIFICATIONS: {
        approved: {
            illustration: 'ApprovedTransactionHand',
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.uiText.transactionApproved.headerTitle',
            title: 'multifactorAuthentication.uiText.transactionApproved.title',
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
            headerTitle: 'multifactorAuthentication.uiText.transactionDenied.headerTitle',
            title: 'multifactorAuthentication.uiText.transactionDenied.title',
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
            headerTitle: 'multifactorAuthentication.uiText.outOfTime.headerTitle',
            title: 'multifactorAuthentication.uiText.outOfTime.title',
        },
    },
    MODALS: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multifactorAuthentication.approveTransaction.denyTransactionContent',
            confirmButtonText: 'multifactorAuthentication.approveTransaction.denyTransactionButton',
            cancelButtonText: 'common.cancel',
        },
    },
} as const satisfies MultifactorAuthenticationScenarioConfig<Payload>;

export type {Payload};
