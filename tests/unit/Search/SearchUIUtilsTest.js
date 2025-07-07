"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var ChatListItem_1 = require("@components/SelectionList/ChatListItem");
var TransactionGroupListItem_1 = require("@components/SelectionList/Search/TransactionGroupListItem");
var TransactionListItem_1 = require("@components/SelectionList/Search/TransactionListItem");
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var SearchUIUtils = require("@src/libs/SearchUIUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../../utils/waitForBatchedUpdates");
jest.mock('@src/components/ConfirmedRoute.tsx');
var adminAccountID = 18439984;
var adminEmail = 'admin@policy.com';
var approverAccountID = 1111111;
var approverEmail = 'approver@policy.com';
var overlimitApproverAccountID = 222222;
var overlimitApproverEmail = 'overlimit@policy.com';
var submitterAccountID = 333333;
var submitterEmail = 'submitter@policy.com';
var policyID = 'A1B2C3';
var reportID = '123456789';
var reportID2 = '11111';
var reportID3 = '99999';
var reportID4 = '6155022250251839';
var transactionID = '1';
var transactionID2 = '2';
var transactionID3 = '3';
var transactionID4 = '4';
var allViolations = (_a = {},
    _a["transactionViolations_".concat(transactionID2)] = [
        {
            name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
            type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
        },
    ],
    _a);
// Given search data results consisting of involved users' personal details, policyID, reportID and transactionID
var searchResults = {
    data: __assign(__assign((_b = { personalDetailsList: (_c = {},
                _c[adminAccountID] = {
                    accountID: adminAccountID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                _c[approverAccountID] = {
                    accountID: approverAccountID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Approver',
                    login: approverEmail,
                },
                _c[overlimitApproverAccountID] = {
                    accountID: overlimitApproverAccountID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Overlimit Approver',
                    login: overlimitApproverEmail,
                },
                _c[submitterAccountID] = {
                    accountID: submitterAccountID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Submitter',
                    login: submitterEmail,
                },
                _c) }, _b["policy_".concat(policyID)] = {
        id: 'Admin',
        approvalMode: 'ADVANCED',
        autoReimbursement: {
            limit: 0,
        },
        autoReimbursementLimit: 0,
        autoReporting: true,
        autoReportingFrequency: 'immediate',
        harvesting: {
            enabled: false,
        },
        preventSelfApproval: false,
        owner: adminEmail,
        reimbursementChoice: 'reimburseManual',
        role: 'admin',
        type: 'team',
        employeeList: (_d = {},
            _d[adminEmail] = {
                email: adminEmail,
                role: CONST_1.default.POLICY.ROLE.ADMIN,
                forwardsTo: '',
                submitsTo: approverEmail,
            },
            _d[approverEmail] = {
                email: approverEmail,
                role: CONST_1.default.POLICY.ROLE.USER,
                approvalLimit: 100,
                submitsTo: adminEmail,
                overLimitForwardsTo: overlimitApproverEmail,
            },
            _d[overlimitApproverEmail] = {
                email: overlimitApproverEmail,
                role: CONST_1.default.POLICY.ROLE.ADMIN,
                submitsTo: approverEmail,
            },
            _d[submitterEmail] = {
                email: submitterEmail,
                role: CONST_1.default.POLICY.ROLE.USER,
                submitsTo: adminEmail,
            },
            _d),
    }, _b["reportActions_".concat(reportID)] = {
        test: {
            accountID: adminAccountID,
            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2024-12-21 13:05:20',
            message: [
                {
                    type: 'text',
                    text: 'Payment has been processed.',
                    html: '<p>Payment has been processed.</p>',
                    whisperedTo: [],
                },
                {
                    type: 'comment',
                    text: 'Please review this expense.',
                    html: '<p>Please review this expense.</p>',
                },
            ],
            reportActionID: 'Admin',
            reportID: reportID,
            reportName: 'Admin',
        },
        test1: {
            accountID: adminAccountID,
            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2024-12-21 13:05:20',
            message: [
                {
                    type: 'text',
                    text: 'Payment has been processed.',
                    html: '<p>Payment has been processed.</p>',
                    whisperedTo: [12345678, 87654321],
                },
                {
                    type: 'comment',
                    text: 'Please review this expense.',
                    html: '<p>Please review this expense.</p>',
                },
            ],
            reportActionID: 'Admin1',
            reportID: reportID,
            reportName: 'Admin1',
        },
    }, _b["report_".concat(reportID)] = {
        accountID: adminAccountID,
        action: 'view',
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        isOneTransactionReport: true,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        managerID: adminAccountID,
        nonReimbursableTotal: 0,
        ownerAccountID: adminAccountID,
        policyID: policyID,
        reportID: reportID,
        reportName: 'Expense Report #123',
        stateNum: 0,
        statusNum: 0,
        total: -5000,
        type: 'expense',
        unheldTotal: -5000,
    }, _b["report_".concat(reportID2)] = {
        accountID: adminAccountID,
        action: 'view',
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        isOneTransactionReport: true,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        managerID: adminAccountID,
        nonReimbursableTotal: 0,
        ownerAccountID: adminAccountID,
        policyID: policyID,
        reportID: reportID2,
        reportName: 'Expense Report #123',
        stateNum: 1,
        statusNum: 1,
        total: -5000,
        type: 'expense',
        unheldTotal: -5000,
    }, _b["report_".concat(reportID3)] = {
        accountID: adminAccountID,
        chatReportID: '6155022250251839',
        chatType: undefined,
        created: '2025-03-05 16:34:27',
        currency: 'VND',
        isOneTransactionReport: false,
        isOwnPolicyExpenseChat: false,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        managerID: approverAccountID,
        nonReimbursableTotal: 0,
        oldPolicyName: '',
        ownerAccountID: adminAccountID,
        policyID: policyID,
        private_isArchived: '',
        reportID: reportID3,
        reportName: 'Report Name',
        stateNum: 1,
        statusNum: 1,
        total: 4400,
        type: 'iou',
        unheldTotal: 4400,
    }, _b["report_".concat(reportID4)] = {
        accountID: adminAccountID,
        reportID: reportID4,
        chatReportID: '',
        chatType: 'policyExpenseChat',
        created: '2025-03-05 16:34:27',
        type: 'chat',
    }, _b["transactions_".concat(transactionID)] = {
        accountID: adminAccountID,
        action: 'view',
        amount: -5000,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {
            comment: '',
        },
        created: '2024-12-21',
        currency: 'USD',
        hasEReceipt: false,
        isFromOneTransactionReport: true,
        managerID: adminAccountID,
        description: '',
        hasViolation: false,
        merchant: 'Expense',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        policyID: policyID,
        reportID: reportID,
        reportType: 'expense',
        tag: '',
        transactionID: transactionID,
        transactionThreadReportID: '456',
        transactionType: 'cash',
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        errors: undefined,
        isActionLoading: false,
    }, _b["transactions_".concat(transactionID2)] = {
        accountID: adminAccountID,
        action: 'view',
        amount: -5000,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {
            comment: '',
        },
        created: '2024-12-21',
        currency: 'USD',
        hasEReceipt: false,
        isFromOneTransactionReport: true,
        managerID: adminAccountID,
        description: '',
        hasViolation: true,
        merchant: 'Expense',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        policyID: policyID,
        reportID: reportID2,
        reportType: 'expense',
        tag: '',
        transactionID: transactionID2,
        transactionThreadReportID: '456',
        transactionType: 'cash',
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
    }, _b), allViolations), (_e = {}, _e["transactions_".concat(transactionID3)] = {
        accountID: adminAccountID,
        amount: 1200,
        action: 'view',
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {
            comment: '',
        },
        created: '2025-03-05',
        currency: 'VND',
        hasEReceipt: false,
        isFromOneTransactionReport: false,
        managerID: approverAccountID,
        merchant: '(none)',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        policyID: policyID,
        reportID: reportID3,
        reportType: 'iou',
        tag: '',
        transactionID: transactionID3,
        transactionThreadReportID: '8287398995021380',
        transactionType: 'cash',
        receipt: undefined,
        taxAmount: undefined,
        description: '',
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: undefined,
    }, _e["transactions_".concat(transactionID4)] = {
        accountID: adminAccountID,
        amount: 3200,
        action: 'view',
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {
            comment: '',
        },
        created: '2025-03-05',
        currency: 'VND',
        hasEReceipt: false,
        isFromOneTransactionReport: false,
        managerID: approverAccountID,
        merchant: '(none)',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        policyID: policyID,
        reportID: reportID3,
        reportType: 'iou',
        tag: '',
        transactionID: transactionID3,
        transactionThreadReportID: '1014872441234902',
        transactionType: 'cash',
        description: '',
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: undefined,
    }, _e)),
    search: {
        columnsToShow: {
            shouldShowCategoryColumn: true,
            shouldShowTagColumn: false,
            shouldShowTaxColumn: false,
        },
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: 'all',
        isLoading: false,
        type: 'expense',
    },
};
var reportActionListItems = [
    {
        accountID: 18439984,
        actionName: 'ADDCOMMENT',
        created: '2024-12-21 13:05:20',
        date: '2024-12-21 13:05:20',
        formattedFrom: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        keyForList: 'Admin',
        message: [
            {
                type: 'text',
                text: 'Payment has been processed.',
                html: '<p>Payment has been processed.</p>',
                whisperedTo: [],
            },
            {
                type: 'comment',
                text: 'Please review this expense.',
                html: '<p>Please review this expense.</p>',
            },
        ],
        reportActionID: 'Admin',
        reportID: '123456789',
        reportName: 'Expense Report #123',
    },
];
var transactionsListItems = [
    {
        accountID: 18439984,
        action: 'submit',
        amount: -5000,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: { comment: '' },
        created: '2024-12-21',
        currency: 'USD',
        date: '2024-12-21',
        formattedFrom: 'Admin',
        formattedMerchant: 'Expense',
        formattedTo: '',
        formattedTotal: 5000,
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        hasEReceipt: false,
        isFromOneTransactionReport: true,
        keyForList: '1',
        managerID: 18439984,
        merchant: 'Expense',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        policyID: 'A1B2C3',
        reportID: '123456789',
        reportType: 'expense',
        shouldShowCategory: true,
        shouldShowMerchant: true,
        shouldShowTag: false,
        shouldShowTax: false,
        shouldShowYear: true,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        tag: '',
        to: {
            accountID: 0,
            avatar: '',
            displayName: undefined,
            login: undefined,
        },
        transactionID: '1',
        transactionThreadReportID: '456',
        transactionType: 'cash',
        receipt: undefined,
        taxAmount: undefined,
        description: '',
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: false,
        violations: [],
    },
    {
        accountID: 18439984,
        action: 'review',
        amount: -5000,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: { comment: '' },
        created: '2024-12-21',
        currency: 'USD',
        date: '2024-12-21',
        formattedFrom: 'Admin',
        formattedMerchant: 'Expense',
        formattedTo: 'Admin',
        formattedTotal: 5000,
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        hasEReceipt: false,
        isFromOneTransactionReport: true,
        keyForList: '2',
        managerID: 18439984,
        merchant: 'Expense',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        policyID: 'A1B2C3',
        reportID: '11111',
        reportType: 'expense',
        shouldShowCategory: true,
        shouldShowMerchant: true,
        shouldShowTag: false,
        shouldShowTax: false,
        shouldShowYear: true,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        tag: '',
        to: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        transactionID: '2',
        transactionThreadReportID: '456',
        transactionType: 'cash',
        receipt: undefined,
        taxAmount: undefined,
        description: '',
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: true,
        violations: [
            {
                name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
            },
        ],
    },
    {
        accountID: 18439984,
        amount: 1200,
        action: 'view',
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: { comment: '' },
        created: '2025-03-05',
        currency: 'VND',
        hasEReceipt: false,
        isFromOneTransactionReport: false,
        managerID: 1111111,
        merchant: '(none)',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        policyID: 'A1B2C3',
        reportID: '99999',
        reportType: 'iou',
        tag: '',
        transactionID: '3',
        transactionThreadReportID: '8287398995021380',
        transactionType: 'cash',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: 'admin@policy.com',
        },
        to: {
            accountID: 1111111,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Approver',
            login: 'approver@policy.com',
        },
        formattedFrom: 'Admin',
        formattedTo: 'Approver',
        formattedTotal: 1200,
        formattedMerchant: '',
        date: '2025-03-05',
        shouldShowMerchant: true,
        shouldShowCategory: true,
        shouldShowTag: false,
        shouldShowTax: false,
        keyForList: '3',
        shouldShowYear: true,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        receipt: undefined,
        taxAmount: undefined,
        description: '',
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: undefined,
        violations: [],
    },
    {
        accountID: 18439984,
        amount: 3200,
        action: 'view',
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: { comment: '' },
        created: '2025-03-05',
        currency: 'VND',
        hasEReceipt: false,
        isFromOneTransactionReport: false,
        managerID: 1111111,
        merchant: '(none)',
        modifiedAmount: 0,
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        policyID: 'A1B2C3',
        reportID: '99999',
        reportType: 'iou',
        tag: '',
        transactionID: '3',
        transactionThreadReportID: '1014872441234902',
        transactionType: 'cash',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: 'admin@policy.com',
        },
        to: {
            accountID: 1111111,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Approver',
            login: 'approver@policy.com',
        },
        formattedFrom: 'Admin',
        formattedTo: 'Approver',
        formattedTotal: 3200,
        formattedMerchant: '',
        date: '2025-03-05',
        shouldShowMerchant: true,
        shouldShowCategory: true,
        shouldShowTag: false,
        shouldShowTax: false,
        keyForList: '3',
        shouldShowYear: true,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        receipt: undefined,
        taxAmount: undefined,
        description: '',
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        moneyRequestReportActionID: undefined,
        pendingAction: undefined,
        errors: undefined,
        isActionLoading: false,
        hasViolation: undefined,
        violations: [],
    },
];
var transactionReportGroupListItems = [
    {
        groupedBy: 'reports',
        accountID: 18439984,
        action: 'submit',
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        isOneTransactionReport: true,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        keyForList: '123456789',
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: '123456789',
        reportName: 'Expense Report #123',
        stateNum: 0,
        statusNum: 0,
        to: {
            accountID: 0,
            avatar: '',
            displayName: undefined,
            login: undefined,
        },
        total: -5000,
        transactions: [
            {
                accountID: 18439984,
                action: 'submit',
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                category: '',
                comment: { comment: '' },
                created: '2024-12-21',
                currency: 'USD',
                date: '2024-12-21',
                description: '',
                formattedFrom: 'Admin',
                formattedMerchant: 'Expense',
                formattedTo: '',
                formattedTotal: 5000,
                from: {
                    accountID: 18439984,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                hasEReceipt: false,
                hasViolation: false,
                isFromOneTransactionReport: true,
                keyForList: '1',
                managerID: 18439984,
                merchant: 'Expense',
                modifiedAmount: 0,
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: 'Expense',
                parentTransactionID: '',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                policyID: 'A1B2C3',
                reportID: '123456789',
                reportType: 'expense',
                shouldShowCategory: true,
                shouldShowMerchant: true,
                shouldShowTag: false,
                shouldShowTax: false,
                shouldShowYear: true,
                isAmountColumnWide: false,
                isTaxAmountColumnWide: false,
                tag: '',
                to: {
                    accountID: 0,
                    avatar: '',
                    displayName: undefined,
                    login: undefined,
                },
                transactionID: '1',
                transactionThreadReportID: '456',
                transactionType: 'cash',
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                moneyRequestReportActionID: undefined,
                errors: undefined,
                isActionLoading: false,
                violations: [],
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
        groupedBy: 'reports',
        accountID: 18439984,
        action: 'review',
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        isOneTransactionReport: true,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        keyForList: '11111',
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: '11111',
        reportName: 'Expense Report #123',
        stateNum: 1,
        statusNum: 1,
        to: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        total: -5000,
        transactions: [
            {
                accountID: 18439984,
                action: 'review',
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                category: '',
                comment: { comment: '' },
                created: '2024-12-21',
                currency: 'USD',
                date: '2024-12-21',
                description: '',
                formattedFrom: 'Admin',
                formattedMerchant: 'Expense',
                formattedTo: 'Admin',
                formattedTotal: 5000,
                from: {
                    accountID: 18439984,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                hasEReceipt: false,
                hasViolation: true,
                violations: [
                    {
                        name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                    },
                ],
                isFromOneTransactionReport: true,
                keyForList: '2',
                managerID: 18439984,
                merchant: 'Expense',
                modifiedAmount: 0,
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: 'Expense',
                parentTransactionID: '',
                policyID: 'A1B2C3',
                reportID: '11111',
                reportType: 'expense',
                shouldShowCategory: true,
                shouldShowMerchant: true,
                shouldShowTag: false,
                shouldShowTax: false,
                shouldShowYear: true,
                isAmountColumnWide: false,
                isTaxAmountColumnWide: false,
                tag: '',
                to: {
                    accountID: 18439984,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                transactionID: '2',
                transactionThreadReportID: '456',
                transactionType: 'cash',
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                moneyRequestReportActionID: undefined,
                pendingAction: undefined,
                errors: undefined,
                isActionLoading: false,
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
        groupedBy: 'reports',
        accountID: 18439984,
        chatReportID: '6155022250251839',
        chatType: undefined,
        created: '2025-03-05 16:34:27',
        currency: 'VND',
        isOneTransactionReport: false,
        isOwnPolicyExpenseChat: false,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        managerID: 1111111,
        nonReimbursableTotal: 0,
        oldPolicyName: '',
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        private_isArchived: '',
        reportID: '99999',
        reportName: 'Approver owes ₫44.00',
        stateNum: 1,
        statusNum: 1,
        total: 4400,
        type: 'iou',
        unheldTotal: 4400,
        action: 'pay',
        keyForList: '99999',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: 'admin@policy.com',
        },
        to: {
            accountID: 1111111,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Approver',
            login: 'approver@policy.com',
        },
        transactions: [transactionsListItems.at(2), transactionsListItems.at(3)],
    },
];
describe('SearchUIUtils', function () {
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, IntlStore_1.default.load('en')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Test getAction', function () {
        test('Should return `View` action for an invalid key', function () {
            var action = SearchUIUtils.getAction(searchResults.data, {}, 'invalid_key');
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `Submit` action for transaction on policy with delayed submission and no violations', function () {
            var action = SearchUIUtils.getAction(searchResults.data, {}, "report_".concat(reportID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.SUBMIT);
            action = SearchUIUtils.getAction(searchResults.data, {}, "transactions_".concat(transactionID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.SUBMIT);
        });
        test('Should return `View` action for transaction on policy with delayed submission and with violations when current user is submitter and the expense was submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
            var localSearchResults;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: submitterAccountID })];
                    case 1:
                        _b.sent();
                        localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["policy_".concat(policyID)] = __assign(__assign({}, searchResults.data["policy_".concat(policyID)]), { role: CONST_1.default.POLICY.ROLE.USER }), _a["report_".concat(reportID2)] = __assign(__assign({}, searchResults.data["report_".concat(reportID2)]), { accountID: submitterAccountID, ownerAccountID: submitterAccountID }), _a["transactions_".concat(transactionID2)] = __assign(__assign({}, searchResults.data["transactions_".concat(transactionID2)]), { accountID: submitterAccountID, managerID: adminAccountID }), _a));
                        expect(SearchUIUtils.getAction(localSearchResults, allViolations, "report_".concat(reportID2))).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
                        expect(SearchUIUtils.getAction(localSearchResults, allViolations, "transactions_".concat(transactionID2))).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Should return `Review` action for transaction on policy with delayed submission and with violations', function () {
            var action = SearchUIUtils.getAction(searchResults.data, allViolations, "report_".concat(reportID2));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.REVIEW);
            action = SearchUIUtils.getAction(searchResults.data, allViolations, "transactions_".concat(transactionID2));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Paid` action for a manually settled report', function () {
            var _a;
            var paidReportID = 'report_paid';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a[paidReportID] = __assign(__assign({}, searchResults.data["report_".concat(reportID)]), { reportID: paidReportID, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED }), _a["reportNameValuePairs_".concat(paidReportID)] = {
                manualReimbursed: '2024-01-01',
            }, _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, paidReportID);
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.PAID);
        });
        test('Should return `Paid` action for a settled report on an auto-reimbursement policy', function () {
            var _a;
            var paidReportID = 'report_paid_auto';
            var policyIDAuto = 'policy_auto';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["policy_".concat(policyIDAuto)] = __assign(__assign({}, searchResults.data["policy_".concat(policyID)]), { id: policyIDAuto, reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES }), _a[paidReportID] = __assign(__assign({}, searchResults.data["report_".concat(reportID)]), { reportID: paidReportID, policyID: policyIDAuto, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, paidReportID);
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.PAID);
        });
        test('Should return `Pay` action for a closed IOU report with an outstanding balance', function () {
            var _a;
            var closedReportID = 'report_closed_with_balance';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["report_".concat(closedReportID)] = __assign(__assign({}, searchResults.data["report_".concat(reportID3)]), { reportID: closedReportID, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "report_".concat(closedReportID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.PAY);
        });
        test('Should return `Done` action for a closed report with a zero balance', function () {
            var _a;
            var closedReportID = 'report_closed';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["report_".concat(closedReportID)] = __assign(__assign({}, searchResults.data["report_".concat(reportID)]), { reportID: closedReportID, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, total: 0 }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "report_".concat(closedReportID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.DONE);
        });
        test('Should return `Review` action if report has errors', function () {
            var _a;
            var errorReportID = 'report_error';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["report_".concat(errorReportID)] = __assign(__assign({}, searchResults.data["report_".concat(reportID)]), { reportID: errorReportID, errors: { error: 'An error' } }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "report_".concat(errorReportID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `View` action for non-money request reports', function () {
            var action = SearchUIUtils.getAction(searchResults.data, {}, "report_".concat(reportID4));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `View` action for an orphaned transaction', function () {
            var _a;
            var orphanedTransactionID = 'transaction_orphaned';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["transactions_".concat(orphanedTransactionID)] = __assign(__assign({}, searchResults.data["transactions_".concat(transactionID)]), { transactionID: orphanedTransactionID, reportID: 'non_existent_report' }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "transactions_".concat(orphanedTransactionID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `View` action for a transaction in a multi-transaction report', function () {
            var _a;
            var multiTransactionID = 'transaction_multi';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["transactions_".concat(multiTransactionID)] = __assign(__assign({}, searchResults.data["transactions_".concat(transactionID)]), { transactionID: multiTransactionID, isFromOneTransactionReport: false }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "transactions_".concat(multiTransactionID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `Review` action if report export has failed', function () {
            var _a;
            var failedExportReportID = 'report_failed_export';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["report_".concat(failedExportReportID)] = __assign(__assign({}, searchResults.data["report_".concat(reportID)]), { reportID: failedExportReportID, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN }), _a["reportNameValuePairs_".concat(failedExportReportID)] = {
                exportFailedTime: '2024-01-01',
            }, _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "report_".concat(failedExportReportID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Review` action if transaction has errors', function () {
            var _a;
            var errorTransactionID = 'transaction_error';
            var localSearchResults = __assign(__assign({}, searchResults.data), (_a = {}, _a["transactions_".concat(errorTransactionID)] = __assign(__assign({}, searchResults.data["transactions_".concat(transactionID)]), { transactionID: errorTransactionID, errors: { error: 'An error' } }), _a));
            var action = SearchUIUtils.getAction(localSearchResults, {}, "transactions_".concat(errorTransactionID));
            expect(action).toStrictEqual(CONST_1.default.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Pay` action for an IOU report ready to be paid', function () { return __awaiter(void 0, void 0, void 0, function () {
            var iouReportKey, action;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: adminAccountID });
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _a.sent();
                        iouReportKey = "report_".concat(reportID3);
                        action = SearchUIUtils.getAction(searchResults.data, {}, iouReportKey);
                        expect(action).toEqual(CONST_1.default.SEARCH.ACTION_TYPES.PAY);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Test getListItem', function () {
        it('should return ChatListItem when type is CHAT', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.CHAT, 'all')).toStrictEqual(ChatListItem_1.default);
        });
        it('should return TransactionListItem when groupBy is undefined', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', undefined)).toStrictEqual(TransactionListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is report', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is TRIP and groupBy is report', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is INVOICE and groupBy is report', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is member', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is TRIP and groupBy is member', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
        it('should return TransactionGroupListItem when type is INVOICE and groupBy is member', function () {
            expect(SearchUIUtils.getListItem(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual(TransactionGroupListItem_1.default);
        });
    });
    describe('Test getSections', function () {
        it('should return getReportActionsSections result when type is CHAT', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.CHAT, 'all', searchResults.data, searchResults.search)).toStrictEqual(reportActionListItems);
        });
        it('should return getTransactionsSections result when groupBy is undefined', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', searchResults.data, searchResults.search, undefined)).toStrictEqual(transactionsListItems);
        });
        it('should return getReportSections result when type is EXPENSE and groupBy is report', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getReportSections result when type is TRIP and groupBy is report', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getReportSections result when type is INVOICE and groupBy is report', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getMemberSections result when type is EXPENSE and groupBy is member', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        it('should return getMemberSections result when type is TRIP and groupBy is member', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        it('should return getMemberSections result when type is INVOICE and groupBy is member', function () {
            expect(SearchUIUtils.getSections(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', searchResults.data, searchResults.search, CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        // s77rt add test for group by card
    });
    describe('Test getSortedSections', function () {
        it('should return getSortedReportActionData result when type is CHAT', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.CHAT, 'all', reportActionListItems)).toStrictEqual([
                {
                    accountID: 18439984,
                    actionName: 'ADDCOMMENT',
                    created: '2024-12-21 13:05:20',
                    date: '2024-12-21 13:05:20',
                    formattedFrom: 'Admin',
                    from: {
                        accountID: 18439984,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                        displayName: 'Admin',
                        login: adminEmail,
                    },
                    keyForList: 'Admin',
                    message: [
                        {
                            html: '<p>Payment has been processed.</p>',
                            text: 'Payment has been processed.',
                            type: 'text',
                            whisperedTo: [],
                        },
                        {
                            html: '<p>Please review this expense.</p>',
                            text: 'Please review this expense.',
                            type: 'comment',
                        },
                    ],
                    reportActionID: 'Admin',
                    reportID: '123456789',
                    reportName: 'Expense Report #123',
                },
            ]);
        });
        it('should return getSortedTransactionData result when groupBy is undefined', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', transactionsListItems, 'date', 'asc', undefined)).toStrictEqual(transactionsListItems);
        });
        it('should return getSortedReportData result when type is EXPENSE and groupBy is report', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getSortedReportData result when type is TRIP and groupBy is report', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getSortedReportData result when type is INVOICE and groupBy is report', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(transactionReportGroupListItems);
        });
        it('should return getSortedMemberData result when type is EXPENSE and groupBy is member', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.EXPENSE, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        it('should return getSortedMemberData result when type is TRIP and groupBy is member', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.TRIP, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        it('should return getSortedMemberData result when type is INVOICE and groupBy is member', function () {
            expect(SearchUIUtils.getSortedSections(CONST_1.default.SEARCH.DATA_TYPES.INVOICE, 'all', transactionReportGroupListItems, 'date', 'asc', CONST_1.default.SEARCH.GROUP_BY.MEMBERS)).toStrictEqual([]); // s77rt update test
        });
        // s77rt add test for group by card
    });
    describe('Test createTypeMenuItems', function () {
        it('should return the default menu items', function () {
            var menuItems = SearchUIUtils.createTypeMenuSections(undefined, false, {})
                .map(function (section) { return section.menuItems; })
                .flat();
            expect(menuItems).toHaveLength(3);
            expect(menuItems).toStrictEqual(expect.arrayContaining([
                expect.objectContaining({
                    translationPath: 'common.expenses',
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    icon: Expensicons.Receipt,
                }),
                expect.objectContaining({
                    translationPath: 'common.reports',
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    icon: Expensicons.Document,
                }),
                expect.objectContaining({
                    translationPath: 'common.chats',
                    type: CONST_1.default.SEARCH.DATA_TYPES.CHAT,
                    icon: Expensicons.ChatBubbles,
                }),
            ]));
        });
        it('should generate correct routes', function () {
            var menuItems = SearchUIUtils.createTypeMenuSections(undefined, false, {})
                .map(function (section) { return section.menuItems; })
                .flat();
            var expectedQueries = [
                'type:expense status:all sortBy:date sortOrder:desc',
                'type:expense status:all sortBy:date sortOrder:desc groupBy:reports',
                'type:chat status:all sortBy:date sortOrder:desc',
            ];
            menuItems.forEach(function (item, index) {
                expect(item.getSearchQuery()).toStrictEqual(expectedQueries.at(index));
            });
        });
    });
    test('Should show `View` to overlimit approver', function () {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: overlimitApproverAccountID });
        searchResults.data["policy_".concat(policyID)].role = CONST_1.default.POLICY.ROLE.USER;
        return (0, waitForBatchedUpdates_1.default)().then(function () {
            var action = SearchUIUtils.getAction(searchResults.data, allViolations, "report_".concat(reportID2));
            expect(action).toEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
            action = SearchUIUtils.getAction(searchResults.data, allViolations, "transactions_".concat(transactionID2));
            expect(action).toEqual(CONST_1.default.SEARCH.ACTION_TYPES.VIEW);
        });
    });
    test('Should show `Approve` for report', function () {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: adminAccountID });
        var result = {
            data: {
                personalDetailsList: {
                    adminAccountID: {
                        accountID: adminAccountID,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/fake.jpeg',
                        displayName: 'You',
                        login: 'you@expensifail.com',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '2074551': {
                        accountID: 2074551,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/fake2.jpeg',
                        displayName: 'Jason',
                        login: 'jason@expensifail.com',
                    },
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                policy_137DA25D273F2423: {
                    approvalMode: 'ADVANCED',
                    approver: '',
                    autoReimbursement: {
                        limit: 500000,
                    },
                    autoReimbursementLimit: 500000,
                    autoReporting: true,
                    autoReportingFrequency: 'immediate',
                    harvesting: {
                        enabled: true,
                    },
                    id: '137DA25D273F2423',
                    name: 'Expenses - Expensify US',
                    owner: 'accounting@expensifail.com',
                    preventSelfApproval: true,
                    reimbursementChoice: 'reimburseYes',
                    role: 'user',
                    rules: {
                        approvalRules: [],
                        expenseRules: [],
                    },
                    type: 'corporate',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                report_6523565988285061: {
                    accountID: 2074551,
                    chatReportID: '4128157185472356',
                    created: '2025-05-26 19:49:56',
                    currency: 'USD',
                    isOneTransactionReport: true,
                    isOwnPolicyExpenseChat: false,
                    isPolicyExpenseChat: false,
                    isWaitingOnBankAccount: false,
                    managerID: adminAccountID,
                    nonReimbursableTotal: 0,
                    oldPolicyName: '',
                    ownerAccountID: 2074551,
                    parentReportActionID: '5568426544518647396',
                    parentReportID: '4128157185472356',
                    policyID: '137DA25D273F2423',
                    private_isArchived: '',
                    reportID: '6523565988285061',
                    reportName: 'Expense Report #6523565988285061',
                    stateNum: 1,
                    statusNum: 1,
                    total: -1000,
                    type: 'expense',
                    unheldTotal: -1000,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                transactions_1805965960759424086: {
                    accountID: 2074551,
                    amount: 0,
                    canDelete: false,
                    canHold: true,
                    canUnhold: false,
                    category: 'Employee Meals Remote (Fringe Benefit)',
                    action: 'approve',
                    comment: {
                        comment: '',
                    },
                    created: '2025-05-26',
                    currency: 'USD',
                    hasEReceipt: false,
                    isFromOneTransactionReport: true,
                    managerID: adminAccountID,
                    merchant: '(none)',
                    modifiedAmount: -1000,
                    modifiedCreated: '2025-05-22',
                    modifiedCurrency: 'USD',
                    modifiedMerchant: 'Costco Wholesale',
                    parentTransactionID: '',
                    policyID: '137DA25D273F2423',
                    receipt: {
                        source: 'https://www.expensify.com/receipts/fake.jpg',
                        state: CONST_1.default.IOU.RECEIPT_STATE.SCAN_COMPLETE,
                    },
                    reportID: '6523565988285061',
                    reportType: 'expense',
                    tag: '',
                    transactionID: '1805965960759424086',
                    transactionThreadReportID: '4139222832581831',
                    transactionType: 'cash',
                },
            },
            search: {
                type: 'expense',
                status: 'all',
                offset: 0,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
                columnsToShow: {
                    shouldShowCategoryColumn: true,
                    shouldShowTagColumn: true,
                    shouldShowTaxColumn: true,
                },
            },
        };
        return (0, waitForBatchedUpdates_1.default)().then(function () {
            var action = SearchUIUtils.getAction(result.data, allViolations, 'report_6523565988285061');
            expect(action).toEqual(CONST_1.default.SEARCH.ACTION_TYPES.APPROVE);
        });
    });
    test('Should return true if the search result has valid type', function () {
        expect(SearchUIUtils.shouldShowEmptyState(false, transactionReportGroupListItems.length, searchResults.search.type)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, 0, searchResults.search.type)).toBe(true);
        var inValidSearchType = 'expensify';
        expect(SearchUIUtils.shouldShowEmptyState(true, transactionReportGroupListItems.length, inValidSearchType)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, transactionReportGroupListItems.length, searchResults.search.type)).toBe(false);
    });
    test('Should determine whether the date, amount, and tax column require wide columns or not', function () {
        // Test case 1: `isAmountLengthLong` should be false if the current symbol + amount length does not exceed 11 characters
        var shouldShowAmountInWideColumn = SearchUIUtils.getWideAmountIndicators(transactionsListItems).shouldShowAmountInWideColumn;
        expect(shouldShowAmountInWideColumn).toBe(false);
        var transaction = transactionsListItems.at(0);
        // Test case 2: `isAmountLengthLong` should be true when the current symbol + amount length exceeds 11 characters
        // `isTaxAmountLengthLong` should be false if current symbol + tax amount length does not exceed 11 characters
        var _a = SearchUIUtils.getWideAmountIndicators(__spreadArray(__spreadArray([], transactionsListItems, true), [
            __assign(__assign({}, transaction), { amount: 99999999.99, taxAmount: 2332.77, modifiedAmount: undefined }),
        ], false)), isAmountLengthLong2 = _a.shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn = _a.shouldShowTaxAmountInWideColumn;
        expect(isAmountLengthLong2).toBe(true);
        expect(shouldShowTaxAmountInWideColumn).toBe(false);
        // Test case 3: Both `isAmountLengthLong` and `isTaxAmountLengthLong` should be true
        // when the current symbol + amount and current symbol + tax amount lengths exceed 11 characters
        var _b = SearchUIUtils.getWideAmountIndicators(__spreadArray(__spreadArray([], transactionsListItems, true), [
            __assign(__assign({}, transaction), { amount: 99999999.99, taxAmount: 45555555.55, modifiedAmount: undefined }),
        ], false)), isAmountLengthLong3 = _b.shouldShowAmountInWideColumn, isTaxAmountLengthLong2 = _b.shouldShowTaxAmountInWideColumn;
        expect(isAmountLengthLong3).toBe(true);
        expect(isTaxAmountLengthLong2).toBe(true);
    });
});
