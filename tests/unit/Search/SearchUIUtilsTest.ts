import type {TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import type * as OnyxTypes from '@src/types/onyx';

const accountID = 18439984;
const policyID = 'A1B2C3';
const reportID = '123456789';
const reportID2 = '11111';
const transactionID = '1';
const transactionID2 = '2';

// Given search data results consisting of involved users' personal details, policyID, reportID and transactionID
const searchResults: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            [accountID]: {
                accountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'test',
                login: 'test1234@gmail.com',
            },
        },
        [`policy_${policyID}`]: {
            id: 'test',
            approvalMode: 'OPTIONAL',
            autoReimbursement: {
                limit: 0,
            },
            autoReimbursementLimit: 0,
            autoReporting: true,
            autoReportingFrequency: 'instant',
            preventSelfApproval: false,
            owner: 'test1234@gmail.com',
            reimbursementChoice: 'reimburseManual',
            role: 'admin',
            type: 'team',
        },
        [`report_${reportID}`]: {
            accountID,
            action: 'view',
            chatReportID: '1706144653204915',
            created: '2024-12-21 13:05:20',
            currency: 'USD',
            isOneTransactionReport: true,
            isPolicyExpenseChat: false,
            isWaitingOnBankAccount: false,
            managerID: accountID,
            nonReimbursableTotal: 0,
            ownerAccountID: accountID,
            policyID,
            reportID,
            reportName: 'Expense Report #123',
            stateNum: 1,
            statusNum: 1,
            total: -5000,
            type: 'expense',
            unheldTotal: -5000,
        },
        [`report_${reportID2}`]: {
            accountID,
            action: 'view',
            chatReportID: '1706144653204915',
            created: '2024-12-21 13:05:20',
            currency: 'USD',
            isOneTransactionReport: true,
            isPolicyExpenseChat: false,
            isWaitingOnBankAccount: false,
            managerID: accountID,
            nonReimbursableTotal: 0,
            ownerAccountID: accountID,
            policyID,
            reportID: reportID2,
            reportName: 'Expense Report #123',
            stateNum: 1,
            statusNum: 1,
            total: -5000,
            type: 'expense',
            unheldTotal: -5000,
        },
        [`transactions_${transactionID}`]: {
            accountID,
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
            managerID: accountID,
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
            accountID,
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
            managerID: accountID,
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

// When the results are filtered by type "expense" to be displayed on the search page
const transactionSections = SearchUIUtils.getSections('expense', 'all', searchResults.data, searchResults.search) as TransactionListItemType[];
const tests = transactionSections.map((transactionList) => [{transactionListItem: transactionList, expectedMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT}]);

// Then verify the merchant column is displayed as "Expense", and does not contain an empty string
describe('SearchUIUtils', () => {
    test.each(tests)('Transaction list item with "Expense" merchant', ({transactionListItem, expectedMerchant}) => {
        expect(transactionListItem.merchant).toEqual(expectedMerchant);
    });
});

describe('Test getAction', () => {
    test('Should return `Pay` action for transaction on policy with no approvals and no violations', () => {
        let action = SearchUIUtils.getAction(searchResults.data, `report_${reportID}`);
        expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.PAY);

        action = SearchUIUtils.getAction(searchResults.data, `transactions_${transactionID}`);
        expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.PAY);
    });

    test('Should return `Review` action for transaction on policy with no approvals and with violations', () => {
        let action = SearchUIUtils.getAction(searchResults.data, `report_${reportID2}`);
        expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);

        action = SearchUIUtils.getAction(searchResults.data, `transactions_${transactionID2}`);
        expect(action).toEqual(CONST.SEARCH.ACTION_TYPES.REVIEW);
    });
});
