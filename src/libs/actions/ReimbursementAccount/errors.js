import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * Show error modal and optionally a specific error message
 *
 * @param {String} errorModalMessage The error message to be displayed in the modal's body.
 * @param {Boolean} isErrorModalMessageHtml if @errorModalMessage is in html format or not
 */
function showBankAccountErrorModal(errorModalMessage = null, isErrorModalMessageHtml = false) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errorModalMessage, isErrorModalMessageHtml});
}

/**
 * Set the current fields with errors.
 * @param {Object} errorFields
 */
function setPersonalBankAccountFormValidationErrorFields(errorFields) {
    // We set 'errorFields' to null first because we don't have a way yet to replace a specific property without merging it
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errorFields: null});
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errorFields});
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
    setPersonalBankAccountFormValidationErrorFields,
    showBankAccountFormValidationError,
    resetReimbursementAccount,
};
