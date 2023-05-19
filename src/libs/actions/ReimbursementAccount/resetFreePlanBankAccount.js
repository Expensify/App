import Onyx from 'react-native-onyx';
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

    API.write(
        'RestartBankAccountSetup',
        {
            bankAccountID,
            ownerEmail: store.getCredentials().login,
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
