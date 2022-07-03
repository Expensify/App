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
 * @param {string} onyxKey
 * @param {Object} errorFields
 */
function setFormValidationErrorFields(onyxKey, errorFields) {
    // We set 'errors' to null first because we don't have a way yet to replace a specific property like 'errors' without merging it
    Onyx.merge(onyxKey, {errorFields: null});
    Onyx.merge(onyxKey, {errorFields});
}

/**
 * Set the current fields with errors.
 *
 * @param {String} errors
 */
function setBankAccountFormValidationErrors(errors) {
    setFormValidationErrorFields(ONYXKEYS.REIMBURSEMENT_ACCOUNT, errors);
}

/**
 * Clear validation messages from reimbursement account
 */
function resetReimbursementAccount() {
    this.setBankAccountFormValidationErrors({});
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
    setFormValidationErrorFields,
    showBankAccountFormValidationError,
    resetReimbursementAccount,
};
