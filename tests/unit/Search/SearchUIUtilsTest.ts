import type {TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import type * as OnyxTypes from '@src/types/onyx';

const fakeSearchResults: OnyxTypes.SearchResults = {
    data: {
        personalDetailsList: {
            '18439984': {
                accountID: 18439984,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                displayName: 'test',
                login: 'test1234@gmail.com',
            },
        },
        policy_ABC123: {
            approvalMode: 'OPTIONAL',
            autoReimbursement: {
                limit: 0,
            },
            autoReimbursementLimit: 0,
            autoReporting: true,
            autoReportingFrequency: 'instant',
            preventSelfApproval: false,
            reimbursementChoice: 'reimburseManual',
            role: 'admin',
            type: 'team',
        },
        report_ABC123: {
            accountID: 18439984,
            action: 'view',
            chatReportID: '1706144653204915',
            created: '2024-12-21 13:05:20',
            currency: 'USD',
            isOneTransactionReport: true,
            isPolicyExpenseChat: false,
            isWaitingOnBankAccount: false,
            managerID: 18439984,
            nonReimbursableTotal: 0,
            ownerAccountID: 18439984,
            policyID: '123',
            private_isArchived: '',
            reportID: '123',
            reportName: 'Expense Report #123',
            stateNum: 1,
            statusNum: 1,
            total: -5000,
            type: 'expense',
            unheldTotal: -5000,
        },
        transactions_AB: {
            accountID: 18439984,
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
            managerID: 18439984,
            description: '',
            hasViolation: false,
            merchant: 'Expense',
            modifiedAmount: 0,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: 'Expense',
            parentTransactionID: '',
            policyID: '123',
            reportID: '123',
            reportType: 'expense',
            tag: '',
            transactionID: '123',
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
        offset: 0,
        status: 'all',
        isLoading: false,
        type: 'expense',
    },
};
const transactionSections = SearchUIUtils.getSections('expense', 'all', fakeSearchResults.data, fakeSearchResults.search) as TransactionListItemType[];
const tests = transactionSections.map((transactionList) => [{transactionListItem: transactionList, expectedMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT}]);

describe('SearchUIUtils', () => {
    test.each(tests)('Transaction list item with "Expense" merchant', ({transactionListItem, expectedMerchant}) => {
        expect(transactionListItem.merchant).toEqual(expectedMerchant);
    });
});
