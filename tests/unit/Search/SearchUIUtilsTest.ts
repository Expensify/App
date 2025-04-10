import Onyx from 'react-native-onyx';
import ChatListItem from '@components/SelectionList/ChatListItem';
import ReportListItem from '@components/SelectionList/Search/ReportListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const adminAccountID = 18439984;
const adminEmail = 'admin@policy.com';
const approverAccountID = 1111111;
const approverEmail = 'approver@policy.com';
const overlimitApproverAccountID = 222222;
const overlimitApproverEmail = 'overlimit@policy.com';
const policyID = 'A1B2C3';
const reportID = '123456789';
const reportID2 = '11111';
const reportID3 = '99999';
const transactionID = '1';
const transactionID2 = '2';
const transactionID3 = '3';
const transactionID4 = '4';

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
        },
        [`policy_${policyID}`]: {
            id: 'Admin',
            approvalMode: 'ADVANCED',
            autoReimbursement: {
                limit: 0,
            },
            autoReimbursementLimit: 0,
            autoReporting: true,
            autoReportingFrequency: 'instant',
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
                        whisperedTo: [12345678, 87654321],
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
        },
        [`report_${reportID}`]: {
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
        },
        [`report_${reportID2}`]: {
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
        },
        [`report_${reportID3}`]: {
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
        },
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
            policyID,
            reportID,
            reportType: 'expense',
            tag: '',
            transactionID,
            transactionThreadReportID: '456',
            transactionType: 'cash',
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
        },
        [`transactionViolations_${transactionID2}`]: [
            {
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
                type: CONST.VIOLATION_TYPES.VIOLATION,
            },
        ],
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
        },
    },
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
                whisperedTo: [12345678, 87654321],
            },
            {
                type: 'comment',
                text: 'Please review this expense.',
                html: '<p>Please review this expense.</p>',
            },
        ],
        reportActionID: 'Admin',
        reportID: '123456789',
        reportName: 'Unavailable workspace owes $50.00',
    },
] as ReportActionListItemType[];

const transactionsListItems = [
    {
        accountID: 18439984,
        action: 'pay',
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
        policyID: 'A1B2C3',
        reportID: '123456789',
        reportType: 'expense',
        shouldShowCategory: true,
        shouldShowMerchant: true,
        shouldShowTag: false,
        shouldShowTax: false,
        shouldShowYear: true,
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
    },
    {
        accountID: 18439984,
        action: 'review',
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
    },
    {
        accountID: 18439984,
        amount: 1200,
        action: 'view',
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
    },
    {
        accountID: 18439984,
        amount: 3200,
        action: 'view',
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
    },
] as TransactionListItemType[];

const reportsListItems = [
    {
        accountID: 18439984,
        action: 'pay',
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
            accountID: 18439984,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            displayName: 'Admin',
            login: adminEmail,
        },
        total: -5000,
        transactions: [
            {
                accountID: 18439984,
                action: 'pay',
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
                policyID: 'A1B2C3',
                reportID: '123456789',
                reportType: 'expense',
                shouldShowCategory: true,
                shouldShowMerchant: true,
                shouldShowTag: false,
                shouldShowTax: false,
                shouldShowYear: true,
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
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
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
            },
        ],
        type: 'expense',
        unheldTotal: -5000,
    },
    {
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
] as ReportListItemType[];

describe('SearchUIUtils', () => {
    describe('Test getAction', () => {
        test('Should return `Pay` action for transaction on policy with no approvals and no violations', () => {
            let action = SearchUIUtils.getAction(searchResults.data, `report_${reportID}`);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.PAY);

            action = SearchUIUtils.getAction(searchResults.data, `transactions_${transactionID}`);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.PAY);
        });

        test('Should return `Review` action for transaction on policy with no approvals and with violations', () => {
            let action = SearchUIUtils.getAction(searchResults.data, `report_${reportID2}`);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);

            action = SearchUIUtils.getAction(searchResults.data, `transactions_${transactionID2}`);
            expect(action).toStrictEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
        });
    });

    describe('Test getListItem', () => {
        it('should return ChatListItem when type is CHAT', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.CHAT, 'all')).toStrictEqual(ChatListItem);
        });

        it('should return TransactionListItem when shouldGroupByReports is false', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', false)).toStrictEqual(TransactionListItem);
        });

        it('should return ReportListItem when type is EXPENSE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', true)).toStrictEqual(ReportListItem);
        });

        it('should return ReportListItem when type is TRIP and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.TRIP, 'all', true)).toStrictEqual(ReportListItem);
        });

        it('should return ReportListItem when type is INVOICE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getListItem(CONST.SEARCH.DATA_TYPES.INVOICE, 'all', true)).toStrictEqual(ReportListItem);
        });
    });

    describe('Test getSections', () => {
        it('should return getReportActionsSections result when type is CHAT', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.CHAT, 'all', searchResults.data, searchResults.search)).toStrictEqual(reportActionListItems);
        });

        it('should return getTransactionsSections result when shouldGroupByReports is false', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', searchResults.data, searchResults.search, false)).toStrictEqual(transactionsListItems);
        });

        it('should return getReportSections result when type is EXPENSE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', searchResults.data, searchResults.search, true)).toStrictEqual(reportsListItems);
        });

        it('should return getReportSections result when type is TRIP and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.TRIP, 'all', searchResults.data, searchResults.search, true)).toStrictEqual(reportsListItems);
        });

        it('should return getReportSections result when type is INVOICE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSections(CONST.SEARCH.DATA_TYPES.INVOICE, 'all', searchResults.data, searchResults.search, true)).toStrictEqual(reportsListItems);
        });
    });

    describe('Test getSortedSections', () => {
        it('should return getSortedReportActionData result when type is CHAT', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.CHAT, 'all', reportActionListItems)).toStrictEqual([
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
                            whisperedTo: [12345678, 87654321],
                        },
                        {
                            html: '<p>Please review this expense.</p>',
                            text: 'Please review this expense.',
                            type: 'comment',
                        },
                    ],
                    reportActionID: 'Admin',
                    reportID: '123456789',
                    reportName: 'Unavailable workspace owes $50.00',
                },
            ]);
        });

        it('should return getSortedTransactionData result when shouldGroupByReports is false', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', transactionsListItems, 'date', 'asc', false)).toStrictEqual(transactionsListItems);
        });

        it('should return getSortedReportData result when type is EXPENSE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.EXPENSE, 'all', reportsListItems, 'date', 'asc', true)).toStrictEqual(reportsListItems);
        });

        it('should return getSortedReportData result when type is TRIP and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.TRIP, 'all', reportsListItems, 'date', 'asc', true)).toStrictEqual(reportsListItems);
        });

        it('should return getSortedReportData result when type is INVOICE and shouldGroupByReports is true', () => {
            expect(SearchUIUtils.getSortedSections(CONST.SEARCH.DATA_TYPES.INVOICE, 'all', reportsListItems, 'date', 'asc', true)).toStrictEqual(reportsListItems);
        });
    });

    describe('Test createTypeMenuItems', () => {
        it('should return the default menu items', () => {
            const menuItems = SearchUIUtils.createTypeMenuItems(null, undefined);
            expect(menuItems).toHaveLength(4);
            expect(menuItems).toStrictEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        translationPath: 'common.expenses',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                        icon: Expensicons.Receipt,
                    }),
                    expect.objectContaining({
                        translationPath: 'common.expenseReports',
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                        icon: Expensicons.Document,
                    }),
                    expect.objectContaining({
                        translationPath: 'common.chats',
                        type: CONST.SEARCH.DATA_TYPES.CHAT,
                        icon: Expensicons.ChatBubbles,
                    }),
                    expect.objectContaining({
                        translationPath: 'travel.trips',
                        type: CONST.SEARCH.DATA_TYPES.TRIP,
                        icon: Expensicons.Suitcase,
                    }),
                ]),
            );
        });

        it('should generate correct routes', () => {
            const menuItems = SearchUIUtils.createTypeMenuItems(null, undefined);

            const expectedRoutes = [
                ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense status:all sortBy:date sortOrder:desc'}),
                ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense status:all sortBy:date sortOrder:desc groupBy:reports'}),
                ROUTES.SEARCH_ROOT.getRoute({query: 'type:chat status:all sortBy:date sortOrder:desc'}),
                ROUTES.SEARCH_ROOT.getRoute({query: 'type:trip status:all sortBy:date sortOrder:desc'}),
            ];

            menuItems.forEach((item, index) => {
                expect(item.getRoute()).toStrictEqual(expectedRoutes.at(index));
            });
        });
    });

    test('Should show `View` to overlimit approver', () => {
        Onyx.merge(ONYXKEYS.SESSION, {accountID: overlimitApproverAccountID});
        searchResults.data[`policy_${policyID}`].role = CONST.POLICY.ROLE.USER;
        return waitForBatchedUpdates().then(() => {
            let action = SearchUIUtils.getAction(searchResults.data, `report_${reportID2}`);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);

            action = SearchUIUtils.getAction(searchResults.data, `transactions_${transactionID2}`);
            expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.VIEW);
        });
    });

    test('Should return true if the search result has valid type', () => {
        expect(SearchUIUtils.shouldShowEmptyState(false, reportsListItems.length, searchResults.search.type)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, 0, searchResults.search.type)).toBe(true);
        const inValidSearchType: SearchDataTypes = 'expensse' as SearchDataTypes;
        expect(SearchUIUtils.shouldShowEmptyState(true, reportsListItems.length, inValidSearchType)).toBe(true);
        expect(SearchUIUtils.shouldShowEmptyState(true, reportsListItems.length, searchResults.search.type)).toBe(false);
    });
});
