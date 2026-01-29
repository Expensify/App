import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SelectedTransactionInfo} from '@components/Search/types';
import ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import ExpenseReportListItem from '@components/SelectionListWithSections/Search/ExpenseReportListItem';
import TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {
    ReportActionListItemType,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import Navigation from '@navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax
import type * as ReportUserActions from '@userActions/Report';
import {createTransactionThreadReport} from '@userActions/Report';
// eslint-disable-next-line no-restricted-syntax
import type * as SearchUtils from '@userActions/Search';
import {setOptimisticDataForTransactionThreadPreview} from '@userActions/Search';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {CardFeedForDisplay} from '@src/libs/CardFeedUtils';
import {getUserFriendlyValue} from '@src/libs/SearchQueryUtils';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import getOnyxValue from '../../utils/getOnyxValue';
import {formatPhoneNumber, localeCompare, translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
}));
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportUserActions>('@userActions/Report'),
    createTransactionThreadReport: jest.fn(),
}));
jest.mock('@userActions/Search', () => ({
    ...jest.requireActual<typeof SearchUtils>('@userActions/Search'),
    setOptimisticDataForTransactionThreadPreview: jest.fn(),
}));

const adminAccountID = 18439984;
const adminEmail = 'admin@policy.com';
const receiverAccountID = 18439985;
const receiverEmail = 'receiver@policy.com';

const emptyPersonalDetails = {
    accountID: 0,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

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
    transactionCount: 1,
} as const;

const report2 = {
    accountID: adminAccountID,
    action: 'view',
    chatReportID: '1706144653204915',
    created: '2024-12-21 13:05:20',
    submitted: '2024-12-21 13:05:20',
    approved: undefined,
    currency: 'USD',
    isOneTransactionReport: true,
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
    transactionCount: 1,
} as const;

const report3 = {
    accountID: adminAccountID,
    chatReportID: '6155022250251839',
    chatType: undefined,
    created: '2025-03-05 16:34:27',
    submitted: '2025-03-05',
    approved: undefined,
    currency: 'VND',
    isOneTransactionReport: false,
    isOwnPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    managerID: approverAccountID,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: adminAccountID,
    policyID,
    private_isArchived: '',
    reportID: reportID3,
    reportName: 'owes ₫44.00',
    stateNum: 1,
    statusNum: 1,
    total: 4400,
    type: 'iou',
    unheldTotal: 4400,
    transactionCount: 2,
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
    transactionCount: 0,
} as const;

const reportAction1: OnyxTypes.ReportAction = {
    accountID: adminAccountID,
    actorAccountID: adminAccountID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-12-21 13:05:21',
    message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    reportActionID: '11111111',
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: transactionID,
        IOUReportID: report1.reportID,
    },
    reportID: report1.reportID,
};

const reportAction2: OnyxTypes.ReportAction = {
    accountID: adminAccountID,
    actorAccountID: adminAccountID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-12-21 13:05:22',
    message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    reportActionID: '22222222',
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: transactionID2,
        IOUReportID: report2.reportID,
    },
    reportID: report2.reportID,
};

const reportAction3: OnyxTypes.ReportAction = {
    accountID: adminAccountID,
    actorAccountID: adminAccountID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-12-21 13:05:23',
    message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    reportActionID: '33333333',
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: transactionID3,
        IOUReportID: report3.reportID,
    },
    reportID: report3.reportID,
};

const reportAction4: OnyxTypes.ReportAction = {
    accountID: adminAccountID,
    actorAccountID: adminAccountID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-12-21 13:05:24',
    message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    reportActionID: '44444444',
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: transactionID4,
        IOUReportID: report3.reportID,
    },
    reportID: report3.reportID,
};

const policy = {
    id: 'Admin',
    name: 'Policy',
    outputCurrency: 'USD',
    isPolicyExpenseChatEnabled: true,
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
} as OnyxTypes.Policy;

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
        [`policy_${policyID}`]: policy,
        [`reportActions_${reportID}`]: {
            [reportAction1.reportActionID]: reportAction1,
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
            },
        },
        [`reportActions_${reportID2}`]: {
            [reportAction2.reportActionID]: reportAction2,
        },
        [`reportActions_${reportID3}`]: {
            [reportAction3.reportActionID]: reportAction3,
            [reportAction4.reportActionID]: reportAction4,
        },
        [`report_${reportID}`]: report1,
        [`report_${reportID2}`]: report2,
        [`report_${reportID3}`]: report3,
        [`report_${reportID4}`]: report4,
        [`report_${reportID5}`]: report5,
        [`transactions_${transactionID}`]: {
            amount: -5000,
            cardID: undefined,
            cardName: undefined,
            category: '',
            comment: {
                comment: '',
            },
            created: '2024-12-21',
            currency: 'USD',
            hasEReceipt: false,
            merchant: 'Expense',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: 'Expense',
            parentTransactionID: '',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            reportID,
            tag: '',
            transactionID,
            receipt: undefined,
            taxAmount: undefined,
            mccGroup: undefined,
            modifiedMCCGroup: undefined,
            errors: undefined,
            groupAmount: -5000,
            groupCurrency: 'USD',
        },
        [`transactions_${transactionID2}`]: {
            amount: -5000,
            cardID: undefined,
            cardName: undefined,
            category: '',
            comment: {
                comment: '',
            },
            created: '2024-12-21',
            currency: 'USD',
            hasEReceipt: false,
            merchant: 'Expense',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: 'Expense',
            parentTransactionID: '',
            reportID: reportID2,
            tag: '',
            transactionID: transactionID2,
            receipt: undefined,
            taxAmount: undefined,
            mccGroup: undefined,
            modifiedMCCGroup: undefined,
            pendingAction: undefined,
            errors: undefined,
            groupAmount: -5000,
            groupCurrency: 'USD',
        },
        ...allViolations,
        [`transactions_${transactionID3}`]: {
            amount: 1200,
            cardID: undefined,
            cardName: undefined,
            category: '',
            comment: {
                comment: '',
            },
            created: '2025-03-05',
            currency: 'VND',
            hasEReceipt: false,
            merchant: '(none)',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            reportID: reportID3,
            tag: '',
            transactionID: transactionID3,
            receipt: undefined,
            taxAmount: undefined,
            mccGroup: undefined,
            modifiedMCCGroup: undefined,
            pendingAction: undefined,
            errors: undefined,
            groupAmount: -5000,
            groupCurrency: 'USD',
        },
        [`transactions_${transactionID4}`]: {
            amount: 3200,
            cardID: undefined,
            cardName: undefined,
            category: '',
            comment: {
                comment: '',
            },
            created: '2025-03-05',
            currency: 'VND',
            hasEReceipt: false,
            merchant: '(none)',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            reportID: reportID3,
            tag: '',
            transactionID: transactionID4,
            receipt: undefined,
            taxAmount: undefined,
            mccGroup: undefined,
            modifiedMCCGroup: undefined,
            pendingAction: undefined,
            errors: undefined,
            groupAmount: -5000,
            groupCurrency: 'USD',
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
            state: 8,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${cardID2}` as const]: {
            entryID: entryID2,
            accountNumber: accountNumber2,
            bankName: CONST.BANK_NAMES.CITIBANK,
            debitPosted: '2025-08-19 18:10:54',
            count: 6,
            currency: 'USD',
            total: 20,
            state: 8,
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

const categoryName1 = 'Travel';
const categoryName2 = 'Food & Drink';

const searchResultsGroupByCategory: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}${categoryName1}` as const]: {
            category: categoryName1,
            count: 5,
            currency: 'USD',
            total: 250,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${categoryName2}` as const]: {
            category: categoryName2,
            count: 3,
            currency: 'USD',
            total: 75,
        },
    },
    search: {
        count: 8,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 325,
        isLoading: false,
        type: 'expense',
    },
};

const reportActionListItems = [
    {
        ...reportAction1,
        date: '2024-12-21 13:05:21',
        formattedFrom: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        keyForList: reportAction1.reportActionID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUReportID: report1.reportID,
            IOUTransactionID: transactionID,
        },
        reportName: report1.reportName,
        message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    },
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
        reportName: report1.reportName,
        reportID: '123456789',
    },
    {
        ...reportAction2,
        date: '2024-12-21 13:05:22',
        formattedFrom: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        keyForList: reportAction2.reportActionID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUReportID: report2.reportID,
            IOUTransactionID: transactionID2,
        },
        reportName: report2.reportName,
        message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    },
    {
        ...reportAction3,
        date: '2024-12-21 13:05:23',
        formattedFrom: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        keyForList: reportAction3.reportActionID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUReportID: report3.reportID,
            IOUTransactionID: transactionID3,
        },
        reportName: report3.reportName,
        message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    },
    {
        ...reportAction4,
        date: '2024-12-21 13:05:24',
        formattedFrom: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        keyForList: reportAction4.reportActionID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUReportID: report3.reportID,
            IOUTransactionID: transactionID4,
        },
        reportName: report3.reportName,
        message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    },
] as ReportActionListItemType[];

const transactionsListItems = [
    {
        action: 'submit',
        allActions: ['submit'],
        amount: -5000,
        report: report1,
        policy,
        reportAction: reportAction1,
        holdReportAction: undefined,
        cardID: undefined,
        cardName: undefined,
        category: '',
        comment: {comment: ''},
        created: '2024-12-21',
        submitted: undefined,
        approved: undefined,
        posted: '',
        exported: '',
        currency: 'USD',
        date: '2024-12-21',
        formattedFrom: 'Admin',
        formattedMerchant: '',
        formattedTo: '',
        formattedTotal: 5000,
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        hasEReceipt: false,
        keyForList: '1',
        merchant: 'Expense',
        modifiedAmount: '',
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        reportID: '123456789',
        shouldShowMerchant: false,
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        tag: '',
        to: emptyPersonalDetails,
        transactionID: '1',
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        errors: undefined,
        violations: [],
        groupAmount: -5000,
        groupCurrency: 'USD',
    },
    {
        action: 'approve',
        allActions: ['approve'],
        amount: -5000,
        report: report2,
        policy,
        reportAction: reportAction2,
        holdReportAction: undefined,
        cardID: undefined,
        cardName: undefined,
        category: '',
        comment: {comment: ''},
        created: '2024-12-21',
        submitted: '2024-12-21 13:05:20',
        approved: undefined,
        posted: '',
        exported: '',
        currency: 'USD',
        date: '2024-12-21',
        formattedFrom: 'Admin',
        formattedMerchant: '',
        formattedTo: 'Admin',
        formattedTotal: 5000,
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        hasEReceipt: false,
        keyForList: '2',
        merchant: 'Expense',
        modifiedAmount: '',
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: 'Expense',
        parentTransactionID: '',
        reportID: '11111',
        shouldShowMerchant: false,
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
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
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        pendingAction: undefined,
        errors: undefined,
        violations: [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ],
        groupAmount: -5000,
        groupCurrency: 'USD',
    },
    {
        amount: 1200,
        action: 'view',
        allActions: ['view'],
        report: report3,
        policy,
        reportAction: reportAction3,
        holdReportAction: undefined,
        cardID: undefined,
        cardName: undefined,
        category: '',
        comment: {comment: ''},
        created: '2025-03-05',
        submitted: '2025-03-05',
        approved: undefined,
        posted: '',
        exported: '',
        currency: 'VND',
        hasEReceipt: false,
        merchant: '(none)',
        modifiedAmount: '',
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        reportID: '99999',
        tag: '',
        transactionID: '3',
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
        shouldShowMerchant: false,
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        keyForList: '3',
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        pendingAction: undefined,
        errors: undefined,
        violations: [],
        groupAmount: -5000,
        groupCurrency: 'USD',
    },
    {
        amount: 3200,
        action: 'view',
        allActions: ['view'],
        report: report3,
        policy,
        reportAction: reportAction4,
        holdReportAction: undefined,
        cardID: undefined,
        cardName: undefined,
        category: '',
        comment: {comment: ''},
        created: '2025-03-05',
        submitted: '2025-03-05',
        approved: undefined,
        posted: '',
        exported: '',
        currency: 'VND',
        hasEReceipt: false,
        merchant: '(none)',
        modifiedAmount: '',
        modifiedCreated: '',
        modifiedCurrency: '',
        modifiedMerchant: '',
        parentTransactionID: '',
        reportID: '99999',
        tag: '',
        transactionID: '4',
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
        shouldShowMerchant: false,
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        keyForList: '4',
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        receipt: undefined,
        taxAmount: undefined,
        mccGroup: undefined,
        modifiedMCCGroup: undefined,
        pendingAction: undefined,
        errors: undefined,
        violations: [],
        groupAmount: -5000,
        groupCurrency: 'USD',
    },
] as TransactionListItemType[];

const transactionReportGroupListItems = [
    {
        groupedBy: 'expense-report',
        accountID: 18439984,
        action: 'submit',
        allActions: ['submit'],
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        currency: 'USD',
        formattedFrom: 'Admin',
        formattedStatus: 'Draft',
        formattedTo: '',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: 'admin@policy.com',
        },
        hasVisibleViolations: false,
        isOneTransactionReport: true,
        shouldShowStatusAsPending: false,
        isWaitingOnBankAccount: false,
        keyForList: '123456789',
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: '123456789',
        reportName: 'Expense Report #123',
        exported: '',
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearExported: false,
        stateNum: 0,
        statusNum: 0,
        to: emptyPersonalDetails,
        total: -5000,
        transactionCount: 1,
        transactions: [
            {
                action: 'submit',
                allActions: ['submit'],
                report: report1,
                policy,
                reportAction: reportAction1,
                holdReportAction: undefined,
                amount: -5000,
                cardID: undefined,
                cardName: undefined,
                category: '',
                comment: {comment: ''},
                created: '2024-12-21',
                currency: 'USD',
                date: '2024-12-21',
                exported: '',
                formattedFrom: 'Admin',
                formattedMerchant: '',
                formattedTo: '',
                formattedTotal: 5000,
                from: {
                    accountID: 18439984,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                hasEReceipt: false,
                keyForList: '1',
                merchant: 'Expense',
                modifiedAmount: '',
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: 'Expense',
                parentTransactionID: '',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                reportID: '123456789',
                shouldShowMerchant: false,
                shouldShowYear: true,
                shouldShowYearSubmitted: true,
                shouldShowYearApproved: false,
                shouldShowYearPosted: false,
                shouldShowYearExported: false,
                isAmountColumnWide: false,
                isTaxAmountColumnWide: false,
                tag: '',
                to: emptyPersonalDetails,
                transactionID: '1',
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                errors: undefined,
                violations: [],
                groupAmount: -5000,
                groupCurrency: 'USD',
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
        groupedBy: 'expense-report',
        accountID: 18439984,
        action: 'approve',
        allActions: ['approve'],
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        submitted: '2024-12-21 13:05:20',
        approved: undefined,
        exported: '',
        currency: 'USD',
        formattedFrom: 'Admin',
        formattedStatus: 'Outstanding',
        formattedTo: 'Admin',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        hasVisibleViolations: true,
        isOneTransactionReport: true,
        shouldShowStatusAsPending: false,
        isWaitingOnBankAccount: false,
        keyForList: '11111',
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: '11111',
        reportName: 'Expense Report #123',
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearExported: false,
        stateNum: 1,
        statusNum: 1,
        to: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        total: -5000,
        transactionCount: 1,
        transactions: [
            {
                action: 'approve',
                allActions: ['approve'],
                report: report2,
                policy,
                reportAction: reportAction2,
                holdReportAction: undefined,
                amount: -5000,
                cardID: undefined,
                cardName: undefined,
                category: '',
                comment: {comment: ''},
                created: '2024-12-21',
                exported: '',
                currency: 'USD',
                date: '2024-12-21',
                formattedFrom: 'Admin',
                formattedMerchant: '',
                formattedTo: 'Admin',
                formattedTotal: 5000,
                from: {
                    accountID: 18439984,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    displayName: 'Admin',
                    login: adminEmail,
                },
                hasEReceipt: false,
                violations: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
                keyForList: '2',
                merchant: 'Expense',
                modifiedAmount: '',
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: 'Expense',
                parentTransactionID: '',
                reportID: '11111',
                shouldShowMerchant: false,
                shouldShowYear: true,
                shouldShowYearSubmitted: true,
                shouldShowYearApproved: false,
                shouldShowYearPosted: false,
                shouldShowYearExported: false,
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
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                pendingAction: undefined,
                errors: undefined,
                groupAmount: -5000,
                groupCurrency: 'USD',
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
        groupedBy: 'expense-report',
        accountID: 18439984,
        chatReportID: '6155022250251839',
        chatType: undefined,
        created: '2025-03-05 16:34:27',
        submitted: '2025-03-05',
        approved: undefined,
        exported: '',
        currency: 'VND',
        formattedFrom: 'Admin',
        formattedStatus: 'Outstanding',
        formattedTo: 'Approver',
        hasVisibleViolations: false,
        isOneTransactionReport: false,
        shouldShowStatusAsPending: false,
        isOwnPolicyExpenseChat: false,
        isWaitingOnBankAccount: false,
        managerID: 1111111,
        nonReimbursableTotal: 0,
        oldPolicyName: '',
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        private_isArchived: '',
        reportID: '99999',
        reportName: 'Approver owes ₫44.00',
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearExported: false,
        stateNum: 1,
        statusNum: 1,
        total: 4400,
        transactionCount: 2,
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
        transactions: [
            {
                amount: 1200,
                action: 'view',
                allActions: ['view'],
                report: report3,
                policy,
                reportAction: reportAction3,
                holdReportAction: undefined,
                cardID: undefined,
                cardName: undefined,
                category: '',
                comment: {comment: ''},
                created: '2025-03-05',
                exported: '',
                currency: 'VND',
                hasEReceipt: false,
                merchant: '(none)',
                modifiedAmount: '',
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: '',
                parentTransactionID: '',
                reportID: '99999',
                tag: '',
                transactionID: '3',
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
                shouldShowMerchant: false,
                shouldShowYear: true,
                shouldShowYearSubmitted: true,
                shouldShowYearApproved: false,
                shouldShowYearPosted: false,
                shouldShowYearExported: false,
                keyForList: '3',
                isAmountColumnWide: false,
                isTaxAmountColumnWide: false,
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                pendingAction: undefined,
                errors: undefined,
                violations: [],
                groupAmount: -5000,
                groupCurrency: 'USD',
            },
            {
                amount: 3200,
                action: 'view',
                allActions: ['view'],
                report: report3,
                policy,
                reportAction: reportAction4,
                holdReportAction: undefined,
                cardID: undefined,
                cardName: undefined,
                category: '',
                comment: {comment: ''},
                created: '2025-03-05',
                exported: '',
                currency: 'VND',
                hasEReceipt: false,
                merchant: '(none)',
                modifiedAmount: '',
                modifiedCreated: '',
                modifiedCurrency: '',
                modifiedMerchant: '',
                parentTransactionID: '',
                reportID: '99999',
                tag: '',
                transactionID: '4',
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
                shouldShowMerchant: false,
                shouldShowYear: true,
                shouldShowYearSubmitted: true,
                shouldShowYearApproved: false,
                shouldShowYearPosted: false,
                shouldShowYearExported: false,
                keyForList: '4',
                isAmountColumnWide: false,
                isTaxAmountColumnWide: false,
                receipt: undefined,
                taxAmount: undefined,
                mccGroup: undefined,
                modifiedMCCGroup: undefined,
                pendingAction: undefined,
                errors: undefined,
                violations: [],
                groupAmount: -5000,
                groupCurrency: 'USD',
            },
        ],
    },
    {
        groupedBy: 'expense-report',
        accountID: 18439984,
        action: 'view',
        allActions: ['view'],
        chatReportID: '1706144653204915',
        created: '2024-12-21 13:05:20',
        exported: '',
        currency: 'USD',
        formattedFrom: 'Admin',
        formattedStatus: 'Draft',
        formattedTo: '',
        from: {
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: 'admin@policy.com',
        },
        hasVisibleViolations: false,
        isOneTransactionReport: true,
        shouldShowStatusAsPending: false,
        isWaitingOnBankAccount: false,
        keyForList: reportID5,
        managerID: 18439984,
        nonReimbursableTotal: 0,
        ownerAccountID: 18439984,
        policyID: 'A1B2C3',
        reportID: reportID5,
        reportName: 'Expense Report #123',
        shouldShowYear: true,
        shouldShowYearSubmitted: true,
        shouldShowYearApproved: false,
        shouldShowYearExported: false,
        stateNum: 0,
        statusNum: 0,
        to: emptyPersonalDetails,
        total: 0,
        transactionCount: 0,
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
        formattedFrom: 'Zara',
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
        formattedFrom: 'Andrew',
        groupedBy: 'from',
        login: 'approver@policy.com',
        total: 30,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionMemberGroupListItemsSorted: TransactionMemberGroupListItemType[] = [
    {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        count: 3,
        currency: 'USD',
        displayName: 'Zara',
        formattedFrom: 'Zara',
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
        formattedFrom: 'Andrew',
        groupedBy: 'from',
        login: 'approver@policy.com',
        total: 30,
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
        formattedCardName: ' - 1234',
        formattedFeedName: 'chase',
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
        formattedCardName: ' - 1234',
        formattedFeedName: 'americanexpress',
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
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        bank: CONST.BANK_NAMES.CHASE,
        cardID: 20202020,
        cardName: "Zara's card",
        count: 4,
        currency: 'USD',
        displayName: 'Zara',
        formattedCardName: ' - 1234',
        formattedFeedName: 'chase',
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
        formattedCardName: ' - 1234',
        formattedFeedName: 'americanexpress',
        groupedBy: 'card',
        lastFourPAN: '1234',
        login: 'approver@policy.com',
        total: 20,
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
        state: 8,
        groupedBy: 'withdrawal-id',
        formattedWithdrawalID: '5',
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
        state: 8,
        groupedBy: 'withdrawal-id',
        formattedWithdrawalID: '6',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionWithdrawalIDGroupListItemsSorted: TransactionWithdrawalIDGroupListItemType[] = [
    {
        bankName: CONST.BANK_NAMES.CHASE,
        entryID,
        accountNumber,
        debitPosted: '2025-08-12 17:11:22',
        count: 4,
        currency: 'USD',
        total: 40,
        state: 8,
        groupedBy: 'withdrawal-id',
        formattedWithdrawalID: '5',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        bankName: CONST.BANK_NAMES.CITIBANK,
        entryID: entryID2,
        accountNumber: accountNumber2,
        debitPosted: '2025-08-19 18:10:54',
        count: 6,
        state: 8,
        currency: 'USD',
        total: 20,
        groupedBy: 'withdrawal-id',
        formattedWithdrawalID: '6',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionCategoryGroupListItems: TransactionCategoryGroupListItemType[] = [
    {
        category: categoryName1,
        count: 5,
        currency: 'USD',
        total: 250,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: categoryName1,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        category: categoryName2,
        count: 3,
        currency: 'USD',
        total: 75,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: categoryName2,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionCategoryGroupListItemsSorted: TransactionCategoryGroupListItemType[] = [
    {
        category: categoryName1,
        count: 5,
        currency: 'USD',
        total: 250,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: categoryName1,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        category: categoryName2,
        count: 3,
        currency: 'USD',
        total: 75,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: categoryName2,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

// Merchant test data - backend uses hash-based keys (group_<numeric_hash>), not merchant names
const merchantName1 = 'Starbucks';
const merchantName2 = 'Whole Foods';
const merchantHash1 = '1234567890';
const merchantHash2 = '9876543210';

const searchResultsGroupByMerchant: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}${merchantHash1}` as const]: {
            merchant: merchantName1,
            count: 7,
            currency: 'USD',
            total: 350,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${merchantHash2}` as const]: {
            merchant: merchantName2,
            count: 4,
            currency: 'USD',
            total: 120,
        },
    },
    search: {
        count: 11,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 470,
        isLoading: false,
        type: 'expense',
    },
};

const transactionMerchantGroupListItems: TransactionMerchantGroupListItemType[] = [
    {
        merchant: merchantName1,
        count: 7,
        currency: 'USD',
        total: 350,
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        formattedMerchant: merchantName1,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        merchant: merchantName2,
        count: 4,
        currency: 'USD',
        total: 120,
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        formattedMerchant: merchantName2,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const tagName1 = 'Project A';
const tagName2 = 'Project B';

const searchResultsGroupByTag: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}${tagName1}` as const]: {
            tag: tagName1,
            count: 5,
            currency: 'USD',
            total: 250,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}${tagName2}` as const]: {
            tag: tagName2,
            count: 3,
            currency: 'USD',
            total: 75,
        },
    },
    search: {
        count: 8,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 325,
        isLoading: false,
        type: 'expense',
    },
};

const transactionTagGroupListItems: TransactionTagGroupListItemType[] = [
    {
        tag: tagName1,
        count: 5,
        currency: 'USD',
        total: 250,
        groupedBy: CONST.SEARCH.GROUP_BY.TAG,
        formattedTag: tagName1,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        tag: tagName2,
        count: 3,
        currency: 'USD',
        total: 75,
        groupedBy: CONST.SEARCH.GROUP_BY.TAG,
        formattedTag: tagName2,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const transactionMerchantGroupListItemsSorted: TransactionMerchantGroupListItemType[] = [
    {
        merchant: merchantName1,
        count: 7,
        currency: 'USD',
        total: 350,
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        formattedMerchant: merchantName1,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        merchant: merchantName2,
        count: 4,
        currency: 'USD',
        total: 120,
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        formattedMerchant: merchantName2,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const searchResultsGroupByWeek: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}2026-01-25` as const]: {
            week: '2026-01-25',
            count: 5,
            currency: 'USD',
            total: 250,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}2025-12-28` as const]: {
            week: '2025-12-28',
            count: 3,
            currency: 'USD',
            total: 75,
        },
    },
    search: {
        count: 8,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 325,
        isLoading: false,
        type: 'expense',
    },
};

// Note: formattedWeek uses DateUtils.getFormattedDateRangeForSearch which returns a date range format
// For week starting 2026-01-25 (Sunday), it would format as "Jan 25 - Jan 31, 2026" (if same year)
// or "Jan 25, 2026 - Feb 1, 2026" (if different year)
// We'll use a placeholder that matches the actual format
const transactionWeekGroupListItems: TransactionWeekGroupListItemType[] = [
    {
        week: '2026-01-25',
        count: 5,
        currency: 'USD',
        total: 250,
        groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
        formattedWeek: 'Jan 25 - Jan 31, 2026',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        week: '2025-12-28',
        count: 3,
        currency: 'USD',
        total: 75,
        groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
        formattedWeek: 'Dec 28, 2025 - Jan 3, 2026',
        transactions: [],
        transactionsQueryJSON: undefined,
    },
];

const searchResultsGroupByMonth: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {},
        [`${CONST.SEARCH.GROUP_PREFIX}2026_1` as const]: {
            year: 2026,
            month: 1,
            count: 5,
            currency: 'USD',
            total: 250,
        },
        [`${CONST.SEARCH.GROUP_PREFIX}2025_12` as const]: {
            year: 2025,
            month: 12,
            count: 3,
            currency: 'USD',
            total: 75,
        },
    },
    search: {
        count: 8,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        total: 325,
        isLoading: false,
        type: 'expense',
    },
};

const transactionMonthGroupListItems: TransactionMonthGroupListItemType[] = [
    {
        year: 2026,
        month: 1,
        count: 5,
        currency: 'USD',
        total: 250,
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        formattedMonth: 'January 2026',
        sortKey: 202601,
        transactions: [],
        transactionsQueryJSON: undefined,
    },
    {
        year: 2025,
        month: 12,
        count: 3,
        currency: 'USD',
        total: 75,
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        formattedMonth: 'December 2025',
        sortKey: 202512,
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
            const action = SearchUIUtils.getActions(searchResults.data, {}, 'invalid_key', CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', adminAccountID, {}, {}).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });

        test('Should return `Submit` action for transaction on policy with delayed submission and no violations', () => {
            let action = SearchUIUtils.getActions(searchResults.data, {}, `report_${reportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', adminAccountID, {}, {}).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.SUBMIT);

            action = SearchUIUtils.getActions(searchResults.data, {}, `transactions_${transactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', adminAccountID, {}, {}).at(0);
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
            expect(SearchUIUtils.getActions(localSearchResults, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0)).toStrictEqual(
                CONST.SEARCH.ACTION_TYPES.VIEW,
            );
            expect(
                SearchUIUtils.getActions(localSearchResults, allViolations, `transactions_${transactionID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0),
            ).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, paidReportID, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);
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

            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);

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

            const action = SearchUIUtils.getActions(localSearchResults, {}, `report_${closedReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);

            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.DONE);
        });

        test('Should return `View` action for non-money request reports', () => {
            const action = SearchUIUtils.getActions(searchResults.data, {}, `report_${reportID4}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);
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
            const action = SearchUIUtils.getActions(localSearchResults, {}, `transactions_${orphanedTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `View` action for a transaction in a multi-transaction report', () => {
            const multiTransactionReportID = 'report_multi';
            const multiTransactionID = 'transaction_multi';
            const localSearchResults = {
                ...searchResults.data,
                [`report_${multiTransactionReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    transactionCount: 2,
                },
                [`transactions_${multiTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: multiTransactionID,
                    reportID: multiTransactionReportID,
                },
            };
            const action = SearchUIUtils.getActions(localSearchResults, {}, `transactions_${multiTransactionID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', submitterAccountID, {}, {}).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
        test('Should return `Pay` action for an IOU report ready to be paid', async () => {
            Onyx.merge(ONYXKEYS.SESSION, {accountID: adminAccountID});
            await waitForBatchedUpdates();
            const iouReportKey = `report_${reportID3}`;
            const action = SearchUIUtils.getActions(searchResults.data, {}, iouReportKey, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', adminAccountID, {}, {}).at(0);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.PAY);
        });

        test('Should return EXPORT_TO_ACCOUNTING action when report is approved and policy has verified accounting integration', () => {
            const exportReportID = 'report_export';
            const localSearchResults = {
                ...searchResults.data,
                [`policy_${policyID}`]: {
                    ...searchResults.data[`policy_${policyID}`],
                    role: CONST.POLICY.ROLE.ADMIN,
                    exporter: adminEmail,
                    connections: {
                        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                            verified: true,
                            lastSync: {
                                errorDate: '',
                                errorMessage: '',
                                isAuthenticationError: false,
                                isConnected: true,
                                isSuccessful: true,
                                source: 'NEWEXPENSIFY',
                                successfulDate: '',
                            },
                        },
                    } as Connections,
                },
                [`report_${exportReportID}`]: {
                    ...searchResults.data[`report_${reportID2}`],
                    reportID: exportReportID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                },
            };

            const actions = SearchUIUtils.getActions(localSearchResults, {}, `report_${exportReportID}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, adminEmail, adminAccountID, {}, {});

            expect(actions).toContain(CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING);
        });

        test('Should return `Submit` action when report has DEW_SUBMIT_FAILED action and is still OPEN', async () => {
            const dewReportID = '999';
            const dewTransactionID = '9999';
            const dewReportActionID = '99999';

            const localSearchResults = {
                ...searchResults.data,
                [`policy_${policyID}`]: {
                    ...searchResults.data[`policy_${policyID}`],
                    role: CONST.POLICY.ROLE.USER,
                },
                [`report_${dewReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: dewReportID,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    type: CONST.REPORT.TYPE.EXPENSE,
                },
                [`transactions_${dewTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: dewTransactionID,
                    reportID: dewReportID,
                },
            };

            const dewReportActions = [
                {
                    reportActionID: dewReportActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    reportID: dewReportID,
                    created: '2025-01-01 00:00:00',
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                },
            ] as OnyxTypes.ReportAction[];

            const action = SearchUIUtils.getActions(
                localSearchResults,
                {},
                `transactions_${dewTransactionID}`,
                CONST.SEARCH.SEARCH_KEYS.EXPENSES,
                '',
                adminAccountID,
                {},
                {},
                dewReportActions,
            ).at(0);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.SUBMIT);
        });

        test('Should NOT return `View` action when report has DEW_SUBMIT_FAILED action but is not OPEN', async () => {
            const dewReportID = '888';
            const dewTransactionID = '8888';
            const dewReportActionID = '88888';

            const localSearchResults = {
                ...searchResults.data,
                [`report_${dewReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: dewReportID,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    type: CONST.REPORT.TYPE.EXPENSE,
                },
                [`transactions_${dewTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: dewTransactionID,
                    reportID: dewReportID,
                },
            };

            const dewReportActions = [
                {
                    reportActionID: dewReportActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    reportID: dewReportID,
                    created: '2025-01-01 00:00:00',
                    originalMessage: {
                        message: 'DEW submit failed',
                    },
                },
            ] as OnyxTypes.ReportAction[];

            const action = SearchUIUtils.getActions(
                localSearchResults,
                {},
                `transactions_${dewTransactionID}`,
                CONST.SEARCH.SEARCH_KEYS.EXPENSES,
                '',
                adminAccountID,
                {},
                {},
                dewReportActions,
            ).at(0);
            expect(action).not.toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });

        test('Should NOT return `View` action when report has pending SUBMITTED action on non-DEW policy', async () => {
            const nonDewReportID = '666';
            const nonDewTransactionID = '6666';
            const nonDewReportActionID = '66666';

            const localSearchResults = {
                ...searchResults.data,
                [`report_${nonDewReportID}`]: {
                    ...searchResults.data[`report_${reportID}`],
                    reportID: nonDewReportID,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    type: CONST.REPORT.TYPE.EXPENSE,
                },
                [`transactions_${nonDewTransactionID}`]: {
                    ...searchResults.data[`transactions_${transactionID}`],
                    transactionID: nonDewTransactionID,
                    reportID: nonDewReportID,
                },
            };

            const nonDewReportActions = [
                {
                    reportActionID: nonDewReportActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    reportID: nonDewReportID,
                    created: '2025-01-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    originalMessage: {
                        amount: 10000,
                        currency: 'USD',
                    },
                },
            ] as OnyxTypes.ReportAction[];

            const action = SearchUIUtils.getActions(
                localSearchResults,
                {},
                `transactions_${nonDewTransactionID}`,
                CONST.SEARCH.SEARCH_KEYS.EXPENSES,
                '',
                adminAccountID,
                {},
                {},
                nonDewReportActions,
            ).at(0);
            expect(action).not.toStrictEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
    });

    describe('Test getListItem', () => {
        it('should return ChatListItem when type is CHAT', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.EXPENSE.ALL)).toStrictEqual(ChatListItem);
        });

        it('should return TransactionListItem when groupBy is undefined', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, undefined)).toStrictEqual(TransactionListItem);
        });

        it('should return ExpenseReportListItem when type is EXPENSE-REPORT', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, CONST.SEARCH.STATUS.EXPENSE.ALL)).toStrictEqual(ExpenseReportListItem);
        });

        it('should return TransactionListItem when type is TRIP', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.EXPENSE.ALL)).toStrictEqual(TransactionListItem);
        });

        it('should return TransactionListItem when type is INVOICE', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.EXPENSE.ALL)).toStrictEqual(TransactionListItem);
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

        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is category', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.CATEGORY)).toStrictEqual(TransactionGroupListItem);
        });

        it('should return TransactionGroupListItem when type is EXPENSE and groupBy is merchant', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL, CONST.SEARCH.GROUP_BY.MERCHANT)).toStrictEqual(TransactionGroupListItem);
        });
    });

    describe('Test getSections', () => {
        it('should return getReportActionsSections result when type is CHAT', () => {
            const [filteredReportActions, allReportActionsLength] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.CHAT,
                data: searchResults.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                allReportMetadata: {},
            });
            expect(filteredReportActions).toStrictEqual(reportActionListItems);
            expect(allReportActionsLength).toBe(6);
        });

        it('should return getTransactionsSections result when groupBy is undefined', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResults.data,
                    currentAccountID: 20745,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    allReportMetadata: {},
                })[0],
            ).toEqual(transactionsListItems);
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
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    },
                },
            };

            const result = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: testSearchResults.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                allReportMetadata: {},
            })[0] as TransactionListItemType[];

            const distanceTransaction = result.find((item) => item.transactionID === distanceTransactionID);

            expect(distanceTransaction).toBeDefined();
            expect(distanceTransaction?.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE);

            const expectedPropertyCount = 53;
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
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    },
                },
            };

            const result = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                data: testSearchResults.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                allReportMetadata: {},
            })[0] as TransactionGroupListItemType[];

            const reportGroup = result.find((group) => group.transactions?.some((transaction) => transaction.transactionID === distanceTransactionID));

            const distanceTransaction = reportGroup?.transactions?.find((transaction) => transaction.transactionID === distanceTransactionID);

            expect(distanceTransaction).toBeDefined();
            expect(distanceTransaction?.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE);

            const expectedPropertyCount = 50;
            expect(Object.keys(distanceTransaction ?? {}).length).toBe(expectedPropertyCount);
        });

        it('should return getReportSections result when type is EXPENSE REPORT', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    data: searchResults.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionReportGroupListItems);
        });

        it('should handle data where transaction keys appear before report keys in getReportSections', () => {
            const testDataTransactionFirst = {
                // Transaction keys first
                [`transactions_${transactionID}`]: searchResults.data[`transactions_${transactionID}`],
                [`transactions_${transactionID2}`]: searchResults.data[`transactions_${transactionID2}`],
                // Report keys after transactions
                [`report_${reportID}`]: searchResults.data[`report_${reportID}`],
                [`report_${reportID2}`]: searchResults.data[`report_${reportID2}`],
                // Other required data
                [`reportActions_${reportID}`]: searchResults.data[`reportActions_${reportID}`],
                [`reportActions_${reportID2}`]: searchResults.data[`reportActions_${reportID2}`],
                personalDetailsList: searchResults.data.personalDetailsList,
                [`policy_${policyID}`]: searchResults.data[`policy_${policyID}`],
            };

            const testDataReportFirst = {
                // Report keys first
                [`report_${reportID}`]: searchResults.data[`report_${reportID}`],
                [`report_${reportID2}`]: searchResults.data[`report_${reportID2}`],
                // Transaction keys after reports
                [`transactions_${transactionID}`]: searchResults.data[`transactions_${transactionID}`],
                [`transactions_${transactionID2}`]: searchResults.data[`transactions_${transactionID2}`],
                // Other required data
                [`reportActions_${reportID}`]: searchResults.data[`reportActions_${reportID}`],
                [`reportActions_${reportID2}`]: searchResults.data[`reportActions_${reportID2}`],
                personalDetailsList: searchResults.data.personalDetailsList,
                [`policy_${policyID}`]: searchResults.data[`policy_${policyID}`],
            };

            const resultTransactionFirst = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                data: testDataTransactionFirst,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                allReportMetadata: {},
            })[0];
            const resultReportFirst = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                data: testDataReportFirst,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                allReportMetadata: {},
            })[0];

            expect(resultTransactionFirst).toBeDefined();
            expect(Array.isArray(resultTransactionFirst)).toBe(true);
            expect(resultReportFirst).toBeDefined();
            expect(Array.isArray(resultReportFirst)).toBe(true);

            expect(resultTransactionFirst).toEqual(resultReportFirst);

            expect(resultTransactionFirst.length).toBeGreaterThan(0);
        });

        it('should return getMemberSections result when type is EXPENSE and groupBy is from', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByFrom.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.FROM,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionMemberGroupListItems);
        });

        it('should return getCardSections result when type is EXPENSE and groupBy is card', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByCard.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.CARD,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionCardGroupListItems);
        });

        it('should return getWithdrawalIDSections result when type is EXPENSE and groupBy is withdrawal-id', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByWithdrawalID.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionWithdrawalIDGroupListItems);
        });

        it('should filter invalid withdrawal-id entries without accountNumber', () => {
            const staleCacheData: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}2074551` as const]: {
                    accountID: 2074551,
                    count: 1,
                    currency: 'USD',
                    total: 100,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: staleCacheData,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                allReportMetadata: {},
            }) as [TransactionWithdrawalIDGroupListItemType[], number];

            expect(result).toHaveLength(0);
        });

        it('should return getCategorySections result when type is EXPENSE and groupBy is category', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByCategory.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionCategoryGroupListItems);
        });

        it('should handle empty category values correctly', () => {
            const dataWithEmptyCategory: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}empty` as const]: {
                    category: '',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}none` as const]: {
                    category: CONST.SEARCH.CATEGORY_EMPTY_VALUE,
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEmptyCategory,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
            }) as [TransactionCategoryGroupListItemType[], number];

            expect(result).toHaveLength(2);
            expect(result.some((item) => item.category === '')).toBe(true);
            expect(result.some((item) => item.category === CONST.SEARCH.CATEGORY_EMPTY_VALUE)).toBe(true);
        });

        it('should return isTransactionCategoryGroupListItemType true for category group items', () => {
            const categoryItem: TransactionCategoryGroupListItemType = {
                category: 'Travel',
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                formattedCategory: 'Travel',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionCategoryGroupListItemType(categoryItem)).toBe(true);
        });

        it('should return getMonthSections result when type is EXPENSE and groupBy is month', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByMonth.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionMonthGroupListItems);
        });

        it('should format month names correctly', () => {
            const dataWithDifferentMonths: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}2026_1` as const]: {
                    year: 2026,
                    month: 1,
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}2026_6` as const]: {
                    year: 2026,
                    month: 6,
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithDifferentMonths,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                allReportMetadata: {},
            }) as [TransactionMonthGroupListItemType[], number];

            expect(result).toHaveLength(2);
            expect(result.some((item) => item.formattedMonth === 'January 2026')).toBe(true);
            expect(result.some((item) => item.formattedMonth === 'June 2026')).toBe(true);
        });

        it('should calculate sortKey correctly for month groups', () => {
            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: searchResultsGroupByMonth.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                allReportMetadata: {},
            }) as [TransactionMonthGroupListItemType[], number];

            expect(result).toHaveLength(2);
            expect(result.some((item) => item.sortKey === 202601)).toBe(true);
            expect(result.some((item) => item.sortKey === 202512)).toBe(true);
        });

        it('should return isTransactionMonthGroupListItemType true for month group items', () => {
            const monthItem: TransactionMonthGroupListItemType = {
                year: 2026,
                month: 1,
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
                formattedMonth: 'January 2026',
                sortKey: 202601,
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionMonthGroupListItemType(monthItem)).toBe(true);
        });

        it('should return isTransactionWeekGroupListItemType true for week group items', () => {
            const weekItem: TransactionWeekGroupListItemType = {
                week: '2026-01-25',
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
                formattedWeek: 'Jan 25 - Jan 31, 2026',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionWeekGroupListItemType(weekItem)).toBe(true);
        });

        it('should return getWeekSections result when type is EXPENSE and groupBy is week', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByWeek.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.WEEK,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionWeekGroupListItems);
        });

        it('should format week dates correctly', () => {
            const dataWithDifferentWeeks: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}2026-01-25` as const]: {
                    week: '2026-01-25',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}2026-06-15` as const]: {
                    week: '2026-06-15',
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithDifferentWeeks,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.WEEK,
                allReportMetadata: {},
            }) as [TransactionWeekGroupListItemType[], number];

            expect(result).toHaveLength(2);
            // Check that formatted week contains the start date
            expect(result.some((item) => item.formattedWeek.includes('Jan 25'))).toBe(true);
            expect(result.some((item) => item.formattedWeek.includes('Jun 15'))).toBe(true);
        });

        it('should return isTransactionCategoryGroupListItemType false for non-category group items', () => {
            const memberItem: TransactionMemberGroupListItemType = {
                accountID: 123,
                avatar: '',
                count: 3,
                currency: 'USD',
                displayName: 'Test User',
                formattedFrom: 'Test User',
                groupedBy: 'from',
                login: 'test@test.com',
                total: 100,
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionCategoryGroupListItemType(memberItem)).toBe(false);
        });

        it('should generate transactionsQueryJSON with valid hash for category sections', () => {
            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: searchResultsGroupByCategory.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:category',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionCategoryGroupListItemType[], number];

            // Each category section should have a transactionsQueryJSON with a hash
            for (const item of result) {
                expect(item.transactionsQueryJSON).toBeDefined();
                expect(item.transactionsQueryJSON?.hash).toBeDefined();
                expect(typeof item.transactionsQueryJSON?.hash).toBe('number');
            }
        });

        it('should handle Unicode characters in category names', () => {
            const dataWithUnicode: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}japanese` as const]: {
                    category: '日本旅行',
                    count: 3,
                    currency: 'JPY',
                    total: 50000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}chinese` as const]: {
                    category: '办公用品',
                    count: 2,
                    currency: 'CNY',
                    total: 1000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}emoji` as const]: {
                    category: 'Travel ✈️',
                    count: 1,
                    currency: 'USD',
                    total: 500,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithUnicode,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
            }) as [TransactionCategoryGroupListItemType[], number];

            expect(result).toHaveLength(3);
            expect(result.some((item) => item.category === '日本旅行')).toBe(true);
            expect(result.some((item) => item.category === '办公用品')).toBe(true);
            expect(result.some((item) => item.category === 'Travel ✈️')).toBe(true);
        });

        it('should handle special characters in category names', () => {
            const dataWithSpecialChars: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}rd` as const]: {
                    category: 'R&D/Training',
                    count: 5,
                    currency: 'USD',
                    total: 2500,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}parentheses` as const]: {
                    category: 'Travel (Old)',
                    count: 2,
                    currency: 'USD',
                    total: 1000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}quotes` as const]: {
                    category: "Client's Expenses",
                    count: 1,
                    currency: 'USD',
                    total: 300,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithSpecialChars,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
            }) as [TransactionCategoryGroupListItemType[], number];

            expect(result).toHaveLength(3);
            expect(result.some((item) => item.category === 'R&D/Training')).toBe(true);
            expect(result.some((item) => item.category === 'Travel (Old)')).toBe(true);
            expect(result.some((item) => item.category === "Client's Expenses")).toBe(true);
        });

        it('should handle very long category names', () => {
            const longCategoryName = 'A'.repeat(150); // 150 character category name
            const dataWithLongNames: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}long` as const]: {
                    category: longCategoryName,
                    count: 1,
                    currency: 'USD',
                    total: 100,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithLongNames,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
            }) as [TransactionCategoryGroupListItemType[], number];

            expect(result).toHaveLength(1);
            expect(result.at(0)?.category).toBe(longCategoryName);
            expect(result.at(0)?.formattedCategory).toBe(longCategoryName);
            expect(result.at(0)?.category.length).toBe(150);
        });

        it('should decode HTML entities in category names via formattedCategory', () => {
            const dataWithHtmlEntities: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}ampersand` as const]: {
                    category: 'Travel &amp; Entertainment',
                    count: 3,
                    currency: 'USD',
                    total: 1500,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}quotes` as const]: {
                    category: '&quot;Special&quot; Category',
                    count: 2,
                    currency: 'USD',
                    total: 500,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithHtmlEntities,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                allReportMetadata: {},
            }) as [TransactionCategoryGroupListItemType[], number];

            expect(result).toHaveLength(2);
            // formattedCategory should have decoded HTML entities
            const ampersandItem = result.find((item) => item.category === 'Travel &amp; Entertainment');
            expect(ampersandItem?.formattedCategory).toBe('Travel & Entertainment');

            const quotesItem = result.find((item) => item.category === '&quot;Special&quot; Category');
            expect(quotesItem?.formattedCategory).toBe('"Special" Category');
        });

        // Merchant groupBy tests
        it('should return getMerchantSections result when type is EXPENSE and groupBy is merchant', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByMerchant.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionMerchantGroupListItems);
        });

        it('should handle empty merchant values correctly', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithEmptyMerchant: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}111111111` as const]: {
                    merchant: '',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}222222222` as const]: {
                    merchant: 'Starbucks',
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEmptyMerchant,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(2);
            expect(result.some((item) => item.merchant === '')).toBe(true);
            expect(result.some((item) => item.merchant === 'Starbucks')).toBe(true);
        });

        it('should normalize empty merchant to MERCHANT_EMPTY_VALUE in transactionsQueryJSON', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithEmptyMerchant: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}333333333` as const]: {
                    merchant: '',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEmptyMerchant,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:merchant',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(1);
            const emptyMerchantItem = result.find((item) => item.merchant === '');
            expect(emptyMerchantItem?.transactionsQueryJSON).toBeDefined();
            // The query should use 'none' (MERCHANT_EMPTY_VALUE) instead of empty string
            expect(emptyMerchantItem?.transactionsQueryJSON?.inputQuery).toContain(CONST.SEARCH.MERCHANT_EMPTY_VALUE);
        });

        it('should treat DEFAULT_MERCHANT "Expense" as empty merchant and display "No merchant"', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithDefaultMerchant: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}444444444` as const]: {
                    merchant: CONST.TRANSACTION.DEFAULT_MERCHANT, // 'Expense'
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithDefaultMerchant,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:merchant',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(1);
            // The merchant field keeps the original value for query purposes
            expect(result.at(0)?.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
            // But formattedMerchant should be "No merchant" for display
            expect(result.at(0)?.formattedMerchant).toBe('No merchant');
        });

        it('should treat PARTIAL_TRANSACTION_MERCHANT "(none)" as empty merchant and display "No merchant"', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithPartialMerchant: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}555555550` as const]: {
                    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, // '(none)'
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithPartialMerchant,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:merchant',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(1);
            // The merchant field keeps the original value for query purposes
            expect(result.at(0)?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
            // But formattedMerchant should be "No merchant" for display
            expect(result.at(0)?.formattedMerchant).toBe('No merchant');
        });

        it('should treat UNKNOWN_MERCHANT "Unknown Merchant" as empty merchant and display "No merchant"', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithUnknownMerchant: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}666666660` as const]: {
                    merchant: CONST.TRANSACTION.UNKNOWN_MERCHANT, // 'Unknown Merchant'
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithUnknownMerchant,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:merchant',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(1);
            // The merchant field keeps the original value for query purposes
            expect(result.at(0)?.merchant).toBe(CONST.TRANSACTION.UNKNOWN_MERCHANT);
            // But formattedMerchant should be "No merchant" for display
            expect(result.at(0)?.formattedMerchant).toBe('No merchant');
        });

        it('should return isTransactionMerchantGroupListItemType true for merchant group items', () => {
            const merchantItem: TransactionMerchantGroupListItemType = {
                merchant: 'Starbucks',
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                formattedMerchant: 'Starbucks',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionMerchantGroupListItemType(merchantItem)).toBe(true);
        });

        it('should return isTransactionMerchantGroupListItemType false for non-merchant group items', () => {
            const categoryItem: TransactionCategoryGroupListItemType = {
                category: 'Travel',
                count: 3,
                currency: 'USD',
                total: 100,
                groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                formattedCategory: 'Travel',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionMerchantGroupListItemType(categoryItem)).toBe(false);
        });

        it('should generate transactionsQueryJSON with valid hash for merchant sections', () => {
            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: searchResultsGroupByMerchant.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:merchant',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionMerchantGroupListItemType[], number];

            // Each merchant section should have a transactionsQueryJSON with a hash
            for (const item of result) {
                expect(item.transactionsQueryJSON).toBeDefined();
                expect(item.transactionsQueryJSON?.hash).toBeDefined();
                expect(typeof item.transactionsQueryJSON?.hash).toBe('number');
            }
        });

        it('should handle Unicode characters in merchant names', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithUnicode: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}555555555` as const]: {
                    merchant: 'カフェ東京',
                    count: 3,
                    currency: 'JPY',
                    total: 50000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}666666666` as const]: {
                    merchant: '北京饭店',
                    count: 2,
                    currency: 'CNY',
                    total: 1000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}777777777` as const]: {
                    merchant: 'Coffee ☕',
                    count: 1,
                    currency: 'USD',
                    total: 500,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithUnicode,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(3);
            expect(result.some((item) => item.merchant === 'カフェ東京')).toBe(true);
            expect(result.some((item) => item.merchant === '北京饭店')).toBe(true);
            expect(result.some((item) => item.merchant === 'Coffee ☕')).toBe(true);
        });

        it('should handle special characters in merchant names', () => {
            // Backend uses hash-based keys (group_<numeric_hash>), not merchant names
            const dataWithSpecialChars: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}888888888` as const]: {
                    merchant: "McDonald's & Co.",
                    count: 5,
                    currency: 'USD',
                    total: 2500,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}999999999` as const]: {
                    merchant: 'Walmart (Express)',
                    count: 2,
                    currency: 'USD',
                    total: 1000,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}101010101` as const]: {
                    merchant: '"Best" Coffee',
                    count: 1,
                    currency: 'USD',
                    total: 300,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithSpecialChars,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                allReportMetadata: {},
            }) as [TransactionMerchantGroupListItemType[], number];

            expect(result).toHaveLength(3);
            expect(result.some((item) => item.merchant === "McDonald's & Co.")).toBe(true);
            expect(result.some((item) => item.merchant === 'Walmart (Express)')).toBe(true);
            expect(result.some((item) => item.merchant === '"Best" Coffee')).toBe(true);
        });

        // Tag groupBy tests
        it('should return getTagSections result when type is EXPENSE and groupBy is tag', () => {
            expect(
                SearchUIUtils.getSections({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    data: searchResultsGroupByTag.data,
                    currentAccountID: 2074551,
                    currentUserEmail: '',
                    translate: translateLocal,
                    formatPhoneNumber,
                    bankAccountList: {},
                    groupBy: CONST.SEARCH.GROUP_BY.TAG,
                    allReportMetadata: {},
                })[0],
            ).toStrictEqual(transactionTagGroupListItems);
        });

        it('should unescape colons in tag names when grouping by tag', () => {
            // Backend sends tags with escaped colons (e.g., 'Parent\: Child')
            const escapedTagName = 'Parent\\: Child';
            const dataWithEscapedTag: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}${escapedTagName}` as const]: {
                    tag: escapedTagName,
                    count: 1,
                    currency: 'USD',
                    total: 100,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEscapedTag,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                allReportMetadata: {},
            }) as [TransactionTagGroupListItemType[], number];

            // formattedTag should have unescaped colons for display
            expect(result.at(0)?.formattedTag).toBe('Parent: Child');
            // Original tag property should remain unchanged
            expect(result.at(0)?.tag).toBe(escapedTagName);
        });

        it('should handle empty tag values correctly', () => {
            const dataWithEmptyTag: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}empty` as const]: {
                    tag: '',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}none` as const]: {
                    tag: CONST.SEARCH.TAG_EMPTY_VALUE,
                    count: 1,
                    currency: 'USD',
                    total: 25,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEmptyTag,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                allReportMetadata: {},
            }) as [TransactionTagGroupListItemType[], number];

            expect(result).toHaveLength(2);
            expect(result.some((item) => item.tag === '')).toBe(true);
            expect(result.some((item) => item.tag === CONST.SEARCH.TAG_EMPTY_VALUE)).toBe(true);
        });

        it('should handle "(untagged)" value from backend', () => {
            const dataWithUntagged: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}untagged` as const]: {
                    tag: '(untagged)',
                    count: 3,
                    currency: 'USD',
                    total: 100,
                },
            };

            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithUntagged,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                allReportMetadata: {},
            }) as [TransactionTagGroupListItemType[], number];

            expect(result).toHaveLength(1);
            expect(result.at(0)?.tag).toBe('(untagged)');
        });

        it('should return isTransactionTagGroupListItemType true for tag group items', () => {
            const tagItem: TransactionTagGroupListItemType = {
                tag: 'Project A',
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.TAG,
                formattedTag: 'Project A',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionTagGroupListItemType(tagItem)).toBe(true);
        });

        it('should return isTransactionTagGroupListItemType false for non-tag group items', () => {
            const categoryItem: TransactionCategoryGroupListItemType = {
                category: 'Travel',
                count: 5,
                currency: 'USD',
                total: 250,
                groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                formattedCategory: 'Travel',
                transactions: [],
                transactionsQueryJSON: undefined,
            };

            expect(SearchUIUtils.isTransactionTagGroupListItemType(categoryItem)).toBe(false);
        });

        it('should generate transactionsQueryJSON with valid hash for tag sections', () => {
            const [result] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: searchResultsGroupByTag.data,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                allReportMetadata: {},
                queryJSON: {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    status: '',
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                    view: CONST.SEARCH.VIEW.TABLE,
                    hash: 12345,
                    flatFilters: [],
                    inputQuery: 'type:expense groupBy:tag',
                    recentSearchHash: 12345,
                    similarSearchHash: 12345,
                    filters: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
                        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    },
                },
            }) as [TransactionTagGroupListItemType[], number];

            // Each tag section should have a transactionsQueryJSON with a hash
            for (const item of result) {
                expect(item.transactionsQueryJSON).toBeDefined();
                expect(item.transactionsQueryJSON?.hash).toBeDefined();
                expect(typeof item.transactionsQueryJSON?.hash).toBe('number');
            }
        });
    });

    describe('Test getSortedSections', () => {
        it('should return getSortedReportActionData result when type is CHAT', () => {
            const sortedActions = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.CHAT,
                CONST.SEARCH.STATUS.EXPENSE.ALL,
                reportActionListItems,
                localeCompare,
                translateLocal,
            ) as ReportActionListItemType[];
            // Should return all report actions sorted by creation date in descending order (newest first)
            expect(sortedActions).toHaveLength(5);
            expect(sortedActions.at(0)?.created).toBe('2024-12-21 13:05:24'); // reportAction4 (newest)
            expect(sortedActions.at(4)?.created).toBe('2024-12-21 13:05:20'); // ADDCOMMENT action (oldest)
        });

        it('should return getSortedTransactionData result when groupBy is undefined', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionsListItems, localeCompare, translateLocal, 'date', 'asc', undefined)).toStrictEqual(
                transactionsListItems,
            );
        });

        it('should return getSortedReportData result when type is expense-report', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, '', transactionReportGroupListItems, localeCompare, translateLocal, 'date', 'asc')).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getSortedReportData result when type is TRIP and groupBy is report', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.TRIP, '', transactionReportGroupListItems, localeCompare, translateLocal, 'date', 'asc')).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getSortedReportData result when type is INVOICE and groupBy is report', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.INVOICE, '', transactionReportGroupListItems, localeCompare, translateLocal, 'date', 'asc')).toStrictEqual(
                transactionReportGroupListItems,
            );
        });

        it('should return getSortedMemberData result when type is EXPENSE and groupBy is member', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionMemberGroupListItems,
                    localeCompare,
                    translateLocal,
                    'date',
                    'asc',
                    CONST.SEARCH.GROUP_BY.FROM,
                ),
            ).toStrictEqual(transactionMemberGroupListItemsSorted);
        });

        it('should return getSortedCardData result when type is EXPENSE and groupBy is card', () => {
            expect(
                SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, '', transactionCardGroupListItems, localeCompare, translateLocal, 'date', 'asc', CONST.SEARCH.GROUP_BY.CARD),
            ).toStrictEqual(transactionCardGroupListItemsSorted);
        });

        it('should return getSortedWithdrawalIDData result when type is EXPENSE and groupBy is withdrawal-id', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionWithdrawalIDGroupListItems,
                    localeCompare,
                    translateLocal,
                    'date',
                    'asc',
                    CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                ),
            ).toStrictEqual(transactionWithdrawalIDGroupListItemsSorted);
        });

        it('should return getSortedCategoryData result when type is EXPENSE and groupBy is category', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionCategoryGroupListItems,
                    localeCompare,
                    translateLocal,
                    CONST.SEARCH.TABLE_COLUMNS.DATE,
                    CONST.SEARCH.SORT_ORDER.ASC,
                    CONST.SEARCH.GROUP_BY.CATEGORY,
                ),
            ).toStrictEqual(transactionCategoryGroupListItemsSorted);
        });

        it('should sort category data by category name in ascending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionCategoryGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.CATEGORY,
            ) as TransactionCategoryGroupListItemType[];

            // "Food & Drink" should come before "Travel" in ascending alphabetical order
            expect(result.at(0)?.category).toBe(categoryName2); // Food & Drink
            expect(result.at(1)?.category).toBe(categoryName1); // Travel
        });

        it('should sort category data by category name in descending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionCategoryGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.CATEGORY,
            ) as TransactionCategoryGroupListItemType[];

            // "Travel" should come before "Food & Drink" in descending alphabetical order
            expect(result.at(0)?.category).toBe(categoryName1); // Travel
            expect(result.at(1)?.category).toBe(categoryName2); // Food & Drink
        });

        it('should sort category data by total amount', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionCategoryGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.CATEGORY,
            ) as TransactionCategoryGroupListItemType[];

            // Travel (250) should come before Food & Drink (75) when sorted by total descending
            expect(result.at(0)?.total).toBe(250);
            expect(result.at(1)?.total).toBe(75);
        });

        it('should sort category data using non-group column name (parser default sortBy)', () => {
            // The parser sets default sortBy to 'category' (not 'groupCategory') when groupBy is category
            // This test verifies that the sorting works with the parser's default value
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionCategoryGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.CATEGORY, // Parser default: 'category' not 'groupCategory'
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.CATEGORY,
            ) as TransactionCategoryGroupListItemType[];

            // "Food & Drink" should come before "Travel" in ascending alphabetical order
            expect(result.at(0)?.category).toBe(categoryName2); // Food & Drink
            expect(result.at(1)?.category).toBe(categoryName1); // Travel
        });

        it('should sort category data by expenses count', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionCategoryGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.CATEGORY,
            ) as TransactionCategoryGroupListItemType[];

            // Travel (5 expenses) should come before Food & Drink (3 expenses) when sorted by count descending
            expect(result.at(0)?.count).toBe(5);
            expect(result.at(1)?.count).toBe(3);
        });

        // Merchant sorting tests
        it('should return getSortedMerchantData result when type is EXPENSE and groupBy is merchant', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionMerchantGroupListItems,
                    localeCompare,
                    translateLocal,
                    CONST.SEARCH.TABLE_COLUMNS.DATE,
                    CONST.SEARCH.SORT_ORDER.ASC,
                    CONST.SEARCH.GROUP_BY.MERCHANT,
                ),
            ).toStrictEqual(transactionMerchantGroupListItemsSorted);
        });

        it('should sort merchant data by merchant name in ascending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionMerchantGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // "Starbucks" should come before "Whole Foods" in ascending alphabetical order
            expect(result.at(0)?.merchant).toBe(merchantName1); // Starbucks
            expect(result.at(1)?.merchant).toBe(merchantName2); // Whole Foods
        });

        it('should sort merchant data by merchant name in descending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionMerchantGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // "Whole Foods" should come before "Starbucks" in descending alphabetical order
            expect(result.at(0)?.merchant).toBe(merchantName2); // Whole Foods
            expect(result.at(1)?.merchant).toBe(merchantName1); // Starbucks
        });

        it('should sort merchant data by total amount', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionMerchantGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // Starbucks (350) should come before Whole Foods (120) when sorted by total descending
            expect(result.at(0)?.total).toBe(350);
            expect(result.at(1)?.total).toBe(120);
        });

        it('should sort merchant data using non-group column name (parser default sortBy)', () => {
            // The parser sets default sortBy to 'merchant' (not 'groupMerchant') when groupBy is merchant
            // This test verifies that the sorting works with the parser's default value
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionMerchantGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT, // Parser default: 'merchant' not 'groupMerchant'
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // "Starbucks" should come before "Whole Foods" in ascending alphabetical order
            expect(result.at(0)?.merchant).toBe(merchantName1); // Starbucks
            expect(result.at(1)?.merchant).toBe(merchantName2); // Whole Foods
        });

        it('should sort merchant data by expenses count', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionMerchantGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // Starbucks (7 expenses) should come before Whole Foods (4 expenses) when sorted by count descending
            expect(result.at(0)?.count).toBe(7);
            expect(result.at(1)?.count).toBe(4);
        });

        it('should sort "No merchant" alphabetically like other merchant names', () => {
            // "No merchant" should sort alphabetically, not at the bottom
            const merchantDataWithEmpty: TransactionMerchantGroupListItemType[] = [
                {
                    merchant: '',
                    count: 2,
                    currency: 'USD',
                    total: 50,
                    groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                    formattedMerchant: 'No merchant', // Translated by getMerchantSections
                    transactions: [],
                    transactionsQueryJSON: undefined,
                },
                {
                    merchant: 'Apple Store',
                    count: 3,
                    currency: 'USD',
                    total: 100,
                    groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                    formattedMerchant: 'Apple Store',
                    transactions: [],
                    transactionsQueryJSON: undefined,
                },
                {
                    merchant: 'Zebra Coffee',
                    count: 1,
                    currency: 'USD',
                    total: 25,
                    groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                    formattedMerchant: 'Zebra Coffee',
                    transactions: [],
                    transactionsQueryJSON: undefined,
                },
            ];

            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                merchantDataWithEmpty,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.MERCHANT,
            ) as TransactionMerchantGroupListItemType[];

            // Should sort alphabetically: "Apple Store", "No merchant", "Zebra Coffee"
            expect(result.at(0)?.formattedMerchant).toBe('Apple Store');
            expect(result.at(1)?.formattedMerchant).toBe('No merchant');
            expect(result.at(2)?.formattedMerchant).toBe('Zebra Coffee');
        });

        // Tag sorting tests
        it('should return getSortedTagData result when type is EXPENSE and groupBy is tag', () => {
            expect(
                SearchUIUtils.getSortedSections(
                    CONST.SEARCH.DATA_TYPES.EXPENSE,
                    '',
                    transactionTagGroupListItems,
                    localeCompare,
                    translateLocal,
                    CONST.SEARCH.TABLE_COLUMNS.DATE,
                    CONST.SEARCH.SORT_ORDER.ASC,
                    CONST.SEARCH.GROUP_BY.TAG,
                ),
            ).toStrictEqual(transactionTagGroupListItems);
        });

        it('should sort tag data by tag name in ascending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionTagGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG,
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.TAG,
            ) as TransactionTagGroupListItemType[];

            // "Project A" should come before "Project B" in ascending alphabetical order
            expect(result.at(0)?.tag).toBe(tagName1);
            expect(result.at(1)?.tag).toBe(tagName2);
        });

        it('should sort tag data by tag name in descending order', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionTagGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.TAG,
            ) as TransactionTagGroupListItemType[];

            // "Project B" should come before "Project A" in descending alphabetical order
            expect(result.at(0)?.tag).toBe(tagName2);
            expect(result.at(1)?.tag).toBe(tagName1);
        });

        it('should sort tag data by total amount', () => {
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                transactionTagGroupListItems,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.SORT_ORDER.DESC,
                CONST.SEARCH.GROUP_BY.TAG,
            ) as TransactionTagGroupListItemType[];

            // Project A (250) should come before Project B (75) when sorted by total descending
            expect(result.at(0)?.total).toBe(250);
            expect(result.at(1)?.total).toBe(75);
        });

        it('should sort "No tag" alphabetically with other tags (not at the top)', () => {
            // Create raw search results data WITHOUT formattedTag -
            // this is what comes from the backend. getSections will call getTagSections
            // which populates formattedTag with the translated "No tag" text for empty tags.
            const dataWithEmptyTag: OnyxTypes.SearchResults['data'] = {
                personalDetailsList: {},
                [`${CONST.SEARCH.GROUP_PREFIX}123456` as const]: {
                    tag: 'Zulu',
                    count: 2,
                    currency: 'USD',
                    total: 100,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}789012` as const]: {
                    // Empty tag - should become "No tag" in formattedTag
                    tag: '',
                    count: 1,
                    currency: 'USD',
                    total: 50,
                },
                [`${CONST.SEARCH.GROUP_PREFIX}345678` as const]: {
                    tag: 'Alpha',
                    count: 3,
                    currency: 'USD',
                    total: 150,
                },
            };

            // First, call getSections to process raw data through getTagSections.
            // This is where formattedTag gets populated
            const [sections] = SearchUIUtils.getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: dataWithEmptyTag,
                currentAccountID: 2074551,
                currentUserEmail: '',
                translate: translateLocal,
                formatPhoneNumber,
                bankAccountList: {},
                groupBy: CONST.SEARCH.GROUP_BY.TAG,
                allReportMetadata: {},
            }) as [TransactionTagGroupListItemType[], number];

            // Then sort the sections
            const result = SearchUIUtils.getSortedSections(
                CONST.SEARCH.DATA_TYPES.EXPENSE,
                '',
                sections,
                localeCompare,
                translateLocal,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG,
                CONST.SEARCH.SORT_ORDER.ASC,
                CONST.SEARCH.GROUP_BY.TAG,
            ) as TransactionTagGroupListItemType[];

            const emptyTagDisplayText = translateLocal('search.noTag');

            // In ascending alphabetical order: Alpha < No tag < Zulu
            // "No tag" should NOT be at the top (that was the bug with empty string sorting)
            expect(result.at(0)?.formattedTag).toBe('Alpha');
            expect(result.at(1)?.formattedTag).toBe(emptyTagDisplayText);
            expect(result.at(2)?.formattedTag).toBe('Zulu');
        });
    });

    describe('Test createTypeMenuItems', () => {
        const reportCounts = {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        };

        it('should return the default menu items', () => {
            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const menuItems = SearchUIUtils.createTypeMenuSections(icons.current, undefined, undefined, {}, undefined, {}, {}, false, undefined, false, {}, reportCounts)
                .map((section) => section.menuItems)
                .flat();

            expect(menuItems).toHaveLength(3);
            expect(menuItems).toStrictEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        translationPath: 'common.expenses',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                        icon: 'Receipt',
                    }),
                    expect.objectContaining({
                        translationPath: 'common.reports',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                        icon: icons.current.Document,
                    }),
                    expect.objectContaining({
                        translationPath: 'common.chats',
                        type: CONST.SEARCH.DATA_TYPES.CHAT,
                        icon: 'ChatBubbles',
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                mockCardFeedsByPolicy,
                undefined,
                mockPolicies,
                mockSavedSearches,
                false,
                undefined,
                false,
                {},
                reportCounts,
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                mockCardFeedsByPolicy,
                undefined,
                mockPolicies,
                mockSavedSearches,
                false,
                undefined,
                false,
                {},
                reportCounts,
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(icons.current, adminEmail, adminAccountID, {}, undefined, {}, mockSavedSearches, false, undefined, false, {}, reportCounts);

            const savedSection = sections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle');
            expect(savedSection).toBeDefined();
        });

        it('should not show saved section when there are no saved searches', () => {
            const mockSavedSearches = {};

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(icons.current, adminEmail, adminAccountID, {}, undefined, {}, mockSavedSearches, false, undefined, false, {}, reportCounts);

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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                {},
                undefined,
                {},
                mockSavedSearches,
                false, // not offline
                undefined,
                false,
                {},
                reportCounts,
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                {},
                undefined,
                {},
                mockSavedSearches,
                true, // offline
                undefined,
                false,
                {},
                reportCounts,
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(icons.current, adminEmail, adminAccountID, {}, undefined, mockPolicies, {}, false, undefined, false, {}, reportCounts);

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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                {}, // no card feeds
                undefined,
                mockPolicies,
                {},
                false,
                undefined,
                false,
                {},
                reportCounts,
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

            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(icons.current, adminEmail, adminAccountID, {}, undefined, mockPolicies, {}, false, undefined, false, {}, reportCounts);

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
            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const sections = SearchUIUtils.createTypeMenuSections(
                icons.current,
                adminEmail,
                adminAccountID,
                mockCardFeedsByPolicy,
                undefined,
                mockPolicies,
                {},
                false,
                undefined,
                false,
                {},
                reportCounts,
            );
            const accountingSection = sections.find((section) => section.translationPath === 'workspace.common.accounting');

            expect(accountingSection).toBeDefined();
            const menuItemKeys = accountingSection?.menuItems.map((item) => item.key) ?? [];
            expect(menuItemKeys).toContain(CONST.SEARCH.SEARCH_KEYS.RECONCILIATION);
        });

        it('should generate correct routes', () => {
            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']));
            const menuItems = SearchUIUtils.createTypeMenuSections(icons.current, undefined, undefined, {}, undefined, {}, {}, false, undefined, false, {}, reportCounts)
                .map((section) => section.menuItems)
                .flat();

            const expectedQueries = ['type:expense sortBy:date sortOrder:desc', 'type:expense-report sortBy:date sortOrder:desc', 'type:chat sortBy:date sortOrder:desc'];

            for (const [index, item] of menuItems.entries()) {
                expect(item.searchQuery).toStrictEqual(expectedQueries.at(index));
            }
        });
    });

    describe('Test isSearchResultsEmpty', () => {
        it('should return true when all transactions have delete pending action', () => {
            const results: OnyxTypes.SearchResults = {
                data: {
                    personalDetailsList: {},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactions_1805965960759424086: {
                        amount: 0,
                        category: 'Employee Meals Remote (Fringe Benefit)',
                        comment: {
                            comment: '',
                        },
                        created: '2025-05-26',
                        currency: 'USD',
                        hasEReceipt: false,
                        merchant: '(none)',
                        modifiedAmount: -1000,
                        modifiedCreated: '2025-05-22',
                        modifiedCurrency: 'USD',
                        modifiedMerchant: 'Costco Wholesale',
                        parentTransactionID: '',
                        receipt: {
                            source: 'https://www.expensify.com/receipts/fake.jpg',
                            state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE,
                        },
                        reportID: '6523565988285061',
                        tag: '',
                        transactionID: '1805965960759424086',
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        groupAmount: -5000,
                        groupCurrency: 'USD',
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
            let action = SearchUIUtils.getActions(searchResults.data, allViolations, `report_${reportID2}`, CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', overlimitApproverAccountID, {}, {}).at(0);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);

            action = SearchUIUtils.getActions(
                searchResults.data,
                allViolations,
                `transactions_${transactionID2}`,
                CONST.SEARCH.SEARCH_KEYS.EXPENSES,
                '',
                overlimitApproverAccountID,
                {},
                {},
            ).at(0);
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
                    outputCurrency: 'USD',
                    isPolicyExpenseChatEnabled: true,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                report_6523565988285061: {
                    chatReportID: '4128157185472356',
                    created: '2025-05-26 19:49:56',
                    currency: 'USD',
                    isOwnPolicyExpenseChat: false,
                    isWaitingOnBankAccount: false,
                    managerID: adminAccountID,
                    nonReimbursableTotal: 0,
                    oldPolicyName: '',
                    ownerAccountID: 2074551,
                    parentReportActionID: '5568426544518647396',
                    parentReportID: '4128157185472356',
                    policyID: '137DA25D273F2423',
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
                    amount: 0,
                    cardID: undefined,
                    cardName: undefined,
                    category: 'Employee Meals Remote (Fringe Benefit)',
                    comment: {
                        comment: '',
                    },
                    created: '2025-05-26',
                    currency: 'USD',
                    hasEReceipt: false,
                    merchant: '(none)',
                    modifiedAmount: -1000,
                    modifiedCreated: '2025-05-22',
                    modifiedCurrency: 'USD',
                    modifiedMerchant: 'Costco Wholesale',
                    parentTransactionID: '',
                    receipt: {
                        source: 'https://www.expensify.com/receipts/fake.jpg',
                        state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE,
                    },
                    reportID: '6523565988285061',
                    tag: '',
                    transactionID: '1805965960759424086',
                    groupAmount: -5000,
                    groupCurrency: 'USD',
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
            const action = SearchUIUtils.getActions(result.data, allViolations, 'report_6523565988285061', CONST.SEARCH.SEARCH_KEYS.EXPENSES, '', adminAccountID, {}, {}).at(0);
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

            const response = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined);
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

            const response2 = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined);
            expect(response2.export).toBe(true);
        });
    });

    describe('Test getColumnsToShow', () => {
        test('Should show all default columns when no custom columns are saved & viewing expense reports', () => {
            expect(SearchUIUtils.getColumnsToShow(1, [], [], false, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)).toEqual([
                CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.STATUS,
                CONST.SEARCH.TABLE_COLUMNS.TITLE,
                CONST.SEARCH.TABLE_COLUMNS.FROM,
                CONST.SEARCH.TABLE_COLUMNS.TO,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL,
                CONST.SEARCH.TABLE_COLUMNS.ACTION,
            ]);
        });

        test('Should show specific columns when custom columns are saved & viewing expense reports', () => {
            const visibleColumns = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.STATUS, CONST.SEARCH.TABLE_COLUMNS.TITLE, CONST.SEARCH.TABLE_COLUMNS.TOTAL];

            expect(SearchUIUtils.getColumnsToShow(1, [], visibleColumns, false, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)).toEqual([
                // Avatar should always be visible
                CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                CONST.SEARCH.TABLE_COLUMNS.DATE,
                CONST.SEARCH.TABLE_COLUMNS.STATUS,
                CONST.SEARCH.TABLE_COLUMNS.TITLE,
                CONST.SEARCH.TABLE_COLUMNS.TOTAL,
            ]);
        });

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
                managerID: adminAccountID, // Different from current user
                reportID: reportID2, // Needs to be a submitter report for 'To' to show
            };
            const differentUsersTransactionIOUAction: OnyxTypes.ReportAction = {
                ...reportAction2,
                accountID: approverAccountID,
                actorAccountID: approverAccountID,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: 'differentUsers',
                    IOUReportID: report2.reportID,
                },
            };

            // Test 1: No optional fields should be shown when all transactions are empty
            let columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, emptyTransaction], [], false);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.TAG);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.FROM);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.TO);

            // Test 2: Merchant column should show when at least one transaction has merchant
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, merchantTransaction], [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);

            // Test 3: Category column should show when at least one transaction has category
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, categoryTransaction], [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);

            // Test 4: Tag column should show when at least one transaction has tag
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, tagTransaction], [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.TAG);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);

            // Test 5: Description column should show when at least one transaction has description
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [emptyTransaction, descriptionTransaction], [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);

            // Test 6: From/To columns should show when at least one transaction has different users
            // @ts-expect-error -- no need to construct all data again, the function below only needs the report and transactions
            const data: OnyxTypes.SearchResults['data'] = {
                [`report_${reportID2}`]: searchResults.data[`report_${reportID2}`],
                [`transactions_${emptyTransaction.transactionID}`]: emptyTransaction,
                [`transactions_${differentUsersTransaction.transactionID}`]: differentUsersTransaction,
                [`reportActions_${reportID2}`]: {[differentUsersTransactionIOUAction.reportActionID]: differentUsersTransactionIOUAction},
                personalDetailsList: searchResults.data.personalDetailsList,
            };
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, data, [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.FROM);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.TO);

            // Test 7: Multiple columns should show when transactions have different fields
            columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [merchantTransaction, categoryTransaction, tagTransaction], [], false);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.TAG);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
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
            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [testTransaction], [], true);

            // These columns should be shown based on data
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.TAG);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);

            // From/To columns should not exist in expense report view
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.FROM);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.TO);
        });

        test('Should conditionally include Billable and Reimbursable columns in expense report view when enabled', () => {
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];
            const reimbursableTransaction = {
                ...baseTransaction,
                transactionID: 'reimbursableTx',
                merchant: 'Test Merchant',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                billable: true,
            };
            const nonReimbursableTransaction = {
                ...baseTransaction,
                transactionID: 'nonReimbursableTx',
                merchant: 'Test Merchant 2',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                reimbursable: false,
                billable: false,
            };

            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [reimbursableTransaction, nonReimbursableTransaction], [], true, undefined, undefined, false, true, true);

            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.BILLABLE);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE);

            // Column order: after Tag and before Amount (and before Comments)
            expect(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.TAG)).toBeLessThan(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE));
            expect(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE)).toBeLessThan(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.BILLABLE));
            expect(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.BILLABLE)).toBeLessThan(columns.indexOf(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT));
        });

        test('Should not include Reimbursable column in expense report view when all expenses are reimbursable', () => {
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];
            const reimbursableTransaction1 = {
                ...baseTransaction,
                transactionID: 'reimbursableTx1',
                merchant: 'Test Merchant 1',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                reimbursable: true,
                billable: false,
            };
            const reimbursableTransaction2 = {
                ...baseTransaction,
                transactionID: 'reimbursableTx2',
                merchant: 'Test Merchant 2',
                modifiedMerchant: '',
                comment: {comment: ''},
                category: '',
                tag: '',
                billable: true,
            };

            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [reimbursableTransaction1, reimbursableTransaction2], [], true, undefined, undefined, false, true, false);

            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.BILLABLE);
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE);
        });

        test('Should handle modifiedMerchant and empty category/tag values correctly', () => {
            const baseTransaction = searchResults.data[`transactions_${transactionID}`];
            const testTransaction = {
                ...baseTransaction,
                transactionID: 'modified',
                merchant: '',
                modifiedMerchant: 'Modified Merchant',
                comment: {comment: ''},
                category: 'none', // This is in CONST.SEARCH.CATEGORY_EMPTY_VALUE
                tag: CONST.SEARCH.TAG_EMPTY_VALUE, // This is the empty tag value
                accountID: adminAccountID,
                managerID: adminAccountID,
            };

            const columns = SearchUIUtils.getColumnsToShow(submitterAccountID, [testTransaction], [], false);

            // Should show merchant column because modifiedMerchant has value
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);

            // Should not show category column because 'Uncategorized' is an empty value
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);

            // Should not show tag column because it's the empty tag value
            expect(columns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.TAG);
        });
    });

    describe('Test getCustomColumns', () => {
        it('should return custom columns for EXPENSE type', () => {
            const columns = SearchUIUtils.getCustomColumns(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(columns).toEqual(Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE));
        });

        it('should return custom columns for CATEGORY groupBy', () => {
            const columns = SearchUIUtils.getCustomColumns(CONST.SEARCH.GROUP_BY.CATEGORY);
            expect(columns).toEqual(Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CATEGORY));
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
        });

        it('should return custom columns for MERCHANT groupBy', () => {
            const columns = SearchUIUtils.getCustomColumns(CONST.SEARCH.GROUP_BY.MERCHANT);
            expect(columns).toEqual(Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MERCHANT));
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
        });

        it('should return empty array for undefined value', () => {
            const columns = SearchUIUtils.getCustomColumns(undefined);
            expect(columns).toEqual([]);
        });
    });

    describe('Test getCustomColumnDefault', () => {
        it('should return default columns for EXPENSE type', () => {
            const columns = SearchUIUtils.getCustomColumnDefault(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(columns).toEqual(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE);
        });

        it('should return default columns for CATEGORY groupBy', () => {
            const columns = SearchUIUtils.getCustomColumnDefault(CONST.SEARCH.GROUP_BY.CATEGORY);
            expect(columns).toEqual(CONST.SEARCH.GROUP_DEFAULT_COLUMNS.CATEGORY);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
        });

        it('should return default columns for MERCHANT groupBy', () => {
            const columns = SearchUIUtils.getCustomColumnDefault(CONST.SEARCH.GROUP_BY.MERCHANT);
            expect(columns).toEqual(CONST.SEARCH.GROUP_DEFAULT_COLUMNS.MERCHANT);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES);
            expect(columns).toContain(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
        });

        it('should return empty array for undefined value', () => {
            const columns = SearchUIUtils.getCustomColumnDefault(undefined);
            expect(columns).toEqual([]);
        });
    });

    describe('Test getSearchColumnTranslationKey', () => {
        it('should return correct translation key for GROUP_CATEGORY', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY);
            expect(translationKey).toBe('common.category');
        });

        it('should return correct translation key for GROUP_MERCHANT', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT);
            expect(translationKey).toBe('common.merchant');
        });

        it('should return correct translation key for GROUP_EXPENSES', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES);
            expect(translationKey).toBe('common.expenses');
        });

        it('should return correct translation key for GROUP_TOTAL', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL);
            expect(translationKey).toBe('common.total');
        });

        it('should return correct translation key for MERCHANT column', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
            expect(translationKey).toBe('common.merchant');
        });

        it('should return correct translation key for CATEGORY column', () => {
            const translationKey = SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.CATEGORY);
            expect(translationKey).toBe('common.category');
        });
    });

    describe('createAndOpenSearchTransactionThread', () => {
        const threadReportID = 'thread-report-123';
        const threadReport = {reportID: threadReportID};
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
        const backTo = '/search/all';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Should create transaction thread report and set optimistic data necessary for its preview', () => {
            (createTransactionThreadReport as jest.Mock).mockReturnValue(threadReport);

            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, backTo, threadReportID, undefined, false);

            expect(setOptimisticDataForTransactionThreadPreview).toHaveBeenCalled();
            // The full reportAction is passed to preserve originalMessage.type for proper expense type detection
            expect(createTransactionThreadReport).toHaveBeenCalledWith(report1, reportAction1, undefined, undefined);
        });

        test('Should not navigate if shouldNavigate = false', () => {
            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, backTo, threadReportID, undefined, false);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        test('Should handle navigation if shouldNavigate = true', () => {
            SearchUIUtils.createAndOpenSearchTransactionThread(transactionListItem, backTo, threadReportID, undefined, true);
            // For one-transaction reports (isOneTransactionReport = true), navigation goes to the parent report (item.reportID)
            // instead of the transaction thread report
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: transactionListItem.reportID, backTo}));
        });
    });

    describe('setOptimisticDataForTransactionThreadPreview', () => {
        // These tests need the real implementation, so restore it before each test
        beforeEach(() => {
            (setOptimisticDataForTransactionThreadPreview as jest.Mock).mockRestore();
            // Re-import the real implementation
            const realModule = jest.requireActual<typeof SearchUtils>('@userActions/Search');
            (setOptimisticDataForTransactionThreadPreview as jest.Mock).mockImplementation(realModule.setOptimisticDataForTransactionThreadPreview);
        });

        it('Should create an optimistic parent report if the hasParentReport is false', async () => {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
            setOptimisticDataForTransactionThreadPreview(transactionListItem, {hasParentReport: false} as SearchUtils.TransactionPreviewData);

            await waitForBatchedUpdates();

            const parentReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${transactionListItem.reportID}`);

            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            expect(parentReport).toMatchObject(transactionListItem.report as OnyxTypes.Report);
        });

        it('Should create an optimistic parent report action if the hasParentReportAction is false', async () => {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
            setOptimisticDataForTransactionThreadPreview(transactionListItem, {hasParentReportAction: false} as SearchUtils.TransactionPreviewData);

            await waitForBatchedUpdates();

            const parentReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionListItem.reportID}`);
            const parentReportAction = transactionListItem?.reportAction?.reportActionID && parentReport?.[transactionListItem?.reportAction?.reportActionID];

            expect(parentReportAction).toBeTruthy();
        });

        it('Should create an optimistic transaction if the hasTransaction is false', async () => {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
            setOptimisticDataForTransactionThreadPreview(transactionListItem, {hasTransaction: false} as SearchUtils.TransactionPreviewData);

            await waitForBatchedUpdates();

            const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionListItem.transactionID}`);

            expect(transaction).toBeTruthy();
        });

        it('Should create an optimistic transaction thread if the hasTransactionThreadReport is false', async () => {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const transactionListItem = transactionsListItems.at(0) as TransactionListItemType;
            setOptimisticDataForTransactionThreadPreview(transactionListItem, {hasTransactionThreadReport: false} as SearchUtils.TransactionPreviewData, '456');

            await waitForBatchedUpdates();

            const transactionThread = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}456`);

            expect(transactionThread).toBeTruthy();
        });
    });

    describe('shouldShowDeleteOption', () => {
        it('should use the data from selectedTransactions when the data is not available from search result with group-by filter', async () => {
            const TEST_GROUP_KEY = 'group_123456';
            const TEST_ACCOUNT_ID = 1234567;
            const TEST_REPORT_ID = '123456789';
            const TEST_POLICY_ID = 'A1B2C3';
            const TEST_CHILD_REPORT_ID = '1111111';
            const TEST_CHAT_REPORT_ID = '2222222';
            const TEST_TRANSACTION_ID = '123456789';
            const TEST_REPORT_ACTION_ID = '987654321';
            const TEST_PARENT_REPORT_ACTION_ID = '555555555';
            const TEST_CUSTOM_UNIT_ID = 'TEST123';
            const TEST_CUSTOM_UNIT_RATE_ID = 'RATE456';
            const TEST_AMOUNT = 23897;
            const TEST_DISTANCE = 341.38;

            const currentSearchResults = {
                [TEST_GROUP_KEY]: {
                    accountID: TEST_ACCOUNT_ID,
                    count: 1,
                    currency: 'USD',
                    total: TEST_AMOUNT,
                },
                personalDetailsList: {
                    [TEST_ACCOUNT_ID]: {
                        accountID: TEST_ACCOUNT_ID,
                        avatar: '',
                        displayName: 'Test User',
                        email: 'test@example.com',
                        firstName: 'Test',
                        lastName: 'User',
                        login: 'test@example.com',
                    },
                },
            } as OnyxTypes.SearchResults['data'];

            const selectedTransactions = {
                [TEST_TRANSACTION_ID]: {
                    action: 'approve',
                    canHold: true,
                    isHeld: false,
                    canUnhold: false,
                    canSplit: false,
                    hasBeenSplit: false,
                    canChangeReport: true,
                    isSelected: true,
                    canReject: true,
                    reportID: TEST_REPORT_ID,
                    policyID: TEST_POLICY_ID,
                    amount: -TEST_AMOUNT,
                    groupAmount: -TEST_AMOUNT,
                    groupCurrency: 'USD',
                    groupExchangeRate: '1.0',
                    currency: 'USD',
                    ownerAccountID: TEST_ACCOUNT_ID,
                    reportAction: {
                        actionName: 'IOU',
                        actorAccountID: TEST_ACCOUNT_ID,
                        avatar: '',
                        childReportID: TEST_CHILD_REPORT_ID,
                        created: '2024-01-01 00:00:00',
                        lastModified: '2024-01-01 00:00:00',
                        message: [
                            {
                                type: 'COMMENT',
                                html: `$${(TEST_AMOUNT / 100).toFixed(2)} expense for ${TEST_DISTANCE} miles`,
                                text: `$${(TEST_AMOUNT / 100).toFixed(2)} expense for ${TEST_DISTANCE} miles`,
                                isEdited: false,
                                whisperedTo: [],
                                isDeletedParentAction: false,
                                deleted: '',
                                reactions: [],
                            },
                        ],
                        originalMessage: {
                            IOUReportID: Number(TEST_REPORT_ID),
                            IOUTransactionID: TEST_TRANSACTION_ID,
                            amount: TEST_AMOUNT,
                            comment: `${TEST_DISTANCE} miles`,
                            currency: 'USD',
                            isNewDot: true,
                            lastModified: '2024-01-01 00:00:00',
                            participantAccountIDs: [TEST_ACCOUNT_ID, 0],
                            type: 'create',
                        },
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'Test User',
                            },
                        ],
                        reportActionID: TEST_REPORT_ACTION_ID,
                        shouldShow: true,
                        timestamp: 1704067200,
                        reportActionTimestamp: 1704067200000,
                        automatic: false,
                        childType: 'chat',
                        childCommenterCount: 0,
                        childVisibleActionCount: 0,
                        submitterEmail: 'test@example.com',
                        whisperedToAccountIDs: [],
                    },
                    isFromOneTransactionReport: true,
                    report: {
                        approved: '',
                        chatReportID: TEST_CHAT_REPORT_ID,
                        chatType: '',
                        created: '2024-01-01 00:00:00',
                        currency: 'USD',
                        isOneTransactionReport: true,
                        isOwnPolicyExpenseChat: false,
                        isWaitingOnBankAccount: false,
                        managerID: TEST_ACCOUNT_ID,
                        nonReimbursableTotal: 0,
                        oldPolicyName: '',
                        ownerAccountID: TEST_ACCOUNT_ID,
                        parentReportActionID: TEST_PARENT_REPORT_ACTION_ID,
                        parentReportID: TEST_CHAT_REPORT_ID,
                        policyID: TEST_POLICY_ID,
                        reportID: TEST_REPORT_ID,
                        reportName: 'Expense Report 2024-01-01',
                        stateNum: 0,
                        statusNum: 0,
                        submitted: '2024-01-01 00:00:00',
                        total: -TEST_AMOUNT,
                        transactionCount: 1,
                        type: 'expense',
                        unheldTotal: -TEST_AMOUNT,
                    },
                    transactionID: TEST_TRANSACTION_ID,
                    managedCard: false,
                    comment: {
                        comment: '',
                        customUnit: {
                            attributes: [],
                            customUnitID: TEST_CUSTOM_UNIT_ID,
                            customUnitRateID: TEST_CUSTOM_UNIT_RATE_ID,
                            distanceUnit: 'mi',
                            name: 'Distance',
                            quantity: TEST_DISTANCE,
                            subRates: [],
                        },
                        type: 'customUnit',
                        waypoints: {
                            waypoint0: {
                                address: 'Test City, ST, USA',
                                keyForList: 'TestCity_1704067200',
                                lat: 40.7128,
                                lng: -74.006,
                                name: 'Test City',
                            },
                            waypoint1: {
                                address: 'Test Destination, ST, USA',
                                keyForList: 'TestDestination_1704067201',
                                lat: 34.0522,
                                lng: -118.2437,
                                name: 'Test Destination',
                            },
                        },
                    },
                },
            } as unknown as Record<string, SelectedTransactionInfo>;

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID});

            expect(SearchUIUtils.shouldShowDeleteOption(selectedTransactions, currentSearchResults, false)).toBe(true);
        });
    });
    describe('getToFieldValueForTransaction', () => {
        const mockTransaction: OnyxTypes.Transaction = {
            transactionID: '1',
            amount: 1000,
            currency: 'USD',
            reportID,
            accountID: adminAccountID,
            created: '2024-12-21 13:05:20',
            merchant: 'Test Merchant',
        } as OnyxTypes.Transaction;

        const mockPersonalDetails: OnyxTypes.PersonalDetailsList = {
            [adminAccountID]: {
                accountID: adminAccountID,
                displayName: 'Admin User',
                login: adminEmail,
                avatar: 'https://example.com/avatar.png',
            },
            [receiverAccountID]: {
                accountID: receiverAccountID,
                displayName: 'Receiver User',
                login: receiverEmail,
                avatar: 'https://example.com/avatar2.png',
            },
        };

        test('Should return emptyPersonalDetails when report is undefined', () => {
            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, undefined, mockPersonalDetails, undefined);
            expect(result).toEqual(emptyPersonalDetails);
        });

        test('Should return emptyPersonalDetails when report is an open expense report', () => {
            const openExpenseReport: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, openExpenseReport, mockPersonalDetails, undefined);
            expect(result).toEqual(emptyPersonalDetails);
        });

        test('Should return ownerAccountID personal details when reportAction is PAY type and report has ownerAccountID', () => {
            const payReportAction: OnyxTypes.ReportAction = {
                ...reportAction1,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    IOUTransactionID: mockTransaction.transactionID,
                    IOUReportID: report1.reportID,
                },
            } as OnyxTypes.ReportAction;

            const nonOpenReport: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: adminAccountID,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, nonOpenReport, mockPersonalDetails, payReportAction);
            expect(result).toEqual(mockPersonalDetails[adminAccountID]);
        });

        test('Should return managerID personal details when reportAction is not a money request action', () => {
            const nonMoneyRequestAction: OnyxTypes.ReportAction = {
                ...reportAction1,
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                originalMessage: undefined,
            } as OnyxTypes.ReportAction;

            const nonOpenReport: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: receiverAccountID,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, nonOpenReport, mockPersonalDetails, nonMoneyRequestAction);
            expect(result).toEqual(mockPersonalDetails[receiverAccountID]);
        });

        test('Should return getIOUPayerAndReceiver result for IOU report with managerID', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: receiverAccountID,
                ownerAccountID: adminAccountID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const transactionWithNegativeAmount: OnyxTypes.Transaction = {
                ...mockTransaction,
                amount: -1000,
                modifiedAmount: 1000,
            } as OnyxTypes.Transaction;

            const result = SearchUIUtils.getToFieldValueForTransaction(transactionWithNegativeAmount, iouReport, mockPersonalDetails, undefined);
            expect(result).toEqual(mockPersonalDetails[receiverAccountID]);
        });

        test('Should return getIOUPayerAndReceiver result for IOU report with positive amount', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: receiverAccountID,
                ownerAccountID: adminAccountID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const transactionWithPositiveAmount: OnyxTypes.Transaction = {
                ...mockTransaction,
                amount: 1000,
            } as OnyxTypes.Transaction;

            const result = SearchUIUtils.getToFieldValueForTransaction(transactionWithPositiveAmount, iouReport, mockPersonalDetails, undefined);
            expect(result).toEqual(mockPersonalDetails[receiverAccountID]);
        });

        test('Should use modifiedAmount when available for IOU report', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: receiverAccountID,
                ownerAccountID: adminAccountID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const transactionWithModifiedAmount: OnyxTypes.Transaction = {
                ...mockTransaction,
                amount: 1000,
                modifiedAmount: -2000,
            } as OnyxTypes.Transaction;

            const result = SearchUIUtils.getToFieldValueForTransaction(transactionWithModifiedAmount, iouReport, mockPersonalDetails, undefined);
            expect(result).toEqual(mockPersonalDetails[adminAccountID]);
        });

        test('Should return managerID personal details for non-IOU report with managerID', () => {
            const nonIOUReport: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: receiverAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, nonIOUReport, mockPersonalDetails, undefined);
            expect(result).toEqual(mockPersonalDetails[receiverAccountID]);
        });

        test('Should return emptyPersonalDetails when managerID personal details are not found', () => {
            const nonIOUReport: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: 999999,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, nonIOUReport, mockPersonalDetails, undefined);
            expect(result).toEqual(emptyPersonalDetails);
        });

        test('Should return emptyPersonalDetails when report has no managerID', () => {
            const reportWithoutManager: OnyxTypes.Report = {
                ...report1,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: undefined,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, reportWithoutManager, mockPersonalDetails, undefined);
            expect(result).toEqual(emptyPersonalDetails);
        });

        test('Should return emptyPersonalDetails when getIOUPayerAndReceiver returns undefined for IOU report', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: receiverAccountID,
                ownerAccountID: adminAccountID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const emptyPersonalDetailsList: OnyxTypes.PersonalDetailsList = {};

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, iouReport, emptyPersonalDetailsList, undefined);
            expect(result).toEqual(emptyPersonalDetails);
        });

        test('Should handle IOU report with DEFAULT_NUMBER_ID for managerID', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: CONST.DEFAULT_NUMBER_ID,
                ownerAccountID: adminAccountID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, iouReport, mockPersonalDetails, undefined);
            expect(result).toBeDefined();
        });

        test('Should handle IOU report with DEFAULT_NUMBER_ID for ownerAccountID', () => {
            const iouReport: OnyxTypes.Report = {
                ...report3,
                managerID: receiverAccountID,
                ownerAccountID: CONST.DEFAULT_NUMBER_ID,
                type: CONST.REPORT.TYPE.IOU,
            } as OnyxTypes.Report;

            const result = SearchUIUtils.getToFieldValueForTransaction(mockTransaction, iouReport, mockPersonalDetails, undefined);
            expect(result).toBeDefined();
        });
    });

    describe('view autocomplete values', () => {
        test('should include all view values (table, bar, line, pie)', () => {
            const viewValues = Object.values(CONST.SEARCH.VIEW);
            expect(viewValues).toContain('table');
            expect(viewValues).toContain('bar');
            expect(viewValues).toContain('line');
            expect(viewValues).toContain('pie');
            expect(viewValues).toHaveLength(4);
        });

        test('should correctly map view values to user-friendly values', () => {
            const viewValues = Object.values(CONST.SEARCH.VIEW);
            const userFriendlyValues = viewValues.map((value) => getUserFriendlyValue(value));

            // All view values should be mapped (they may be the same or different)
            expect(userFriendlyValues).toHaveLength(4);
            expect(userFriendlyValues.every((value) => typeof value === 'string')).toBe(true);
        });
    });
});
