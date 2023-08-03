import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ErrorUtils from '../../ErrorUtils';

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
 * @param {String} policyID
 * @param {Object} errorFields
 */
function setBankAccountFormValidationErrors(policyID, errorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {errorFields: null});
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {errorFields});
}

/**
 * Clear validation messages from reimbursement account
 *
 * @param {String} policyID
 */
function resetReimbursementAccount(policyID) {
    setBankAccountFormValidationErrors(policyID, {});
    Onyx.merge(`${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${policyID}`, {
        errors: null,
        pendingAction: null,
    });
}

export {setBankAccountFormValidationErrors, setPersonalBankAccountFormValidationErrorFields, resetReimbursementAccount};
