import type {TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import type * as OnyxTypes from '@src/types/onyx';

const accountID = 18439984;
const policyID = 'A1B2C3';
// Given the report id of the report transaction
const reportID = '123456789';
// Transaction ID of the transaction
const transactionID = '1';

// Search data results of the given report and transactions
const searchResults: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            [accountID]: {
                accountID: accountID,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'test',
                login: 'test1234@gmail.com',
            },
        },
        [`policy_${policyID}`]: {
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
            accountID: accountID,
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
            policyID: policyID,
            reportID: reportID,
            reportName: 'Expense Report #123',
            stateNum: 1,
            statusNum: 1,
            total: -5000,
            type: 'expense',
            unheldTotal: -5000,
        },
        [`transactions_${transactionID}`]: {
            accountID: accountID,
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
            policyID: policyID,
            reportID: reportID,
            reportType: 'expense',
            tag: '',
            transactionID: transactionID,
            transactionThreadReportID: '456',
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
const transactionSections = SearchUIUtils.getSections('expense', 'all', searchResults.data, searchResults.search) as TransactionListItemType[];
const tests = transactionSections.map((transactionList) => [{transactionListItem: transactionList, expectedMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT}]);

describe('SearchUIUtils', () => {
    test.each(tests)('Transaction list item with "Expense" merchant', ({transactionListItem, expectedMerchant}) => {
        expect(transactionListItem.merchant).toEqual(expectedMerchant);
    });
});
