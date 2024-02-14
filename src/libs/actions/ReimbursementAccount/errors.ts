import Onyx from 'react-native-onyx';
import * as ErrorUtils from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

/**
 * Set the current fields with errors.
 */
function setPersonalBankAccountFormValidationErrorFields(errors: Errors) {
    // We set 'errors' to null first because we don't have a way yet to replace a specific property without merging it
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: null});
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors});
}

/**
 * Set the current fields with errors.

 */
function setBankAccountFormValidationErrors(errors: Errors) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors});
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
 */
function showBankAccountFormValidationError(error: string | null) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
        errors: ErrorUtils.getMicroSecondOnyxError(error),
    });
}

export {setBankAccountFormValidationErrors, setPersonalBankAccountFormValidationErrorFields, showBankAccountFormValidationError, resetReimbursementAccount};
