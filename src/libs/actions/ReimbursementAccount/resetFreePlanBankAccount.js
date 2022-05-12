import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import * as API from '../../API';
import CONST from '../../../CONST';
import * as store from './store';
import Growl from '../../Growl';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';

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

    // Create a copy of the reimbursementAccount data since we are going to optimistically wipe it so the UI changes quickly.
    // If the API request fails we will set this data back into Onyx.
    const previousACHData = {...store.getReimbursementAccountInSetup()};
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: null, shouldShowResetModal: false});
    API.DeleteBankAccount({bankAccountID, ownerEmail: store.getCredentials().login})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Unable to delete bank account so we restore the bank account details
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: previousACHData});
                Growl.error('Sorry we were unable to delete this bank account. Please try again later');
                return;
            }

            // Reset reimbursement account, and clear draft user input
            const achData = {
                useOnfido: true,
                policyID: '',
                isInSetup: true,
                domainLimit: 0,
                currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
            };

            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData});
            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, null);

            // Clear the NVP for the bank account so the user can add a new one and navigate back to bank account page
            API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: ''});
            Navigation.navigate(ROUTES.getBankAccountRoute());
        });
}

export default resetFreePlanBankAccount;
