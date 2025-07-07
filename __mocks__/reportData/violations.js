"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.violationsR14932 = exports.receiptErrorsR14932 = void 0;
var CONST_1 = require("@src/CONST");
var RECEIPT_ERRORS_ID_R14932 = 1201421;
var RECEIPT_ERRORS_TRANSACTION_ID_R14932 = 'IOU_TRANSACTION_ID_R14932';
var violationsR14932 = [
    {
        name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
    {
        name: CONST_1.default.VIOLATIONS.FIELD_REQUIRED,
        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
];
exports.violationsR14932 = violationsR14932;
var receiptErrorsR14932 = (_a = {},
    _a[RECEIPT_ERRORS_ID_R14932] = {
        source: CONST_1.default.POLICY.ID_FAKE,
        filename: CONST_1.default.POLICY.ID_FAKE,
        action: CONST_1.default.POLICY.ID_FAKE,
        retryParams: {
            transactionID: RECEIPT_ERRORS_TRANSACTION_ID_R14932,
            source: CONST_1.default.POLICY.ID_FAKE,
        },
    },
    _a);
exports.receiptErrorsR14932 = receiptErrorsR14932;
