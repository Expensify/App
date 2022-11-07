import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as store from './store';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import * as API from '../../API';
import BankAccount from '../../models/BankAccount';

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

    const achData = {
        useOnfido: true,
        policyID: '',
        isInSetup: true,
        domainLimit: 0,
        currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        state: BankAccount.STATE.DELETED,
    };

    API.write('RestartBankAccountSetup',
        {
            bankAccountID,
            ownerEmail: store.getCredentials().login,
        },
        {
            optimisticData: [{
                onyxMethod: 'merge',
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {achData, shouldShowResetModal: false},
            },
            {
                onyxMethod: 'set',
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
                value: null,
            }],
        });

    Navigation.navigate(ROUTES.getBankAccountRoute());
}

export default resetFreePlanBankAccount;
