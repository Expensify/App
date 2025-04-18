"use strict";
exports.__esModule = true;
exports.DATE_FILTER_KEYS = void 0;
var CONST_1 = require("@src/CONST");
var DATE_FILTER_KEYS = [
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.DATE,
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.PAID,
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
    CONST_1["default"].SEARCH.SYNTAX_FILTER_KEYS.POSTED,
];
exports.DATE_FILTER_KEYS = DATE_FILTER_KEYS;
var FILTER_KEYS = {
    TYPE: 'type',
    STATUS: 'status',
    DATE_AFTER: 'dateAfter',
    DATE_BEFORE: 'dateBefore',
    SUBMITTED_AFTER: 'submittedAfter',
    SUBMITTED_BEFORE: 'submittedBefore',
    APPROVED_AFTER: 'approvedAfter',
    APPROVED_BEFORE: 'approvedBefore',
    PAID_AFTER: 'paidAfter',
    PAID_BEFORE: 'paidBefore',
    EXPORTED_AFTER: 'exportedAfter',
    EXPORTED_BEFORE: 'exportedBefore',
    POSTED_AFTER: 'postedAfter',
    POSTED_BEFORE: 'postedBefore',
    CURRENCY: 'currency',
    CATEGORY: 'category',
    POLICY_ID: 'policyID',
    CARD_ID: 'cardID',
    FEED: 'feed',
    MERCHANT: 'merchant',
    DESCRIPTION: 'description',
    REPORT_ID: 'reportID',
    LESS_THAN: 'lessThan',
    GREATER_THAN: 'greaterThan',
    TAX_RATE: 'taxRate',
    EXPENSE_TYPE: 'expenseType',
    TAG: 'tag',
    KEYWORD: 'keyword',
    FROM: 'from',
    TO: 'to',
    IN: 'in',
    REIMBURSABLE: 'reimbursable',
    BILLABLE: 'billable'
};
exports["default"] = FILTER_KEYS;
