import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import * as store from './store';
import * as API from '../../API';
import * as PlaidDataProps from '../../../pages/ReimbursementAccount/plaidDataPropTypes';
import * as ReimbursementAccountProps from '../../../pages/ReimbursementAccount/reimbursementAccountPropTypes';

/**
 * Reset user's reimbursement account. This will delete the bank account.
 * @param {number} bankAccountID
 */
function resetFreePlanBankAccount(bankAccountID) {
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!store.getCredentials() || !store.getCredentials().login) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    API.write('RestartBankAccountSetup',
        {
            bankAccountID,
            ownerEmail: store.getCredentials().login,
        },
        {
            optimisticData: [
                // This bank account is present in ONYXKEYS.BANK_ACCOUNT_LIST
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {[bankAccountID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {shouldShowResetModal: false},
                },

                // TODO: What is this loading state? doesn't seem to be used
                // {
                //     onyxMethod: CONST.ONYX.METHOD.MERGE,
                //     key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                //     value: {isLoading: true},
                // },
            ],
            successData: [
                {
                    onyxMethod: CONST.ONYX.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.SET,
                    key: ONYXKEYS.PLAID_DATA,
                    value: PlaidDataProps.plaidDataDefaultProps,
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.SET,
                    key: ONYXKEYS.PLAID_LINK_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: ReimbursementAccountProps.reimbursementAccountDefaultProps,
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
                    value: {},
                },

                // TODO: What is this loading state? doesn't seem to be used
                // {
                //     onyxMethod: CONST.ONYX.METHOD.MERGE,
                //     key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                //     value: {isLoading: false},
                // },
            ],
            failureData: [
                // TODO: What is this loading state? doesn't seem to be used
                // {
                //     onyxMethod: CONST.ONYX.METHOD.MERGE,
                //     key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                //     value: {isLoading: false},
                // },
            ],
        });
}

export default resetFreePlanBankAccount;
