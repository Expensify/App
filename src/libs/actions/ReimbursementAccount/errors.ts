import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

/**
 * Set the current fields with errors.
 */
function setBankAccountFormValidationErrors(errorFields: ErrorFields) {
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

export {setBankAccountFormValidationErrors, resetReimbursementAccount};
