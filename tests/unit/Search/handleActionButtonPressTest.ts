/* eslint-disable @typescript-eslint/naming-convention */
import type {ReportListItemType} from '@components/SelectionList/types';
import {handleActionButtonPress} from '@libs/actions/Search';

const mockReportItemWithHold = {
    shouldAnimateInHighlight: false,
    accountID: 1206,
    action: 'approve',
    chatReportID: '2108006919825366',
    created: '2024-12-04 23:18:33',
    currency: 'USD',
    isOneTransactionReport: false,
    isPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    managerID: 1206,
    nonReimbursableTotal: 0,
    ownerAccountID: 1206,
    policyID: '48D7178DE42EE9F9',
    private_isArchived: '',
    reportID: '1350959062018695',
    reportName: 'Expense Report #1350959062018695',
    stateNum: 1,
    statusNum: 1,
    total: -13500,
    type: 'expense',
    unheldTotal: -12300,
    keyForList: '1350959062018695',
    from: {
        accountID: 1206,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
        displayName: 'aesf',
        firstName: 'aesf',
        lastName: '',
        login: 'apb@apb.com',
        pronouns: '',
        timezone: {
            automatic: true,
            selected: 'America/Edmonton',
        },
        phoneNumber: '',
        validated: false,
    },
    to: {
        accountID: 1206,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
        displayName: 'aesf',
        firstName: 'aesf',
        lastName: '',
        login: 'apb@apb.com',
        pronouns: '',
        timezone: {
            automatic: true,
            selected: 'America/Edmonton',
        },
        phoneNumber: '',
        validated: false,
    },
    transactions: [
        {
            accountID: 1206,
            action: 'view',
            amount: -1200,
            canDelete: true,
            canHold: false,
            canUnhold: true,
            category: '',
            comment: {
                comment: '',
                hold: '3042630993757922770',
            },
            created: '2024-12-04',
            currency: 'USD',
            hasEReceipt: false,
            isFromOneTransactionReport: false,
            managerID: 1206,
            merchant: 'qewr',
            modifiedAmount: 0,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            reportType: 'expense',
            tag: '',
            transactionID: '1049531721038862176',
            transactionThreadReportID: '2957345659269055',
            transactionType: 'cash',
            from: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'aesf',
                firstName: 'aesf',
                lastName: '',
                login: 'apb@apb.com',
                pronouns: '',
                timezone: {
                    automatic: true,
                    selected: 'America/Edmonton',
                },
                phoneNumber: '',
                validated: false,
            },
            to: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'aesf',
                firstName: 'aesf',
                lastName: '',
                login: 'apb@apb.com',
                pronouns: '',
                timezone: {
                    automatic: true,
                    selected: 'America/Edmonton',
                },
                phoneNumber: '',
                validated: false,
            },
            formattedFrom: 'aesf',
            formattedTo: 'aesf',
            formattedTotal: 1200,
            formattedMerchant: 'qewr',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowCategory: true,
            shouldShowTag: false,
            shouldShowTax: false,
            keyForList: '1049531721038862176',
            shouldShowYear: false,
            shouldAnimateInHighlight: false,
        },
        {
            accountID: 1206,
            action: 'view',
            amount: -12300,
            canDelete: true,
            canHold: true,
            canUnhold: false,
            category: '',
            comment: {
                comment: '',
            },
            created: '2024-12-04',
            currency: 'USD',
            hasEReceipt: false,
            isFromOneTransactionReport: false,
            managerID: 1206,
            merchant: 'fgdfgadfaf',
            modifiedAmount: 0,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            reportType: 'expense',
            tag: '',
            transactionID: '5345995386715609966',
            transactionThreadReportID: '740282333335072',
            transactionType: 'cash',
            from: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'aesf',
                login: 'apb@apb.com',
            },
            to: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'aesf',
            },
            formattedFrom: 'aesf',
            formattedTo: 'aesf',
            formattedTotal: 12300,
            formattedMerchant: 'fgdfgadfaf',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowCategory: true,
            shouldShowTag: false,
            shouldShowTax: false,
            keyForList: '5345995386715609966',
            shouldShowYear: false,
            shouldAnimateInHighlight: false,
        },
    ],
    isSelected: false,
} as ReportListItemType;

const updatedMockReportItem = {
    ...mockReportItemWithHold,
    transactions: mockReportItemWithHold.transactions.map((transaction, index) => {
        if (index === 0) {
            return {
                ...transaction,
                comment: {
                    comment: '',
                },
            };
        }
        return transaction;
    }),
};

describe('handleActionButtonPress', () => {
    const searchHash = 1;
    test('Should navigate to item when report has one transaction on hold', () => {
        const goToItem = jest.fn(() => {});
        handleActionButtonPress(searchHash, mockReportItemWithHold, goToItem);
        expect(goToItem).toHaveBeenCalledTimes(1);
    });

    test('Should not navigate to item when the hold is removed', () => {
        const goToItem = jest.fn(() => {});
        handleActionButtonPress(searchHash, updatedMockReportItem, goToItem);
        expect(goToItem).toHaveBeenCalledTimes(0);
    });
});
