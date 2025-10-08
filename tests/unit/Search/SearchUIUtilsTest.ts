import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {
    ReportActionListItemType,
    TransactionCardGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import Navigation from '@navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax
import type * as ReportUserActions from '@userActions/Report';
import {createTransactionThreadReport, openReport} from '@userActions/Report';
// eslint-disable-next-line no-restricted-syntax
import type * as SearchUtils from '@userActions/Search';
import {updateSearchResultsWithTransactionThreadReportID} from '@userActions/Search';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {CardFeedForDisplay} from '@src/libs/CardFeedUtils';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {formatPhoneNumber, localeCompare} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportUserActions>('@userActions/Report'),
    createTransactionThreadReport: jest.fn(),
    openReport: jest.fn(),
}));
jest.mock('@userActions/Search', () => ({
    ...jest.requireActual<typeof SearchUtils>('@userActions/Search'),
    updateSearchResultsWithTransactionThreadReportID: jest.fn(),
}));

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
const cardID = 20202020;
const cardID2 = 30303030;
const entryID = 5;
const entryID2 = 6;
const accountNumber = 'XXXXXXXX6789';
const accountNumber2 = 'XXXXXXXX5544';

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
            allActions: ['view'],
            amount: -5000,
            canDelete: true,
            canHold: true,
            canUnhold: false,
            cardID: undefined,
            cardName: undefined,
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
            filename: undefined,
            isActionLoading: false,
            convertedAmount: -5000,
            convertedCurrency: 'USD',
        },
        [`transactions_${transactionID2}`]: {
            accountID: adminAccountID,
            action: 'view',
            allActions: ['view'],
            amount: -5000,
            canDelete: true,
            canHold: true,
            canUnhold: false,
            cardID: undefined,
            cardName: undefined,
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
            filename: undefined,
            isActionLoading: false,
            convertedAmount: -5000,
            convertedCurrency: 'USD',
        },
        ...allViolations,
        [`transactions_${transactionID3}`]: {
            accountID: adminAccountID,
            amount: 1200,
            action: 'view',
            allActions: ['view'],
            canDelete: true,
            canHold: true,
            canUnhold: false,
            cardID: undefined,
            cardName: undefined,
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
            filename: undefined,
            isActionLoading: false,
            hasViolation: undefined,
            convertedAmount: -5000,
            convertedCurrency: 'USD',
        },
        [`transactions_${transactionID4}`]: {
            accountID: adminAccountID,
            amount: 3200,
            action: 'view',
            allActions: ['view'],
            canDelete: true,
            canHold: true,
            canUnhold: false,
            cardID: undefined,
            cardName: undefined,
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
            filename: undefined,
            isActionLoading: false,
            hasViolation: undefined,
            convertedAmount: -5000,
            convertedCurrency: 'USD',
        },
    },
    search: {
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        isLoading: false,
        type: 'expense',
    },
};

const searchResultsGroupByFrom: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            [adminAccountID]: {
                accountID: adminAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Zara',
                login: adminEmail,
            },
            [approverAccountID]: {
                accountID: approverAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Andrew',
                login: approverEmail,
            },
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${adminAccountID}` as const]: {
            accountID: adminAccountID,
            count: 3,
            currency: 'USD',
            total: 70,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${approverAccountID}` as const]: {
            accountID: approverAccountID,
            count: 2,
            currency: 'USD',
            total: 30,
        },
    },
    search: {
        count: 5,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
        total: 100,
        isLoading: false,
        type: 'expense',
    },
};

const searchResultsGroupByCard: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            [adminAccountID]: {
                accountID: adminAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Zara',
                login: adminEmail,
            },
            [approverAccountID]: {
                accountID: approverAccountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'Andrew',
                login: approverEmail,
            },
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${cardID}` as const]: {
            accountID: adminAccountID,
            bank: CONST.BANK_NAMES.CHASE,
            cardID,
            cardName: "Zara's card",
            count: 4,
            currency: 'USD',
            lastFourPAN: '1234',
            total: 40,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${cardID2}` as const]: {
            accountID: approverAccountID,
            bank: CONST.BANK_NAMES.AMERICAN_EXPRESS,
            cardID: cardID2,
            cardName: "Andrew's card",
            count: 6,
            currency: 'USD',
            lastFourPAN: '1234',
            total: 20,
        },
    },
    search: {
        count: 10,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
        total: 60,
        isLoading: false,
        type: 'expense',
    },
};

const searchResultsGroupByWithdrawalID: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}${entryID}` as const]: {
            entryID,
            accountNumber,
            bankName: CONST.BANK_NAMES.CHASE,
            debitPosted: '2025-08-12 17:11:22',
            count: 4,
            currency: 'USD',
            total: 40,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${cardID2}` as const]: {
            entryID: entryID2,
            accountNumber: accountNumber2,
            bankName: CONST.BANK_NAMES.CITIBANK,
            debitPosted: '2025-08-19 18:10:54',
            count: 6,
            currency: 'USD',
            total: 20,
        },
    },
    search: {
        count: 10,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 60,
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
        allActions: ['submit'],
        amount: -5000,
        report: report1,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        cardID: undefined,
        cardName: undefined,
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
        shouldShowMerchant: true,
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
        filename: undefined,
        isActionLoading: false,
        hasViolation: false,
        violations: [],
        convertedAmount: -5000,
        convertedCurrency: 'USD',
    },
    {
        accountID: 18439984,
        action: 'review',
        allActions: ['review', 'approve'],
        amount: -5000,
        report: report2,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        cardID: undefined,
        cardName: undefined,
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
        shouldShowMerchant: true,
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
        filename: undefined,
        isActionLoading: false,
        hasViolation: true,
        violations: [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ],
        convertedAmount: -5000,
        convertedCurrency: 'USD',
    },
    {
        accountID: 18439984,
        amount: 1200,
        action: 'view',
        allActions: ['view'],
        report: report3,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        cardID: undefined,
        cardName: undefined,
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
        shouldShowYear: true,
        keyForList: '3',
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
        filename: undefined,
        isActionLoading: false,
        hasViolation: undefined,
        violations: [],
        convertedAmount: -5000,
        convertedCurrency: 'USD',
    },
    {
        accountID: 18439984,
        amount: 3200,
        action: 'view',
        allActions: ['view'],
        report: report3,
        canDelete: true,
        canHold: true,
        canUnhold: false,
        cardID: undefined,
        cardName: undefined,
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
        shouldShowYear: true,
        keyForList: '3',
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
        filename: undefined,
        isActionLoading: false,
        hasViolation: undefined,
        violations: [],
        convertedAmount: -5000,
        convertedCurrency: 'USD',
    },
] as TransactionListItemType[];

const transactionReportGroupListItems = [
    {
        groupedBy: 'reports',
        accountID: 18439984,
        action: 'submit',
        allActions: ['submit'],
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
                allActions: ['submit'],
                report: report1,
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                cardID: undefined,
                cardName: undefined,
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
                shouldShowMerchant: true,
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
                filename: undefined,
                isActionLoading: false,
                violations: [],
                convertedAmount: -5000,
                convertedCurrency: 'USD',
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
        groupedBy: 'reports',
        accountID: 18439984,
        action: 'review',
        allActions: ['review', 'approve'],
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
                allActions: ['review', 'approve'],
                report: report2,
                amount: -5000,
                canDelete: true,
                canHold: true,
                canUnhold: false,
                cardID: undefined,
                cardName: undefined,
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
                shouldShowMerchant: true,
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
                filename: undefined,
                isActionLoading: false,
                convertedAmount: -5000,
                convertedCurrency: 'USD',
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
        allActions: ['pay'],
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
        allActions: ['view'],
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

const transactionMemberGroupListItems: TransactionMemberGroupListItemType[] = [
    {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        count: 3,
        currency: 'USD',
        displayName: 'Zara',
        groupedBy: 'from',
        login: 'admin@policy.com',
        total: 70,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        accountID: 1111111,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        count: 2,
        currency: 'USD',
        displayName: 'Andrew',
        groupedBy: 'from',
        login: 'approver@policy.com',
        total: 30,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionMemberGroupListItemsSorted: TransactionMemberGroupListItemType[] = [
    {
        accountID: 1111111,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        count: 2,
        currency: 'USD',
        displayName: 'Andrew',
        groupedBy: 'from',
        login: 'approver@policy.com',
        total: 30,
        transactions: [],
        transactionsQueryJSON: undefined,
    },

    {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        count: 3,
        currency: 'USD',
        displayName: 'Zara',
        groupedBy: 'from',
        login: 'admin@policy.com',
        total: 70,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionCardGroupListItems: TransactionCardGroupListItemType[] = [
    {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        bank: CONST.BANK_NAMES.CHASE,
        cardID: 20202020,
        cardName: "Zara's card",
        count: 4,
        currency: 'USD',
        displayName: 'Zara',
        groupedBy: 'card',
        lastFourPAN: '1234',
        login: 'admin@policy.com',
        total: 40,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        accountID: 1111111,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        bank: CONST.BANK_NAMES.AMERICAN_EXPRESS,
        cardID: 30303030,
        cardName: "Andrew's card",
        count: 6,
        currency: 'USD',
        displayName: 'Andrew',
        groupedBy: 'card',
        lastFourPAN: '1234',
        login: 'approver@policy.com',
        total: 20,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionCardGroupListItemsSorted: TransactionCardGroupListItemType[] = [
    {
        accountID: 1111111,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        bank: CONST.BANK_NAMES.AMERICAN_EXPRESS,
        cardID: 30303030,
        cardName: "Andrew's card",
        count: 6,
        currency: 'USD',
        displayName: 'Andrew',
        groupedBy: 'card',
        lastFourPAN: '1234',
        login: 'approver@policy.com',
        total: 20,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        bank: CONST.BANK_NAMES.CHASE,
        cardID: 20202020,
        cardName: "Zara's card",
        count: 4,
        currency: 'USD',
        displayName: 'Zara',
        groupedBy: 'card',
        lastFourPAN: '1234',
        login: 'admin@policy.com',
        total: 40,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionWithdrawalIDGroupListItems: TransactionWithdrawalIDGroupListItemType[] = [
    {
        bankName: CONST.BANK_NAMES.CHASE,
        entryID,
        accountNumber,
        debitPosted: '2025-08-12 17:11:22',
        count: 4,
        currency: 'USD',
        total: 40,
        groupedBy: 'withdrawal-id',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        bankName: CONST.BANK_NAMES.CITIBANK,
        entryID: entryID2,
        accountNumber: accountNumber2,
        debitPosted: '2025-08-19 18:10:54',
        count: 6,
        currency: 'USD',
        total: 20,
        groupedBy: 'withdrawal-id',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionWithdrawalIDGroupListItemsSorted: TransactionWithdrawalIDGroupListItemType[] = [
    {
        bankName: CONST.BANK_NAMES.CITIBANK,
        entryID: entryID2,
        accountNumber: accountNumber2,
        debitPosted: '2025-08-19 18:10:54',
        count: 6,
        currency: 'USD',
        total: 20,
        groupedBy: 'withdrawal-id',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        bankName: CONST.BANK_NAMES.CHASE,
        entryID,
        accountNumber,
        debitPosted: '2025-08-12 17:11:22',
        count: 4,
        currency: 'USD',
        total: 40,
        groupedBy: 'withdrawal-id',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

describe('SearchUIUtils', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await IntlStore.load('en');
    });
    describe('Test getAction', () => {
        test('Should return `View` action for an invalid key', () => {
            const action = SearchUIUtils.getActions(searchResults.data, {}, 'invalid_key', CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });

        test('Should return `Submit` action for transaction on policy with delayed submission and no violations', () => {
            let action = SearchUIUtils.getActions(searchResults.data, {}, `report_${reportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.SUBMIT);

            action = SearchUIUtils.getActions(searchResults.data, {}, `transactions_${transactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            expect(SearchUIUtils.getActions(localSearchResults, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, submitterAccountID).at(0)).toStrictEqual(
                CONST.SEARCH.ACTION_TYPES.VIEW,
            );
            expect(SearchUIUtils.getActions(localSearchResults, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, submitterAccountID).at(0)).toStrictEqual(
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

            const action = SearchUIUtils.getActions(searchResults.data, duplicateViolation, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });

        test('Should return `Review` action for transaction on policy with delayed submission and with violations', () => {
            let action = SearchUIUtils.getActions(searchResults.data, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);

            action = SearchUIUtils.getActions(searchResults.data, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);

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

            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);

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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${errorReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });

        test('Should return `View` action for non-money request reports', () => {
            const action = SearchUIUtils.getActions(searchResults.data, {}, `report_${reportID4}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `transactions_${orphanedTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `transactions_${multiTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${failedExportReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `transactions_${errorTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });
        test('Should return `Pay` action for an IOU report ready to be paid', async () => {
            Onyx.merge(ONYXKEYS.SESSION, {accountID: adminAccountID});
            await waitForBatchedUpdates();
            const iouReportKey = `report_${reportID3}`;
            const action = SearchUIUtils.getActions(searchResults.data, {}, iouReportKey, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.CHAT, searchResults.data, 2074551, formatPhoneNumber)).toStrictEqual(reportActionListItems);
        });

        it('should return getTransactionsSections result when groupBy is undefined', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResults.data, 2074551, formatPhoneNumber)).toEqual(transactionsListItems);
        });

        it('should include iouRequestType property for distance transactions', () => {
            const distanceTransactionID = 'distance_transaction_123';
            const testSearchResults = {
                ...searchResults,
                data: {
                    ...searchResults.data,
                    [`transactions_${distanceTransactionID}`]: {
                        ...searchResults.data[`transactions_${transactionID}`],
                        transactionID: distanceTransactionID,
                        transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    },
                },
            };

            const result = SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, testSearchResults.data, 2074551, formatPhoneNumber) as TransactionListItemType[];

            const distanceTransaction = result.find((item) => item.transactionID === distanceTransactionID);

            expect(distanceTransaction).toBeDefined();
            expect(distanceTransaction?.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE);

            const expectedPropertyCount = 57;
            expect(Object.keys(distanceTransaction ?? {}).length).toBe(expectedPropertyCount);
        });

        it('should include iouRequestType property for distance transactions in grouped results', () => {
            const distanceTransactionID = 'distance_transaction_grouped_123';
            const testSearchResults = {
                ...searchResults,
                data: {
                    ...searchResults.data,
                    [`transactions_${distanceTransactionID}`]: {
                        ...searchResults.data[`transactions_${transactionID}`],
                        transactionID: distanceTransactionID,
                        transactionType: CONST.SEARCH.TRANSACTION_TYPE.DISTANCE,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    },
                },
            };

            const result = SearchUIUtils.getSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                testSearchResults.data,
                2074551,
                formatPhoneNumber,
                CONST.SEARCH.GROUP_BY.REPORTS,
            ) as TransactionGroupListItemType[];

            const reportGroup = result.find((group) => group.transactions?.some((transaction) => transaction.transactionID === distanceTransactionID));

            const distanceTransaction = reportGroup?.transactions?.find((transaction) => transaction.transactionID === distanceTransactionID);

            expect(distanceTransaction).toBeDefined();
            expect(distanceTransaction?.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE);

            const expectedPropertyCount = 57;
            expect(Object.keys(distanceTransaction ?? {}).length).toBe(expectedPropertyCount);
        });

        it('should return getReportSections result when type is EXPENSE and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResults.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getReportSections result when type is TRIP and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.TRIP, searchResults.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getReportSections result when type is INVOICE and groupBy is report', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.INVOICE, searchResults.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.REPORTS)).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getMemberSections result when type is EXPENSE and groupBy is from', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResultsGroupByFrom.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.FROM)).toStrictEqual(
                transactionMemberGroupListItems,
            );
        });

        it('should return getCardSections result when type is EXPENSE and groupBy is card', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResultsGroupByCard.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.CARD)).toStrictEqual(
                transactionCardGroupListItems,
            );
        });

        it('should return getWithdrawalIDSections result when type is EXPENSE and groupBy is withdrawal-id', () => {
            expect(
                SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, searchResultsGroupByWithdrawalID.data, 2074551, formatPhoneNumber, CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID),
            ).toStrictEqual(transactionWithdrawalIDGroupListItems);
        });
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
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionMemberGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.FROM),
            ).toStrictEqual(transactionMemberGroupListItemsSorted);
        });

        it('should return getSortedCardData result when type is EXPENSE and groupBy is card', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionCardGroupListItems, localeCompare, 'date', 'asc', CONST.SEARCH.GROUP_BY.CARD),
            ).toStrictEqual(transactionCardGroupListItemsSorted);
        });

        it('should return getSortedWithdrawalIDData result when type is EXPENSE and groupBy is withdrawal-id', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionWithdrawalIDGroupListItems,
                    localeCompare,
                    'date',
                    'asc',
                    CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                ),
            ).toStrictEqual(transactionWithdrawalIDGroupListItemsSorted);
        });
    });

    describe('Test createTypeMenuItems', () => {
        it('should return the default menu items', () => {
            const menuItems = SearchUIUtils.createTypeMenuSections(undefined, undefined, {}, undefined, {}, undefined, {}, false, undefined, true, false, undefined)
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

        it('should show todo section with submit, approve, pay, and export items when user has appropriate permissions', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'Test Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    approver: adminEmail,
                    exporter: adminEmail,
                    achAccount: {
                        bankAccountID: 1,
                        reimburser: adminEmail,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '1234567890',
                        routingNumber: '1234567890',
                        addressName: 'Test Address',
                        bankName: 'Test Bank',
                    },
                    areExpensifyCardsEnabled: true,
                    areCompanyCardsEnabled: true,
                    employeeList: {
                        [adminEmail]: {
                            email: adminEmail,
                            role: CONST.POLICY.ROLE.ADMIN,
                            submitsTo: approverEmail,
                        },
                        [approverEmail]: {
                            email: approverEmail,
                            role: CONST.POLICY.ROLE.USER,
                            submitsTo: adminEmail,
                        },
                    },
                },
            };

            const mockCardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
                policy1: [
                    {
                        id: 'card1',
                        feed: 'Expensify Card' as const,
                        fundID: 'fund1',
                        name: 'Test Card Feed',
                    },
                ],
            };

            const mockSavedSearches = {};

            const sections = SearchUIUtils.createTypeMenuSections(
                adminEmail,
                adminAccountID,
                mockCardFeedsByPolicy,
                undefined,
                mockPolicies,
                undefined,
                mockSavedSearches,
                false,
                undefined,
                true,
                false,
            );

            const todoSection = sections.find((section) => section.translationPath === 'common.todo');
            expect(todoSection).toBeDefined();
            expect(todoSection?.menuItems.length).toBeGreaterThan(0);

            const menuItemKeys = todoSection?.menuItems.map((item) => item.key) ?? [];
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.APPROVE);
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.EXPORT);
        });

        it('should show accounting section with statements, unapproved cash, unapproved card, and reconciliation items', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'Test Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    areExpensifyCardsEnabled: true,
                    areCompanyCardsEnabled: true,
                    achAccount: {
                        bankAccountID: 1234,
                        reimburser: adminEmail,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '1234567890',
                        routingNumber: '1234567890',
                        addressName: 'Test Address',
                        bankName: 'Test Bank',
                    },
                },
            };

            const mockCardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
                policy1: [
                    {
                        id: 'card1',
                        feed: 'Expensify Card' as const,
                        fundID: 'fund1',
                        name: 'Test Card Feed',
                    },
                ],
            };

            const mockSavedSearches = {};

            const sections = SearchUIUtils.createTypeMenuSections(
                adminEmail,
                adminAccountID,
                mockCardFeedsByPolicy,
                undefined,
                mockPolicies,
                undefined,
                mockSavedSearches,
                false,
                undefined,
                true,
                false,
            );

            const accountingSection = sections.find((section) => section.translationPath === 'workspace.common.accounting');
            expect(accountingSection).toBeDefined();
            expect(accountingSection?.menuItems.length).toBeGreaterThan(0);

            const menuItemKeys = accountingSection?.menuItems.map((item) => item.key) ?? [];
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.STATEMENTS);
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH);
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD);
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('should show saved section when there are saved searches', () => {
            const mockSavedSearches = {
                search1: {
                    id: 'search1',
                    name: 'My Saved Search',
                    query: 'type:expense',
                    pendingAction: undefined,
                },
                search2: {
                    id: 'search2',
                    name: 'Another Search',
                    query: 'type:report',
                    pendingAction: undefined,
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(adminEmail, adminAccountID, {}, undefined, {}, undefined, mockSavedSearches, false, undefined, true, false);

            const savedSection = sections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle');
            expect(savedSection).toBeDefined();
        });

        it('should not show saved section when there are no saved searches', () => {
            const mockSavedSearches = {};

            const sections = SearchUIUtils.createTypeMenuSections(adminEmail, adminAccountID, {}, undefined, {}, undefined, mockSavedSearches, false, undefined, true, false);

            const savedSection = sections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle');
            expect(savedSection).toBeUndefined();
        });

        it('should not show saved section when all saved searches are pending deletion and not offline', () => {
            const mockSavedSearches = {
                search1: {
                    id: 'search1',
                    name: 'Deleted Search',
                    query: 'type:expense',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(
                adminEmail,
                adminAccountID,
                {},
                undefined,
                {},
                undefined,
                mockSavedSearches,
                false, // not offline
                undefined,
                true,
                false,
            );

            const savedSection = sections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle');
            expect(savedSection).toBeUndefined();
        });

        it('should show saved section when searches are pending deletion but user is offline', () => {
            const mockSavedSearches = {
                search1: {
                    id: 'search1',
                    name: 'Deleted Search',
                    query: 'type:expense',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(
                adminEmail,
                adminAccountID,
                {},
                undefined,
                {},
                undefined,
                mockSavedSearches,
                true, // offline
                undefined,
                true,
                false,
            );

            const savedSection = sections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle');
            expect(savedSection).toBeDefined();
        });

        it('should not show todo section when user has no appropriate permissions', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'Personal Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: false,
                    role: CONST.POLICY.ROLE.USER,
                    type: CONST.POLICY.TYPE.PERSONAL, // personal policy, not team
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(adminEmail, adminAccountID, {}, undefined, mockPolicies, undefined, {}, false, undefined, true, false);

            const todoSection = sections.find((section) => section.translationPath === 'common.todo');
            expect(todoSection).toBeUndefined();
        });

        it('should not show accounting section when user has no admin permissions or card feeds', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'Team Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                    role: CONST.POLICY.ROLE.USER, // not admin
                    type: CONST.POLICY.TYPE.TEAM,
                    areCompanyCardsEnabled: false,
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(
                adminEmail,
                adminAccountID,
                {}, // no card feeds
                undefined,
                mockPolicies,
                undefined,
                {},
                false,
                undefined,
                true,
                false,
            );

            const accountingSection = sections.find((section) => section.translationPath === 'workspace.common.accounting');
            expect(accountingSection).toBeUndefined();
        });

        it('should show reconciliation for ACH-only scenario (payments enabled, active VBBA, reimburser set, areExpensifyCardsEnabled = false)', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'ACH Only Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    areExpensifyCardsEnabled: false,
                    achAccount: {
                        bankAccountID: 1234,
                        reimburser: adminEmail,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '1234567890',
                        routingNumber: '1234567890',
                        addressName: 'Test Address',
                        bankName: 'Test Bank',
                    },
                },
            };

            const sections = SearchUIUtils.createTypeMenuSections(adminEmail, adminAccountID, {}, undefined, mockPolicies, undefined, {}, false, undefined, true, false);

            const accountingSection = sections.find((section) => section.translationPath === 'workspace.common.accounting');
            expect(accountingSection).toBeDefined();

            const menuItemKeys = accountingSection?.menuItems.map((item) => item.key) ?? [];
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('should not show reconciliation for card-only scenario without card feeds (areExpensifyCardsEnabled = true but no card feeds)', () => {
            const mockPolicies = {
                policy1: {
                    id: 'policy1',
                    name: 'Card Only Policy',
                    owner: adminEmail,
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    areExpensifyCardsEnabled: true,
                },
            };

            const mockCardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {};
            const sections = SearchUIUtils.createTypeMenuSections(adminEmail, adminAccountID, mockCardFeedsByPolicy, undefined, mockPolicies, undefined, {}, false, undefined, true, false);
            const accountingSection = sections.find((section) => section.translationPath === 'workspace.common.accounting');

            expect(accountingSection).toBeDefined();
            const menuItemKeys = accountingSection?.menuItems.map((item) => item.key) ?? [];
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('should generate correct routes', () => {
            const menuItems = SearchUIUtils.createTypeMenuSections(undefined, undefined, {}, undefined, {}, undefined, {}, false, undefined, true, false)
                .map((section) => section.menuItems)
                .flat();

            const expectedQueries = ['type:expense sortBy:date sortOrder:desc', 'type:expense sortBy:date sortOrder:desc groupBy:reports', 'type:chat sortBy:date sortOrder:desc'];

            menuItems.forEach((item, index) => {
                expect(item.searchQuery).toStrictEqual(expectedQueries.at(index));
            });
        });
    });

    describe('Test isSearchResultsEmpty', () => {
        it('should return true when all transactions have delete pending action', () => {
            const results: OnyxTypes.SearchResults = {
                data: {
                    personalDetailsList: {},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_1805965960759424086: {
                        accountID: 2074551,
                        amount: 0,
                        canDelete: false,
                        canHold: true,
                        canUnhold: false,
                        category: 'Employee Meals Remote (Fringe Benefit)',
                        action: 'approve',
                        allActions: ['approve'],
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
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        convertedAmount: -5000,
                        convertedCurrency: 'USD',
                    },
                },
                search: {
                    type: 'expense',
                    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                    offset: 0,
                    hasMoreResults: false,
                    hasResults: true,
                    isLoading: false,
                },
            };
            expect(SearchUIUtils.isSearchResultsEmpty(results)).toBe(true);
        });
    });

    test('Should show `View` to overlimit approver', () => {
        Onyx.merge(ONYXKEYS.SESSION, {accountID: overlimitApproverAccountID});
        searchResults.data[`policy_${policyID}`].role = CONST.POLICY.ROLE.USER;
        return waitForBatchedUpdates().then(() => {
            let action = SearchUIUtils.getActions(searchResults.data, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, overlimitApproverAccountID).at(0);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);

            action = SearchUIUtils.getActions(searchResults.data, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, overlimitApproverAccountID).at(0);
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
                    cardID: undefined,
                    cardName: undefined,
                    category: 'Employee Meals Remote (Fringe Benefit)',
                    action: 'approve',
                    allActions: ['approve'],
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
                    convertedAmount: -5000,
                    convertedCurrency: 'USD',
                },
            },
            search: {
                type: 'expense',
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                offset: 0,
                hasMoreResults: false,
                hasResults: true,
                isLoading: false,
            },
        };
        return waitForBatchedUpdates().then(() => {
            const action = SearchUIUtils.getActions(result.data, allViolations, 'report_6523565988285061', CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminAccountID).at(0);
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

    describe('Test getSuggestedSearchesVisibility', () => {
        test('Should not show export if there are no valid connections', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    exporter: adminEmail,
                    approver: adminEmail,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                    role: CONST.POLICY.ROLE.ADMIN,
                    // Failed connection
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                            verified: false,
                            lastSync: {
                                errorDate: new Date().toISOString(),
                                errorMessage: 'Error',
                                isAuthenticationError: true,
                                isConnected: false,
                                isSuccessful: false,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as Connections,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined, {}, adminAccountID);
            expect(response.export).toBe(false);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            policies[policyKey]!.connections![CONST.POLICY.CONNECTIONS.NAME.NETSUITE].lastSync = {
                errorDate: '',
                errorMessage: '',
                isAuthenticationError: false,
                isConnected: true,
                isSuccessful: true,
                source: 'NEWEXPENSIFY',
                successfulDate: new Date().toISOString(),
            };

            const response2 = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined, {}, adminAccountID);
            expect(response2.export).toBe(true);
        });
    });

    describe('Test getColumnsToShow', () => {
        test('Should only show columns when at least one transaction has a value for them', () => {
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
            let columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, emptyTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.FROM]).toBe(false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TO]).toBe(false);

            // Test 2: Merchant column should show when at least one transaction has merchant
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, merchantTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Test 3: Category column should show when at least one transaction has category
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, categoryTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);

            // Test 4: Tag column should show when at least one transaction has tag
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, tagTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Test 5: Description column should show when at least one transaction has description
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, descriptionTransaction], false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(false);

            // Test 6: From/To columns should show when at least one transaction has different users
            // @ts-expect-error -- no need to construct all data again, the function below only needs the report and transactions
            const data: OnyxTypes.SearchResults['data'] = {
                [`report_${reportID2}`]: searchResults.data[`report_${reportID2}`],
                [`transactions_${emptyTransaction.transactionID}`]: emptyTransaction,
                [`transactions_${differentUsersTransaction.transactionID}`]: differentUsersTransaction,
            };
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, data, false);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.FROM]).toBe(true);
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TO]).toBe(true);

            // Test 7: Multiple columns should show when transactions have different fields
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [merchantTransaction, categoryTransaction, tagTransaction], false);
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
            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [testTransaction], true);

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

            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [testTransaction], false);

            // Should show merchant column because modifiedMerchant has value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT]).toBe(true);

            // Should not show category column because 'Uncategorized' is an empty value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY]).toBe(false);

            // Should not show tag column because it's the empty tag value
            expect(columns[CONST.SEARCH.TABLE_COLUMNS.TAG]).toBe(false);
        });
    });

    describe('createAndOpenSearchTransactionThread', () => {
        const threadReportID = 'thread-report-123';
        const threadReport = {reportID: threadReportID};
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
        const iouReportAction = {reportActionID: 'action-123'} as OnyxTypes.ReportAction;
        const hash = 12345;
        const backTo = '/search/all';

        test('Should create transaction thread report and navigate to it', () => {
            (createTransactionThreadReport as jest.Mock).mockReturnValue(threadReport);

            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, iouReportAction, hash, backTo);

            expect(createTransactionThreadReport).toHaveBeenCalledWith(report1, iouReportAction);
            expect(updateSearchResultsWithTransactionThreadReportID).toHaveBeenCalledWith(hash, transactionID, threadReportID);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo}));
        });

        test('Should not load iou report if iouReportAction was provided', () => {
            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, iouReportAction, hash, backTo);
            expect(openReport).not.toHaveBeenCalled();
        });

        test('Should load iou report if iouReportAction was not provided', () => {
            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, undefined, hash, backTo);
            expect(openReport).toHaveBeenCalled();
        });
    });
});
