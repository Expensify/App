import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import resetFreePlanBankAccount from './resetFreePlanBankAccount';
import deleteFromBankAccountList from './deleteFromBankAccountList';

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute} from './navigation';
export {
    setBankAccountFormValidationErrors,
    setPersonalBankAccountFormValidationErrorFields,
    resetReimbursementAccount,
    showBankAccountFormValidationError,
} from './errors';

/**
 * Set the current sub step in first step of adding withdrawal bank account
 *
 * @param {String} subStep - One of {CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL, CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID, null}
 */
function setBankAccountSubStep(subStep) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {subStep}});
}

function hideBankAccountErrors() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error: '', errors: null});
}

function setWorkspaceIDForReimbursementAccount(workspaceID) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID, workspaceID);
}

/**
 * @param {Object} bankAccountData
 */
function updateReimbursementAccountDraft(bankAccountData) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, bankAccountData);
}

/**
 * Triggers a modal to open allowing the user to reset their bank account
 */
function requestResetFreePlanBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: true});
}

/**
 * Hides modal allowing the user to reset their bank account
 */
function cancelResetFreePlanBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: false});
}

export {
    resetFreePlanBankAccount,
    setBankAccountSubStep,
    hideBankAccountErrors,
    setWorkspaceIDForReimbursementAccount,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
    deleteFromBankAccountList,
};
