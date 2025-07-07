"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Returns selected bank account fields based on field names provided.
 */
function getFieldsForStep(step) {
    switch (step) {
        case CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            return ['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings'];
        case CONST_1.default.BANK_ACCOUNT.STEP.COMPANY:
            return [
                'companyName',
                'addressStreet',
                'addressZipCode',
                'addressCity',
                'addressState',
                'companyPhone',
                'website',
                'companyTaxID',
                'incorporationType',
                'incorporationDate',
                'incorporationState',
            ];
        case CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR:
            return ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
        default:
            return [];
    }
}
exports.default = getFieldsForStep;
