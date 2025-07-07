"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReimbursementAccountUtils_1 = require("@libs/ReimbursementAccountUtils");
var CONST_1 = require("@src/CONST");
/**
 * We can pass stepToOpen in the URL to force which step to show.
 * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
 */
function getStepToOpenFromRouteParams(route) {
    switch (route.params.stepToOpen) {
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW:
            return CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.COMPANY:
            return CONST_1.default.BANK_ACCOUNT.STEP.COMPANY;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.PERSONAL_INFORMATION:
            return CONST_1.default.BANK_ACCOUNT.STEP.REQUESTOR;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.BENEFICIAL_OWNERS:
            return CONST_1.default.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.CONTRACT:
            return CONST_1.default.BANK_ACCOUNT.STEP.ACH_CONTRACT;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.VALIDATE:
            return CONST_1.default.BANK_ACCOUNT.STEP.VALIDATION;
        case ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.ENABLE:
            return CONST_1.default.BANK_ACCOUNT.STEP.ENABLE;
        default:
            return '';
    }
}
exports.default = getStepToOpenFromRouteParams;
