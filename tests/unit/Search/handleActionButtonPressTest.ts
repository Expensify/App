/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import {handleActionButtonPress} from '@libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethod, SearchResults} from '@src/types/onyx';

jest.mock('@src/components/ConfirmedRoute.tsx');

const mockReportItemWithHold = {
    groupedBy: 'reports',
    shouldAnimateInHighlight: false,
    accountID: 1206,
    action: 'approve',
    allActions: ['approve'],
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
        displayName: 'Ames',
        firstName: 'Ames',
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
        displayName: 'Ames',
        firstName: 'Ames',
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
            report: {
                reportID: '1350959062018695',
            },
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
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
            merchant: 'Qatar',
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
                displayName: 'Ames',
                firstName: 'Ames',
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
                displayName: 'Ames',
                firstName: 'Ames',
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
            formattedFrom: 'Ames',
            formattedTo: 'Ames',
            formattedTotal: 1200,
            formattedMerchant: 'Qatar',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowYear: false,
            keyForList: '1049531721038862176',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            convertedAmount: 1200,
            convertedCurrency: 'USD',
        },
        {
            report: {
                reportID: '1350959062018695',
            },
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
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
            merchant: 'Forbes',
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
                displayName: 'Ames',
                login: 'apb@apb.com',
            },
            to: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'Ames',
            },
            formattedFrom: 'Ames',
            formattedTo: 'Ames',
            formattedTotal: 12300,
            formattedMerchant: 'Forbes',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowYear: false,
            keyForList: '5345995386715609966',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            convertedAmount: 1200,
            convertedCurrency: 'USD',
        },
    ],
    isSelected: false,
} as TransactionReportGroupListItemType;

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

const mockSnapshotForItem: OnyxEntry<SearchResults> = {
    // @ts-expect-error: Allow partial record in snapshot update for testing
    data: {
        [`${ONYXKEYS.COLLECTION.POLICY}${mockReportItemWithHold?.policyID}`]: {
            ...(mockReportItemWithHold.policyID
                ? {
                      [String(mockReportItemWithHold.policyID)]: {
                          type: 'policy',
                          id: String(mockReportItemWithHold.policyID),
                          role: 'admin',
                          owner: 'apb@apb.com',
                          ...mockReportItemWithHold,
                      },
                  }
                : {}),
        },
    },
};

const mockLastPaymentMethod: OnyxEntry<LastPaymentMethod> = {
    expense: 'Elsewhere',
    lastUsed: 'Elsewhere',
};

describe('handleActionButtonPress', () => {
    const searchHash = 1;
    beforeAll(() => {
        Onyx.merge(
            `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`,
            // @ts-expect-error: Allow partial record in snapshot update for testing
            mockSnapshotForItem,
        );
        Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, mockLastPaymentMethod);
    });

    const snapshotReport = mockSnapshotForItem?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${mockReportItemWithHold.reportID}`] ?? {};
    const snapshotPolicy = mockSnapshotForItem?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${mockReportItemWithHold.policyID}`] ?? {};

    test('Should navigate to item when report has one transaction on hold', () => {
        const goToItem = jest.fn(() => {});
        // @ts-expect-error: Allow partial record in snapshot update for testing
        handleActionButtonPress(searchHash, mockReportItemWithHold, goToItem, false, snapshotReport, snapshotPolicy, mockLastPaymentMethod);
        expect(goToItem).toHaveBeenCalledTimes(1);
    });

    test('Should not navigate to item when the hold is removed', () => {
        const goToItem = jest.fn(() => {});
        // @ts-expect-error: Allow partial record in snapshot update for testing
        handleActionButtonPress(searchHash, updatedMockReportItem, goToItem, false, snapshotReport, snapshotPolicy, mockLastPaymentMethod);
        expect(goToItem).toHaveBeenCalledTimes(0);
    });

    test('Should run goToItem callback when user is in mobile selection mode', () => {
        const goToItem = jest.fn(() => {});
        // @ts-expect-error: Allow partial record in snapshot update for testing
        handleActionButtonPress(searchHash, updatedMockReportItem, goToItem, true, snapshotReport, snapshotPolicy, mockLastPaymentMethod);
        expect(goToItem).toHaveBeenCalledTimes(1);
    });
});
