import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import DateUtils from '../../DateUtils';

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
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
}

/**
 * Set the current error message.
 *
 * @param {String} error
 */
function showBankAccountFormValidationError(error) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
        // eslint-disable-next-line rulesdir/prefer-localization
        errors: {
            [DateUtils.getMicroseconds()]: error,
        },
    });
}

export {
    setBankAccountFormValidationErrors,
    setPersonalBankAccountFormValidationErrorFields,
    showBankAccountFormValidationError,
    resetReimbursementAccount,
};
