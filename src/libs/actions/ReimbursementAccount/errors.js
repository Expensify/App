"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBankAccountFormValidationErrors = setBankAccountFormValidationErrors;
exports.resetReimbursementAccount = resetReimbursementAccount;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Set the current fields with errors.
 */
function setBankAccountFormValidationErrors(errorFields) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { errorFields: null });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { errorFields: errorFields });
}
/**
 * Clear validation messages from reimbursement account
 */
function resetReimbursementAccount() {
    setBankAccountFormValidationErrors({});
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, {
        errors: null,
        pendingAction: null,
    });
}
