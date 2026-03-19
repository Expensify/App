import React from 'react';
import {AuthorizeTransactionCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {
    DefaultClientFailureScreen,
    DefaultServerFailureScreen,
    NoEligibleMethodsFailureScreen,
    OutOfTimeFailureScreen,
    UnsupportedDeviceFailureScreen,
} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import DefaultSuccessScreen from '@components/MultifactorAuthentication/components/OutcomeScreen/SuccessScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import variables from '@styles/variables';
import {authorizeTransaction, denyTransaction, fireAndForgetDenyTransaction} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

type Payload = {
    transactionID: string;
};

/** Type guard for AuthorizeTransaction scenario. We only check transactionID because Payload for this scenario has no other fields. */
function isAuthorizeTransactionPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'transactionID' in payload;
}

const ApprovedTransactionSuccessScreen = createScreenWithDefaults(
    DefaultSuccessScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionApproved',
        illustration: 'ApprovedTransactionHand',
        iconWidth: variables.transactionHandWidth,
        iconHeight: variables.transactionHandHeight,
        title: 'multifactorAuthentication.reviewTransaction.transactionApproved',
        subtitle: 'multifactorAuthentication.reviewTransaction.goBackToTheMerchant',
    },
    'ApprovedTransactionSuccessScreen',
);

const ApproveTransactionClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        illustration: 'DeniedTransactionHand',
        iconWidth: variables.transactionHandWidth,
        iconHeight: variables.transactionHandHeight,
        title: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        subtitle: 'multifactorAuthentication.reviewTransaction.transactionCouldNotBeCompleted',
    },
    'ApproveTransactionClientFailureScreen',
);

const ApproveTransactionServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        subtitle: 'multifactorAuthentication.reviewTransaction.transactionCouldNotBeCompleted',
    },
    'ApproveTransactionServerFailureScreen',
);

const DeniedTransactionSuccessScreen = createScreenWithDefaults(
    DefaultSuccessScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionDenied',
        illustration: 'DeniedTransactionHand',
        iconWidth: variables.transactionHandWidth,
        iconHeight: variables.transactionHandHeight,
        title: 'multifactorAuthentication.reviewTransaction.transactionDenied',
        subtitle: 'multifactorAuthentication.reviewTransaction.youCanTryAgainAtMerchantOrReachOut',
    },
    'DeniedTransactionSuccessScreen',
);

const DeniedTransactionClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        illustration: 'DeniedTransactionHand',
        iconWidth: variables.transactionHandWidth,
        iconHeight: variables.transactionHandHeight,
        title: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        subtitle: 'multifactorAuthentication.reviewTransaction.transactionCouldNotBeCompletedReachOut',
    },
    'DeniedTransactionClientFailureScreen',
);

const DeniedTransactionServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.transactionFailed',
        subtitle: 'multifactorAuthentication.reviewTransaction.transactionCouldNotBeCompletedReachOut',
    },
    'DeniedTransactionServerFailureScreen',
);

// Used for:
// 1. Approve requested, but transaction already denied
// 2. Deny requested, but transaction already approved
// 3. Approve/deny requested, but transaction already reviewed with unknown outcome
// 4. Onyx data removed for current transaction while on review screen
const AlreadyReviewedFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.reviewTransaction.reviewFailed',
        subtitle: 'multifactorAuthentication.reviewTransaction.alreadyReviewedSubtitle',
    },
    'AlreadyReviewedFailureScreen',
);

export {
    ApprovedTransactionSuccessScreen,
    ApproveTransactionClientFailureScreen,
    ApproveTransactionServerFailureScreen,
    DeniedTransactionSuccessScreen,
    DeniedTransactionClientFailureScreen,
    DeniedTransactionServerFailureScreen,
    AlreadyReviewedFailureScreen,
};

export default {
    // Allowed methods are hardcoded here; keep in sync with allowedAuthenticationMethods in useNavigateTo3DSAuthorizationChallenge.
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: authorizeTransaction,

    // AuthorizeTransaction's callback navigates to the outcome screen, but if it knows the user is going to see an error outcome, we explicitly deny the transaction to make sure the user can't re-approve it on another device
    callback: async (isSuccessful, _callbackInput, payload) => {
        // isAuthorizeTransactionPayload is a type guard - we know that payload here will always be an AuthorizeTransaction Payload, but the type guard lets Typescript guarantee it
        if (!isSuccessful && isAuthorizeTransactionPayload(payload)) {
            fireAndForgetDenyTransaction({transactionID: payload.transactionID});
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION,
    successScreen: <ApprovedTransactionSuccessScreen />,
    defaultClientFailureScreen: <ApproveTransactionClientFailureScreen />,
    defaultServerFailureScreen: <ApproveTransactionServerFailureScreen />,
    /**
     * Called when the user confirms they want to exit the flow (via the cancel confirmation modal).
     * Unlike `callback` which fire-and-forgets the deny (because the outcome screen will be shown regardless),
     * onCancel awaits denyTransaction so the returned reason determines which outcome screen is displayed.
     */
    onCancel: async (payload) => {
        if (!isAuthorizeTransactionPayload(payload)) {
            return {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.CANCELED};
        }
        const result = await denyTransaction({transactionID: payload.transactionID});
        return {...result, payload};
    },
    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TRANSACTION_DENIED]: <DeniedTransactionSuccessScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TRANSACTION_EXPIRED]: <OutOfTimeFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.ALREADY_APPROVED_APPROVE_ATTEMPTED]: <ApprovedTransactionSuccessScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.ALREADY_DENIED_DENY_ATTEMPTED]: <DeniedTransactionSuccessScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.ALREADY_APPROVED_DENY_ATTEMPTED]: <AlreadyReviewedFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.ALREADY_DENIED_APPROVE_ATTEMPTED]: <AlreadyReviewedFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.ALREADY_REVIEWED]: <AlreadyReviewedFailureScreen />,

        // Client-side errors (not returned by the backend API)
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.REQUESTED_TRANSACTION_UNAVAILABLE]: <AlreadyReviewedFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS]: <NoEligibleMethodsFailureScreen headerTitle="multifactorAuthentication.reviewTransaction.transactionFailed" />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE]: <UnsupportedDeviceFailureScreen headerTitle="multifactorAuthentication.reviewTransaction.transactionFailed" />,
    },
    modals: {
        cancelConfirmation: AuthorizeTransactionCancelConfirmModal,
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
