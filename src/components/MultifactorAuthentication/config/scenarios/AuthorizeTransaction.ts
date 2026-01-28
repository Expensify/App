import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
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
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: authorizeTransaction,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION,
    OUTCOMES: {
        success: {
            illustration: 'ApprovedTransactionHand',
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.reviewTransaction.reviewTransaction',
            title: 'multifactorAuthentication.reviewTransaction.transactionApproved',
            description: 'multifactorAuthentication.reviewTransaction.goBackToTheMerchant',
        },
        failure: {
            illustration: 'DeniedTransactionHand',
            iconWidth: variables.transactionHandWidth,
            iconHeight: variables.transactionHandHeight,
            padding: spacing.p0,
            headerTitle: 'multifactorAuthentication.reviewTransaction.reviewTransaction',
            title: 'multifactorAuthentication.reviewTransaction.transactionDenied',
            description: 'multifactorAuthentication.reviewTransaction.youCanTryAgainAtMerchantOrReachOut',
        },
        outOfTime: {
            headerTitle: 'multifactorAuthentication.reviewTransaction.reviewTransaction',
        },
    },
    MODALS: {
        cancelConfirmation: {
            description: 'multifactorAuthentication.reviewTransaction.areYouSureToDeny',
            confirmButtonText: 'multifactorAuthentication.reviewTransaction.denyTransaction',
        },
    },
    nativePromptTitle: 'multifactorAuthentication.letsVerifyItsYou',
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
