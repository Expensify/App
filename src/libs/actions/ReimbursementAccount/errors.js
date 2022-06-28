import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * Show error modal and optionally a specific error message
 *
 * @param {String} error The error message to be displayed in the form.
 * @param {Boolean} isErrorHtml if @errorModalMessage is in html format or not
 */
function showBankAccountErrorModal(error = null, isErrorHtml = false) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error, isErrorHtml});
}

/**
 * Set the current fields with errors.
 *
 * @param {String} errors
 */
function setBankAccountFormValidationErrors(errors) {
    // We set 'errors' to null first because we don't have a way yet to replace a specific property like 'errors' without merging it
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors});
}

/**
 * Clear validation messages from reimbursement account
 */
function resetReimbursementAccount() {
    setBankAccountFormValidationErrors({});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {successRoute: null});
}

/**
 * Set the current error message.
 *
 * @param {String} error
 */
function showBankAccountFormValidationError(error) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error});
}

export {
    showBankAccountErrorModal,
    setBankAccountFormValidationErrors,
    showBankAccountFormValidationError,
    resetReimbursementAccount,
};
