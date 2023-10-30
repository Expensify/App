import Onyx from 'react-native-onyx';
import * as ErrorUtils from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';

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
 * @param {Object} errorFields
 */
function setBankAccountFormValidationErrors(errorFields) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errorFields: null});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errorFields});
}

/**
 * Clear validation messages from reimbursement account
 */
function resetReimbursementAccount() {
    setBankAccountFormValidationErrors({});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
        errors: null,
        pendingAction: null,
    });
}

/**
 * Set the current error message.
 *
 * @param {String} error
 */
function showBankAccountFormValidationError(error) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
        errors: ErrorUtils.getMicroSecondOnyxError(error),
    });
}

export {setBankAccountFormValidationErrors, setPersonalBankAccountFormValidationErrorFields, showBankAccountFormValidationError, resetReimbursementAccount};
