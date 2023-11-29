import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import * as PlaidDataProps from '@pages/ReimbursementAccount/plaidDataPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Reset user's reimbursement account. This will delete the bank account.
 * @param {Number} bankAccountID
 * @param {Object} session
 */
function resetFreePlanBankAccount(bankAccountID, session) {
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!session.email) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    API.write(
        'RestartBankAccountSetup',
        {
            bankAccountID,
            ownerEmail: session.email,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        shouldShowResetModal: false,
                        isLoading: true,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        achData: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_DATA,
                    value: PlaidDataProps.plaidDataDefaultProps,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_LINK_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: ReimbursementAccountProps.reimbursementAccountDefaultProps,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
                    value: {},
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {isLoading: false, pendingAction: null},
                },
            ],
        },
    );
}

export default resetFreePlanBankAccount;
