"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Returns the initial subStep for the Bank info step based on already existing data
 */
function getInitialSubStepForBusinessInfoStep(data, corpayFields) {
    var _a, _b;
    var bankAccountDetailsFields = (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.filter(function (field) { return !field.id.includes(CONST_1.default.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX); });
    var accountHolderDetailsFields = (_b = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _b === void 0 ? void 0 : _b.filter(function (field) { return field.id.includes(CONST_1.default.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX); });
    var hasAnyMissingBankAccountDetails = bankAccountDetailsFields === null || bankAccountDetailsFields === void 0 ? void 0 : bankAccountDetailsFields.some(function (field) { return (data === null || data === void 0 ? void 0 : data[field.id]) === ''; });
    var hasAnyMissingAccountHolderDetails = accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.some(function (field) { return (data === null || data === void 0 ? void 0 : data[field.id]) === ''; });
    if (corpayFields === undefined || hasAnyMissingBankAccountDetails) {
        return 0;
    }
    if (hasAnyMissingAccountHolderDetails) {
        return 1;
    }
    return 2;
}
exports.default = getInitialSubStepForBusinessInfoStep;
