import Onyx from 'react-native-onyx';
import ChatListItem from '@components/SelectionList/ChatListItem';
import TransactionGroupListItem from '@components/SelectionList/Search/TransactionGroupListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportActionListItemType, TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionList/types';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {localeCompare} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');

const adminAccountID = 18439984;
const adminEmail = 'admin@policy.com';
const approverAccountID = 1111111;
const approverEmail = 'approver@policy.com';
const overlimitApproverAccountID = 222222;
const overlimitApproverEmail = 'overlimit@policy.com';
const submitterAccountID = 333333;
const submitterEmail = 'submitter@policy.com';
const policyID = 'A1B2C3';
const reportID = '123456789';
const reportID2 = '11111';
const reportID3 = '99999';
const reportID4 = '6155022250251839';
const reportID5 = '22222';
const transactionID = '1';
const transactionID2 = '2';
const transactionID3 = '3';
const transactionID4 = '4';

const report1 = {
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
    policyID,
    reportID,
    reportName: 'Expense Report #123',
    stateNum: 0,
    statusNum: 0,
    total: -5000,
    type: 'expense',
    unheldTotal: -5000,
} as const;

const report2 = {
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
    policyID,
    reportID: reportID2,
    reportName: 'Expense Report #123',
    stateNum: 1,
    statusNum: 1,
    total: -5000,
    type: 'expense',
    unheldTotal: -5000,
} as const;

const report3 = {
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
    policyID,
    private_isArchived: '',
    reportID: reportID3,
    reportName: 'Report Name',
    stateNum: 1,
    statusNum: 1,
    total: 4400,
    type: 'iou',
    unheldTotal: 4400,
} as const;

const report4 = {
    accountID: adminAccountID,
    reportID: reportID4,
    chatReportID: '',
    chatType: 'policyExpenseChat',
    created: '2025-03-05 16:34:27',
    type: 'chat',
} as const;

const report5 = {
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
    policyID,
    reportID: reportID5,
    reportName: 'Expense Report #123',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'expense',
    unheldTotal: 0,
} as const;

const allViolations = {
    [`transactionViolations_${transactionID2}`]: [
        {
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        },
    ],
};

// Given search data results consisting of involved users' personal details, policyID, reportID and transactionID
const searchResults: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            [adminAccountID]: {
                accountID: adminAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Admin',
                login: adminEmail,
            },
            [approverAccountID]: {
                accountID: approverAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Approver',
                login: approverEmail,
            },
            [overlimitApproverAccountID]: {
                accountID: overlimitApproverAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Overlimit Approver',
                login: overlimitApproverEmail,
            },
            [submitterAccountID]: {
                accountID: submitterAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Submitter',
                login: submitterEmail,
            },
        },
        [`policy_${policyID}`]: {
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
            employeeList: {
                [adminEmail]: {
                    email: adminEmail,
                    role: CONST.POLICY.ROLE.ADMIN,
                    forwardsTo: '',
                    submitsTo: approverEmail,
                },
                [approverEmail]: {
                    email: approverEmail,
                    role: CONST.POLICY.ROLE.USER,
                    approvalLimit: 100,
                    submitsTo: adminEmail,
                    overLimitForwardsTo: overlimitApproverEmail,
                },
                [overlimitApproverEmail]: {
                    email: overlimitApproverEmail,
                    role: CONST.POLICY.ROLE.ADMIN,
                    submitsTo: approverEmail,
                },
                [submitterEmail]: {
                    email: submitterEmail,
                    role: CONST.POLICY.ROLE.USER,
                    submitsTo: adminEmail,
                },
            },
        },
        [`reportActions_${reportID}`]: {
            test: {
                accountID: adminAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                reportID,
                reportName: 'Admin',
            },
            test1: {
                accountID: adminAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                reportID,
                reportName: 'Admin1',
            },
        },
        [`report_${reportID}`]: report1,
        [`report_${reportID2}`]: report2,
        [`report_${reportID3}`]: report3,
        [`report_${reportID4}`]: report4,
        [`report_${reportID5}`]: report5,
        [`transactions_${transactionID}`]: {
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
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            policyID,
            reportID,
            reportType: 'expense',
            tag: '',
            transactionID,
            transactionThreadReportID: '456',
            transactionType: 'cash',
            receipt: undefined,
            taxAmount: undefined,
            mccGroup: undefined,
            modifiedMCCGroup: undefined,
            moneyRequestReportActionID: undefined,
            errors: undefined,
            isActionLoading: false,
        },
        [`transactions_${transactionID2}`]: {
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
            policyID,
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
        },
        ...allViolations,
        [`transactions_${transactionID3}`]: {
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
            policyID,
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
        },
        [`transactions_${transactionID4}`]: {
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
            policyID,
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
        },
    },
    search: {
        columnsToShow: {
            shouldShowCategoryColumn: true,
            shouldShowTagColumn: false,
            shouldShowTaxColumn: false,
            shouldShowFromColumn: true,
            shouldShowToColumn: true,
            shouldShowDescriptionColumn: false,
        },
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        isLoading: false,
        type: 'expense',
    },
};

const reportActionListItems = [
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
] as ReportActionListItemType[];

const transactionsListItems = [
    {
        accountID: 18439984,
        action: 'submit',
        amount: -5000,
        report: report1,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {comment: ''},
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
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        policyID: 'A1B2C3',
        reportID: '123456789',
        reportType: 'expense',
        shouldShowCategory: true,
        shouldShowDescription: false,
        shouldShowMerchant: true,
        shouldShowTag: false,
        shouldShowTax: false,
        shouldShowYear: true,
        shouldShowFrom: true,
        shouldShowTo: true,
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
        report: report2,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {comment: ''},
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
        shouldShowFrom: true,
        shouldShowTo: true,
        shouldShowDescription: false,
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
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ],
    },
    {
        accountID: 18439984,
        amount: 1200,
        action: 'view',
        report: report3,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {comment: ''},
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
        shouldShowFrom: true,
        shouldShowTo: true,
        shouldShowDescription: false,
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
        report: report3,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        category: '',
        comment: {comment: ''},
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
        shouldShowFrom: true,
        shouldShowTo: true,
        shouldShowDescription: false,
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
] as TransactionListItemType[];

const transactionReportGroupListItems = [
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
                report: report1,
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                category: '',
                comment: {comment: ''},
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
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                policyID: 'A1B2C3',
                reportID: '123456789',
                reportType: 'expense',
                shouldShowCategory: true,
                shouldShowMerchant: true,
                shouldShowTag: false,
                shouldShowTax: false,
                shouldShowYear: true,
                shouldShowFrom: true,
                shouldShowTo: true,
                shouldShowDescription: false,
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
                report: report2,
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                category: '',
                comment: {comment: ''},
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
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
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
                shouldShowFrom: true,
                shouldShowTo: true,
                shouldShowDescription: false,
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
    {
        groupedBy: 'reports',
        accountID: 18439984,
        action: 'view',
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        from: {
            accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
            avatar: '',
            displayName: undefined,
            login: undefined,
        },
        isOneTransactionReport: true,
        isPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        keyForList: reportID5,
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: reportID5,
        reportName: 'Expense Report #123',
        stateNum: 0,
        statusNum: 0,
        to: {
            accountID: 0,
            avatar: '',
            displayName: undefined,
            login: undefined,
        },
        total: 0,
        transactions: [],
        type: 'expense',
        unheldTotal: 0,
    },
] as TransactionReportGroupListItemType[];

describe('SearchUIUtils', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await IntlStore.load('en');
    });
    describe('Test getAction', () => {
        test('Should return `View` action for an invalid key', () => {
            const action = SearchUIUtils.getAction(searchResults.data, {}, 'invalid_key', CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });

        test('Should return `Submit` action for transaction on policy with delayed submission and no violations', () => {
            let action = SearchUIUtils.getAction(searchResults.data, {}, `report_${reportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.SUBMIT);

            action = SearchUIUtils.getAction(searchResults.data, {}, `transactions_${transactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.SUBMIT);
        });

        test('Should return `View` action for transaction on policy with delayed submission and with violations when current user is submitter and the expense was submitted', async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: submitterAccountID});
            const localSearchResults = {
                ...searchResults.data,
                [`policy_${policyID}`]: {
                    ...searchResults.data[`policy_${policyID}`],
                    role: CONST.POLICY.ROLE.USER,
                },
                [`report_${reportID2}`]: {
                    ...searchResults.data[`report_${reportID2}`],
                    accountID: submitterAccountID,
                    ownerAccountID: submitterAccountID,
                },
                [`transactions_${transactionID2}`]: {
                    ...searchResults.data[`transactions_${transactionID2}`],
                    accountID: submitterAccountID,
                    managerID: adminAccountID,
                },
            };
            expect(SearchUIUtils.getAction(localSearchResults, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES)).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
            expect(SearchUIUtils.getAction(localSearchResults, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES)).toStrictEqual(
                CONST.SEARCH.ACTION_TYPES.VIEW,
            );
        });

        test('Should return `Review` action for transaction with duplicate violation', async () => {
            const duplicateViolation = {
                [`transactionViolations_${transactionID2}`]: [
                    {
                        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                        type: CONST.VIOLATION_TYPES.WARNING,
                        showInReview: true,
                    },
                ],
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`, searchResults.data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`]);

            const action = SearchUIUtils.getAction(searchResults.data, duplicateViolation, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });

        test('Should return `Review` action for transaction on policy with delayed submission and with violations', () => {
            let action = SearchUIUtils.getAction(searchResults.data, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);

            action = SearchUIUtils.getAction(searchResults.data, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });

        test('Should return `Paid` action for a manually settled report', () => {
            const paidReportID = 'report_paid';
            const localSearchResults = {
                ...searchResults.data,
                [paidReportID]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: paidReportID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                },
                [`reportNameValuePairs_${paidReportID}`]: {
                    manualReimbursed: '2024-01-01',
                },
            };

            const action = SearchUIUtils.getAction(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.PAID);
        });

        test('Should return `Paid` action for a settled report on an auto-reimbursement policy', () => {
            const paidReportID = 'report_paid_auto';
            const policyIDAuto = 'policy_auto';

            const localSearchResults = {
                ...searchResults.data,
                [`policy_${policyIDAuto}`]: {
                    ...searchResults.data[`policy_${policyID}`],
                    id: policyIDAuto,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                },
                [paidReportID]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: paidReportID,
                    policyID: policyIDAuto,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                },
            };

            const action = SearchUIUtils.getAction(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.PAID);
        });

        test('Should return `Pay` action for a closed IOU report with an outstanding balance', () => {
            const closedReportID = 'report_closed_with_balance';
            const localSearchResults = {
                ...searchResults.data,
                [`report_${closedReportID}`]: {
                    ...searchResults.data[`report_${reportID3}`],
                    reportID: closedReportID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                },
            };

            const action = SearchUIUtils.getAction(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.PAY);
        });

        test('Should return `Done` action for a closed report with a zero balance', () => {
            const closedReportID = 'report_closed';
            const localSearchResults = {
                ...searchResults.data,
                [`report_${closedReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: closedReportID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    total: 0,
                },
            };

            const action = SearchUIUtils.getAction(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.DONE);
        });

        test('Should return `Review` action if report has errors', () => {
            const errorReportID = 'report_error';
            const localSearchResults = {
                ...searchResults.data,
                [`report_${errorReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: errorReportID,
                    errors: {error: 'An error'},
                },
            };
            const action = SearchUIUtils.getAction(localSearchResults, {}, `report_${errorReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });

        test('Should return `View` action for non-money request reports', () => {
            const action = SearchUIUtils.getAction(searchResults.data, {}, `report_${reportID4}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });

        test('Should return `View` action for an orphaned transaction', () => {
            const orphanedTransactionID = 'transaction_orphaned';
            const localSearchResults = {
                ...searchResults.data,
                [`transactions_${orphanedTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: orphanedTransactionID,
                    reportID: 'non_existent_report',
                },
            };
            const action = SearchUIUtils.getAction(localSearchResults, {}, `transactions_${orphanedTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `View` action for a transaction in a multi-transaction report', () => {
            const multiTransactionID = 'transaction_multi';
            const localSearchResults = {
                ...searchResults.data,
                [`transactions_${multiTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: multiTransactionID,
                    isFromOneTransactionReport: false,
                },
            };
            const action = SearchUIUtils.getAction(localSearchResults, {}, `transactions_${multiTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `Review` action if report export has failed', () => {
            const failedExportReportID = 'report_failed_export';
            const localSearchResults = {
                ...searchResults.data,
                [`report_${failedExportReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: failedExportReportID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
                [`reportNameValuePairs_${failedExportReportID}`]: {
                    exportFailedTime: '2024-01-01',
                },
            };
            const action = SearchUIUtils.getAction(localSearchResults, {}, `report_${failedExportReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Review` action if transaction has errors', () => {
            const errorTransactionID = 'transaction_error';
            const localSearchResults = {
                ...searchResults.data,
                [`transactions_${errorTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: errorTransactionID,
                    errors: {error: 'An error'},
                },
            };
            const action = SearchUIUtils.getAction(localSearchResults, {}, `transactions_${errorTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Pay` action for an IOU report ready to be paid', async () => {
            Onyx.merge(ONYXKEYS.SESSION, {accountID: adminAccountID});
            await waitForBatchedUpdates();
            const iouReportKey = `report_${reportID3}`;
            const action = SearchUIUtils.getAction(searchResults.data, {}, iouReportKey, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.PAY);
        });
    });

    describe('Test getListItem', () => {
        it('should return ChatListItem when type is CHAT', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.EXPENSE.ALL)).toStrictEqual(ChatListItem);
        });

        it('should return TransactionListItem when groupBy is undefined', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, undefined)).toStrictEqual(TransactionListItem);
        });

        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is report', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is TRIP and groupBy is report', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is INVOICE and groupBy is report', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is member', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is TRIP and groupBy is member', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is INVOICE and groupBy is member', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual(TransactionGroupListItem);
        });
    });

    describe('Test getSections', () => {
        it('should return getReportActionsSections result when type is CHAT', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.CHAT, searchResults.data, searchResults.search)).toStrictEqual(reportActionListItems);
        });

        it('should return getTransactionsSections result when groupBy is undefined', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResults.data, searchResults.search, undefined)).toStrictEqual(transactionsListItems);
        });

        it('should return getReportSections result when type is EXPENSE and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getReportSections result when type is TRIP and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.TRIP, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getReportSections result when type is INVOICE and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.INVOICE, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getMemberSections result when type is EXPENSE and groupBy is member', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual([]); // s77rt update test
        });

        it('should return getMemberSections result when type is TRIP and groupBy is member', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.TRIP, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual([]); // s77rt update test
        });

        it('should return getMemberSections result when type is INVOICE and groupBy is member', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.INVOICE, searchResults.data, searchResults.search, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual([]); // s77rt update test
        });

        // s77rt add test for group by card
    });

    describe('Test getSortedSections', () => {
        it('should return getSortedReportActionData result when type is CHAT', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.EXPENSE.ALL, reportActionListItems, localeCompare)).toStrictEqual([
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

        it('should return getSortedTransactionData result when groupBy is undefined', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionsListItems, localeCompare, 'date', 'asc', undefined)).toStrictEqual(transactionsListItems);
        });

        it('should return getSortedReportData result when type is EXPENSE and groupBy is report', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.REPORTS),
            ).toStrictEqual(transactionReportGroupListItems);
        });

        it('should return getSortedReportData result when type is TRIP and groupBy is report', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.TRIP, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.REPORTS),
            ).toStrictEqual(transactionReportGroupListItems);
        });

        it('should return getSortedReportData result when type is INVOICE and groupBy is report', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.INVOICE, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.REPORTS),
            ).toStrictEqual(transactionReportGroupListItems);
        });

        it('should return getSortedMemberData result when type is EXPENSE and groupBy is member', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.FROM),
            ).toStrictEqual([]); // s77rt update test
        });

        it('should return getSortedMemberData result when type is TRIP and groupBy is member', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.TRIP, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.FROM),
            ).toStrictEqual([]); // s77rt update test
        });

        it('should return getSortedMemberData result when type is INVOICE and groupBy is member', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.INVOICE, '', transactionReportGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.FROM),
            ).toStrictEqual([]); // s77rt update test
        });

        // s77rt add test for group by card
    });

    describe('Test createTypeMenuItems', () => {
        it('should return the default menu items', () => {
            const menuItems = SearchUIUtils.createTypeMenuSections(undefined, undefined, {}, undefined, {})
                .map((section) => section.menuItems)
                .flat();

            expect(menuItems).toHaveLength(3);
            expect(menuItems).toStrictEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        translationPath: 'common.expenses',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                        icon: Expensicons.Receipt,
                    }),
                    expect.objectContaining({
                        translationPath: 'common.reports',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                        icon: Expensicons.Document,
                    }),
                    expect.objectContaining({
                        translationPath: 'common.chats',
                        type: CONST.SEARCH.DATA_TYPES.CHAT,
                        icon: Expensicons.ChatBubbles,
                    }),
                ]),
            );
        });

        it('should generate correct routes', () => {
            const menuItems = SearchUIUtils.createTypeMenuSections(undefined, undefined, {}, undefined, {})
                .map((section) => section.menuItems)
                .flat();

            const expectedQueries = ['type:expense sortBy:date sortOrder:desc', 'type:expense sortBy:date sortOrder:desc groupBy:reports', 'type:chat sortBy:date sortOrder:desc'];

            menuItems.forEach((item, index) => {
                expect(item.searchQuery).toStrictEqual(expectedQueries.at(index));
            });
        });
    });

    test('Should show `View` to overlimit approver', () => {
        Onyx.merge(ONYXKEYS.SESSION, {accountID: overlimitApproverAccountID});
        searchResults.data[`policy_${policyID}`].role = CONST.POLICY.ROLE.USER;
        return waitForBatchedUpdates().then(() => {
            let action = SearchUIUtils.getAction(searchResults.data, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);

            action = SearchUIUtils.getAction(searchResults.data, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
    });

    test('Should show `Approve` for report', () => {
        Onyx.merge(ONYXKEYS.SESSION, {accountID: adminAccountID});

        const result: OnyxTypes.SearchResults = {
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
                        state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE,
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
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                offset: 0,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
                columnsToShow: {
                    shouldShowCategoryColumn: true,
                    shouldShowTagColumn: true,
                    shouldShowTaxColumn: true,
                    shouldShowFromColumn: true,
                    shouldShowToColumn: true,
                    shouldShowDescriptionColumn: false,
                },
            },
        };
        return waitForBatchedUpdates().then(() => {
            const action = SearchUIUtils.getAction(result.data, allViolations, 'report_6523565988285061', CONST.SEARCH.SEARCH_KEYS.EXPENSES);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.APPROVE);
        });
    });

    test('Should return true if the search result has valid type', () => {
        expect(SearchUIUtils.shouldShowEmptyState(false, transactionReportGroupListItems.length, searchResults.search.type)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, 0, searchResults.search.type)).toBe(true);
        const inValidSearchType: SearchDataTypes = 'expensify' as SearchDataTypes;
        expect(SearchUIUtils.shouldShowEmptyState(true, transactionReportGroupListItems.length, inValidSearchType)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, transactionReportGroupListItems.length, searchResults.search.type)).toBe(false);
    });

    test('Should determine whether the date, amount, and tax column require wide columns or not', () => {
        // Test case 1: `isAmountLengthLong` should be false if the current symbol + amount length does not exceed 11 characters
        const {shouldShowAmountInWideColumn} = SearchUIUtils.getWideAmountIndicators(transactionsListItems);
        expect(shouldShowAmountInWideColumn).toBe(false);

        const transaction = transactionsListItems.at(0);

        // Test case 2: `isAmountLengthLong` should be true when the current symbol + amount length exceeds 11 characters
        // `isTaxAmountLengthLong` should be false if current symbol + tax amount length does not exceed 11 characters
        const {shouldShowAmountInWideColumn: isAmountLengthLong2, shouldShowTaxAmountInWideColumn} = SearchUIUtils.getWideAmountIndicators([
            ...transactionsListItems,
            {...transaction, amount: 99999999.99, taxAmount: 2332.77, modifiedAmount: undefined},
        ] as TransactionListItemType[]);
        expect(isAmountLengthLong2).toBe(true);
        expect(shouldShowTaxAmountInWideColumn).toBe(false);

        // Test case 3: Both `isAmountLengthLong` and `isTaxAmountLengthLong` should be true
        // when the current symbol + amount and current symbol + tax amount lengths exceed 11 characters
        const {shouldShowAmountInWideColumn: isAmountLengthLong3, shouldShowTaxAmountInWideColumn: isTaxAmountLengthLong2} = SearchUIUtils.getWideAmountIndicators([
            ...transactionsListItems,
            {...transaction, amount: 99999999.99, taxAmount: 45555555.55, modifiedAmount: undefined},
        ] as TransactionListItemType[]);
        expect(isAmountLengthLong3).toBe(true);
        expect(isTaxAmountLengthLong2).toBe(true);
    });

    describe('Test getColumnsToShow', () => {
        test('Should only show columns when at least one transaction has a value for them', async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: submitterAccountID});

            // Use the existing transaction as a base and modify only the fields we need to test
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];

            // Create test transactions as arrays (getColumnsToShow accepts arrays)
            const emptyTransaction = {
                ...baseTransaction,
                transactionID: 'empty',
                merchant: '',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                accountID: submitterAccountID,
                managerID: submitterAccountID,
            };

            const merchantTransaction = {
                ...baseTransaction,
                transactionID: 'merchant',
                merchant: 'Test Merchant',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                accountID: submitterAccountID,
                managerID: submitterAccountID,
            };

            const categoryTransaction = {
                ...baseTransaction,
                transactionID: 'category',
                merchant: '',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: 'Office Supplies',
                tag: '',
                accountID: submitterAccountID,
                managerID: submitterAccountID,
            };

            const tagTransaction = {
                ...baseTransaction,
                transactionID: 'tag',
                merchant: '',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: 'Project A',
                accountID: submitterAccountID,
                managerID: submitterAccountID,
            };

            const descriptionTransaction = {
                ...baseTransaction,
                transactionID: 'description',
                merchant: '',
                modifiedMerchant: '',
                comment: {comment: 'Business meeting lunch'},
                category: '',
                tag: '',
                accountID: submitterAccountID,
                managerID: submitterAccountID,
            };

            const differentUsersTransaction = {
                ...baseTransaction,
                transactionID: 'differentUsers',
                merchant: '',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                accountID: approverAccountID, // Different from current user
                managerID: adminAccountID, // Different from current user
                reportID: reportID2, // Needs to be a submitter report for 'To' to show
            };

            // Test 1: No optional fields should be shown when all transactions are empty
            let columns = SearchUIUtils.getColumnsToShow([emptyTransaction, emptyTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.FROM]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TO]).toBe(false);

            // Test 2: Merchant column should show when at least one transaction has merchant
            columns = SearchUIUtils.getColumnsToShow([emptyTransaction, merchantTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Test 3: Category column should show when at least one transaction has category
            columns = SearchUIUtils.getColumnsToShow([emptyTransaction, categoryTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);

            // Test 4: Tag column should show when at least one transaction has tag
            columns = SearchUIUtils.getColumnsToShow([emptyTransaction, tagTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Test 5: Description column should show when at least one transaction has description
            columns = SearchUIUtils.getColumnsToShow([emptyTransaction, descriptionTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);

            // Test 6: From/To columns should show when at least one transaction has different users
            // @ts-expect-error -- no need to construct all data again, the function below only needs the report and transactions
            const data: OnyxTypes.SearchResults['data'] = {
                [`report_${reportID2}`]: searchResults.data[`report_${reportID2}`],
                [`transactions_${emptyTransaction.transactionID}`]: emptyTransaction,
                [`transactions_${differentUsersTransaction.transactionID}`]: differentUsersTransaction,
            };
            columns = SearchUIUtils.getColumnsToShow(data, false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.FROM]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TO]).toBe(true);

            // Test 7: Multiple columns should show when transactions have different fields
            columns = SearchUIUtils.getColumnsToShow([merchantTransaction, categoryTransaction, tagTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]).toBe(false);
        });

        test('Should respect isExpenseReportView flag and not show From/To columns', () => {
            // Create transaction with different users using existing transaction as base
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];
            const testTransaction = {
                ...baseTransaction,
                transactionID: 'test',
                merchant: 'Test Merchant',
                modifiedMerchant: '',
                comment: {comment: 'Test description'},
                category: 'Office Supplies',
                tag: 'Project A',
                accountID: submitterAccountID, // Different from current user
                managerID: approverAccountID, // Different from current user
            };

            // In expense report view, From/To columns should not be shown
            const columns = SearchUIUtils.getColumnsToShow([testTransaction], true);

            // These columns should be shown based on data
            expect(columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT]).toBe(true);
            expect(columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY]).toBe(true);
            expect(columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG]).toBe(true);
            expect(columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION]).toBe(true);

            // From/To columns should not exist in expense report view
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.FROM]).toBeUndefined();
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TO]).toBeUndefined();
        });

        test('Should handle modifiedMerchant and empty category/tag values correctly', () => {
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];
            const testTransaction = {
                ...baseTransaction,
                transactionID: 'modified',
                merchant: '',
                modifiedMerchant: 'Modified Merchant',
                comment: {comment: ''},
                category: 'Uncategorized', // This is in CONST.SEARCH.CATEGORY_EMPTY_VALUE
                tag: CONST.SEARCH.TAG_EMPTY_VALUE, // This is the empty tag value
                accountID: adminAccountID,
                managerID: adminAccountID,
            };

            const columns = SearchUIUtils.getColumnsToShow([testTransaction], false);

            // Should show merchant column because modifiedMerchant has value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(true);

            // Should not show category column because 'Uncategorized' is an empty value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Should not show tag column because it's the empty tag value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(false);
        });
    });
});
