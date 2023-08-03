import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import resetFreePlanBankAccount from './resetFreePlanBankAccount';
import deleteFromBankAccountList from './deleteFromBankAccountList';

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute} from './navigation';
export {setBankAccountFormValidationErrors, setPersonalBankAccountFormValidationErrorFields, resetReimbursementAccount} from './errors';

/**
 * Set the current sub step in first step of adding withdrawal bank account:
 * - `null` if we want to go back to the view where the user selects between connecting via Plaid or connecting manually
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL to ask them to enter their accountNumber and routingNumber
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID to ask them to login to their bank via Plaid
 *
 * @param {String} policyID
 * @param {String} subStep
 */
function setBankAccountSubStep(policyID, subStep) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {achData: {subStep}});
}

/**
 * Remove any errors present in the bank account
 *
 * @param {String} policyID
 */
function hideBankAccountErrors(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {error: '', errors: null});
}

/**
 * @param {String} policyID
 * @param {Object} bankAccountData
 */
function updateReimbursementAccountDraft(policyID, bankAccountData) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT_DRAFT}${policyID}`, bankAccountData);
}

/**
 * Triggers a modal to open allowing the user to reset their bank account
 *
 * @param {String} policyID
 */
function requestResetFreePlanBankAccount(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {shouldShowResetModal: true});
}

/**
 * Hides modal allowing the user to reset their bank account
 *
 * @param {String} policyID
 */
function cancelResetFreePlanBankAccount(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {shouldShowResetModal: false});
}

export {
    resetFreePlanBankAccount,
    setBankAccountSubStep,
    hideBankAccountErrors,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
    deleteFromBankAccountList,
};
