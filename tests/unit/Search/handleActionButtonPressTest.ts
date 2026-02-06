/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import {handleActionButtonPress} from '@libs/actions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethod, Policy, Report, SearchResults} from '@src/types/onyx';

jest.mock('@src/components/ConfirmedRoute.tsx');

const mockReportItemWithHold = {
    groupedBy: 'expense-report',
    shouldAnimateInHighlight: false,
    accountID: 1206,
    action: 'approve',
    allActions: ['approve'],
    chatReportID: '2108006919825366',
    created: '2024-12-04 23:18:33',
    submitted: '2024-12-04',
    approved: undefined,
    posted: undefined,
    exported: undefined,
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
    shouldShowYear: false,
    shouldShowYearSubmitted: false,
    shouldShowYearApproved: false,
    shouldShowYearPosted: false,
    shouldShowYearExported: false,
    transactions: [
        {
            report: {
                reportID: '1350959062018695',
            },
            policy: {
                type: 'team',
                id: '48D7178DE42EE9F9',
                role: 'admin',
                owner: 'apb@apb.com',
                name: 'Policy',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            },
            reportAction: {
                reportActionID: '3042630993757922770',
                actionName: 'IOU',
                created: '2024-12-04',
            },
            holdReportAction: {
                reportActionID: '2101164516657897891',
                actionName: 'HOLD',
                created: '2024-12-05',
            },
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
            amount: -1200,
            category: '',
            comment: {
                comment: '',
                hold: '2101164516657897891',
            },
            created: '2024-12-04',
            currency: 'USD',
            hasEReceipt: false,
            managerID: 1206,
            merchant: 'Qatar',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            submitted: '2024-12-04',
            approved: undefined,
            posted: undefined,
            exported: undefined,
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            reportType: 'expense',
            tag: '',
            transactionID: '1049531721038862176',
            transactionThreadReportID: '2957345659269055',
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
            shouldShowYearSubmitted: false,
            shouldShowYearApproved: false,
            shouldShowYearPosted: false,
            shouldShowYearExported: false,
            keyForList: '1049531721038862176',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            groupAmount: 1200,
            groupCurrency: 'USD',
        },
        {
            report: {
                reportID: '1350959062018695',
            },
            policy: {
                type: 'team',
                id: '48D7178DE42EE9F9',
                role: 'admin',
                owner: 'apb@apb.com',
                name: 'Policy',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            },
            reportAction: {
                reportActionID: '3042630993757922770',
                actionName: 'IOU',
                created: '2024-12-04',
            },
            holdReportAction: undefined,
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
            amount: -12300,
            category: '',
            comment: {
                comment: '',
            },
            created: '2024-12-04',
            submitted: '2024-12-04',
            approved: undefined,
            posted: undefined,
            exported: undefined,
            currency: 'USD',
            hasEReceipt: false,
            merchant: 'Forbes',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            tag: '',
            transactionID: '5345995386715609966',
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
            shouldShowYearSubmitted: false,
            shouldShowYearApproved: false,
            shouldShowYearPosted: false,
            shouldShowYearExported: false,
            keyForList: '5345995386715609966',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            groupAmount: 1200,
            groupCurrency: 'USD',
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
        handleActionButtonPress({
            hash: searchHash,
            item: mockReportItemWithHold,
            goToItem,
            snapshotReport: snapshotReport as Report,
            snapshotPolicy: snapshotPolicy as Policy,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
        });
        expect(goToItem).toHaveBeenCalledTimes(1);
    });

    test('Should not navigate to item when the hold is removed', () => {
        const goToItem = jest.fn(() => {});
        handleActionButtonPress({
            hash: searchHash,
            item: updatedMockReportItem,
            goToItem,
            snapshotReport: snapshotReport as Report,
            snapshotPolicy: snapshotPolicy as Policy,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
        });
        expect(goToItem).toHaveBeenCalledTimes(0);
    });
});
