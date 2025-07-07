"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetNonUSDBankAccount = exports.resetUSDBankAccount = exports.resetReimbursementAccount = exports.setBankAccountFormValidationErrors = exports.navigateToBankAccountRoute = exports.goToWithdrawalAccountSetupStep = void 0;
exports.setBankAccountSubStep = setBankAccountSubStep;
exports.hideBankAccountErrors = hideBankAccountErrors;
exports.updateReimbursementAccountDraft = updateReimbursementAccountDraft;
exports.requestResetBankAccount = requestResetBankAccount;
exports.cancelResetBankAccount = cancelResetBankAccount;
exports.clearReimbursementAccountDraft = clearReimbursementAccountDraft;
exports.setBankAccountState = setBankAccountState;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var resetNonUSDBankAccount_1 = require("./resetNonUSDBankAccount");
exports.resetNonUSDBankAccount = resetNonUSDBankAccount_1.default;
var resetUSDBankAccount_1 = require("./resetUSDBankAccount");
exports.resetUSDBankAccount = resetUSDBankAccount_1.default;
var navigation_1 = require("./navigation");
Object.defineProperty(exports, "goToWithdrawalAccountSetupStep", { enumerable: true, get: function () { return navigation_1.goToWithdrawalAccountSetupStep; } });
Object.defineProperty(exports, "navigateToBankAccountRoute", { enumerable: true, get: function () { return navigation_1.navigateToBankAccountRoute; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "setBankAccountFormValidationErrors", { enumerable: true, get: function () { return errors_1.setBankAccountFormValidationErrors; } });
Object.defineProperty(exports, "resetReimbursementAccount", { enumerable: true, get: function () { return errors_1.resetReimbursementAccount; } });
/**
 * Set the current sub step in first step of adding withdrawal bank account:
 * - `null` if we want to go back to the view where the user selects between connecting via Plaid or connecting manually
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL to ask them to enter their accountNumber and routingNumber
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID to ask them to login to their bank via Plaid
 */
function setBankAccountSubStep(subStep) {
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { achData: { subStep: subStep } });
}
function setBankAccountState(state) {
    return react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { achData: { state: state } });
}
function hideBankAccountErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { error: '', errors: null });
}
function updateReimbursementAccountDraft(bankAccountData) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, bankAccountData);
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { draftStep: undefined });
}
function clearReimbursementAccountDraft() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {});
}
/**
 * Triggers a modal to open allowing the user to reset their bank account
 */
function requestResetBankAccount() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { shouldShowResetModal: true });
}
/**
 * Hides modal allowing the user to reset their bank account
 */
function cancelResetBankAccount() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { shouldShowResetModal: false });
}
