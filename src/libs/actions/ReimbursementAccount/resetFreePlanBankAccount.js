import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import * as API from '../../API';
import CONST from '../../../CONST';
import {getReimbursementAccountInSetup, getCredentials} from './store';
import Growl from '../../Growl';

/**
 * Reset user's reimbursement account. This will delete the bank account.
 */
function resetFreePlanBankAccount() {
    const bankAccountID = lodashGet(getReimbursementAccountInSetup(), 'bankAccountID');
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!getCredentials() || !getCredentials().login) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    // Create a copy of the reimbursementAccount data since we are going to optimistically wipe it so the UI changes quickly.
    // If the API request fails we will set this data back into Onyx.
    const previousACHData = {...getReimbursementAccountInSetup()};
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: null, shouldShowResetModal: false});
    API.DeleteBankAccount({bankAccountID, ownerEmail: getCredentials().login})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Unable to delete bank account so we restore the bank account details
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: previousACHData});
                Growl.error('Sorry we were unable to delete this bank account. Please try again later');
                return;
            }

            // Clear reimbursement account, draft user input, and the bank account list
            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {});
            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, null);
            Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, []);

            // Clear the NVP for the bank account so the user can add a new one
            API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: ''});
        });
}

export default resetFreePlanBankAccount;
