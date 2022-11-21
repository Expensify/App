import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import * as store from './store';
import * as API from '../../API';

/**
 * Reset user's reimbursement account. This will delete the bank account.
 */
function resetFreePlanBankAccount() {
    const bankAccountID = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');
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
                {
                    onyxMethod: 'set',
                    key: ONYXKEYS.ONFIDO_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: 'set',
                    key: ONYXKEYS.PLAID_DATA,
                    value: {},
                },
                {
                    onyxMethod: 'set',
                    key: ONYXKEYS.PLAID_LINK_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: 'set',
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        achData: {},
                        shouldShowResetModal: false,
                    },
                },
                {
                    onyxMethod: 'set',
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
                    value: null,
                },
            ],
        });
}

export default resetFreePlanBankAccount;
