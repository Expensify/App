"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAILS_DISABLED_KEYS = exports.DETAILS_DATETIME_FIELDS = exports.DETAILS_CONSTANT_FIELDS = void 0;
var CONST_1 = require("@src/CONST");
var DebugReportActionForm_1 = require("@src/types/form/DebugReportActionForm");
var DebugReportForm_1 = require("@src/types/form/DebugReportForm");
var DebugTransactionForm_1 = require("@src/types/form/DebugTransactionForm");
var DebugTransactionViolationForm_1 = require("@src/types/form/DebugTransactionViolationForm");
var DETAILS_CONSTANT_FIELDS = (_a = {},
    _a[CONST_1.default.DEBUG.FORMS.REPORT] = [
        {
            fieldName: DebugReportForm_1.default.CHAT_TYPE,
            options: CONST_1.default.REPORT.CHAT_TYPE,
        },
        {
            fieldName: DebugReportForm_1.default.CURRENCY,
            options: CONST_1.default.CURRENCY,
        },
        {
            fieldName: DebugReportForm_1.default.NOTIFICATION_PREFERENCE,
            options: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE,
        },
        {
            fieldName: DebugReportForm_1.default.TYPE,
            options: CONST_1.default.REPORT.TYPE,
        },
        {
            fieldName: DebugReportForm_1.default.LAST_ACTION_TYPE,
            options: CONST_1.default.REPORT.ACTIONS.TYPE,
        },
        {
            fieldName: DebugReportForm_1.default.WRITE_CAPABILITY,
            options: CONST_1.default.REPORT.WRITE_CAPABILITIES,
        },
        {
            fieldName: DebugReportForm_1.default.VISIBILITY,
            options: CONST_1.default.REPORT.VISIBILITY,
        },
        {
            fieldName: DebugReportForm_1.default.STATE_NUM,
            options: CONST_1.default.REPORT.STATE_NUM,
        },
        {
            fieldName: DebugReportForm_1.default.STATUS_NUM,
            options: CONST_1.default.REPORT.STATUS_NUM,
        },
    ],
    _a[CONST_1.default.DEBUG.FORMS.REPORT_ACTION] = [
        {
            fieldName: DebugReportActionForm_1.default.ACTION_NAME,
            options: CONST_1.default.REPORT.ACTIONS.TYPE,
        },
        {
            fieldName: DebugReportActionForm_1.default.CHILD_STATUS_NUM,
            options: CONST_1.default.REPORT.STATUS_NUM,
        },
        {
            fieldName: DebugReportActionForm_1.default.CHILD_STATE_NUM,
            options: CONST_1.default.REPORT.STATE_NUM,
        },
        {
            fieldName: DebugReportActionForm_1.default.CHILD_REPORT_NOTIFICATION_PREFERENCE,
            options: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE,
        },
    ],
    _a[CONST_1.default.DEBUG.FORMS.TRANSACTION] = [
        {
            fieldName: DebugTransactionForm_1.default.IOU_REQUEST_TYPE,
            options: CONST_1.default.IOU.REQUEST_TYPE,
        },
        {
            fieldName: DebugTransactionForm_1.default.MODIFIED_CURRENCY,
            options: CONST_1.default.CURRENCY,
        },
        {
            fieldName: DebugTransactionForm_1.default.CURRENCY,
            options: CONST_1.default.CURRENCY,
        },
        {
            fieldName: DebugTransactionForm_1.default.ORIGINAL_CURRENCY,
            options: CONST_1.default.CURRENCY,
        },
        {
            fieldName: DebugTransactionForm_1.default.STATUS,
            options: CONST_1.default.TRANSACTION.STATUS,
        },
        {
            fieldName: DebugTransactionForm_1.default.MCC_GROUP,
            options: CONST_1.default.MCC_GROUPS,
        },
        {
            fieldName: DebugTransactionForm_1.default.MODIFIED_MCC_GROUP,
            options: CONST_1.default.MCC_GROUPS,
        },
        {
            fieldName: DebugTransactionForm_1.default.CATEGORY,
        },
        {
            fieldName: DebugTransactionForm_1.default.TAG,
        },
    ],
    _a[CONST_1.default.DEBUG.FORMS.TRANSACTION_VIOLATION] = [
        {
            fieldName: DebugTransactionViolationForm_1.default.NAME,
            options: CONST_1.default.VIOLATIONS,
        },
        {
            fieldName: DebugTransactionViolationForm_1.default.TYPE,
            options: CONST_1.default.VIOLATION_TYPES,
        },
    ],
    _a);
exports.DETAILS_CONSTANT_FIELDS = DETAILS_CONSTANT_FIELDS;
var DETAILS_DATETIME_FIELDS = [
    DebugReportActionForm_1.default.CREATED,
    DebugReportActionForm_1.default.LAST_MODIFIED,
    DebugReportForm_1.default.LAST_READ_TIME,
    DebugReportForm_1.default.LAST_VISIBLE_ACTION_CREATED,
    DebugReportForm_1.default.LAST_VISIBLE_ACTION_LAST_MODIFIED,
    DebugTransactionForm_1.default.MODIFIED_CREATED,
];
exports.DETAILS_DATETIME_FIELDS = DETAILS_DATETIME_FIELDS;
var DETAILS_DISABLED_KEYS = [
    DebugReportActionForm_1.default.REPORT_ACTION_ID,
    DebugReportForm_1.default.REPORT_ID,
    DebugReportForm_1.default.POLICY_ID,
    DebugTransactionForm_1.default.TRANSACTION_ID,
];
exports.DETAILS_DISABLED_KEYS = DETAILS_DISABLED_KEYS;
