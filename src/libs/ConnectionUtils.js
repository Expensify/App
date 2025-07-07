"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQBONonReimbursableExportAccountType = getQBONonReimbursableExportAccountType;
exports.getQBDNonReimbursableExportAccountType = getQBDNonReimbursableExportAccountType;
var CONST_1 = require("@src/CONST");
var Localize_1 = require("./Localize");
function getQBONonReimbursableExportAccountType(exportDestination) {
    switch (exportDestination) {
        case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
            return (0, Localize_1.translateLocal)('workspace.qbo.bankAccount');
        case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return (0, Localize_1.translateLocal)('workspace.qbo.creditCardAccount');
        case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return (0, Localize_1.translateLocal)('workspace.qbo.accountsPayable');
        default:
            return (0, Localize_1.translateLocal)('workspace.qbo.account');
    }
}
function getQBDNonReimbursableExportAccountType(exportDestination) {
    switch (exportDestination) {
        case CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK:
            return (0, Localize_1.translateLocal)('workspace.qbd.bankAccount');
        case CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return (0, Localize_1.translateLocal)('workspace.qbd.creditCardAccount');
        case CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return (0, Localize_1.translateLocal)('workspace.qbd.accountsPayable');
        default:
            return (0, Localize_1.translateLocal)('workspace.qbd.account');
    }
}
