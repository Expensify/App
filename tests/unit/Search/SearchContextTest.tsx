import {renderHook} from '@testing-library/react-native';
import React, {act} from 'react';
import {SearchContextProvider, useSearchContext} from '@components/Search/SearchContext';
import type {SelectedTransactionInfo} from '@components/Search/types';
import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';

const mockSelectedTransaction: SelectedTransactionInfo = {
    action: 'approve',
    canHold: true,
    isHeld: false,
    canSplit: false,
    hasBeenSplit: false,
    canUnhold: false,
    canChangeReport: true,
    isSelected: true,
    canDelete: true,
    canReject: false,
    policyID: '06F34677820A4D07',
    reportID: '515146912679679',
    amount: 0,
    groupAmount: 1284,
    groupCurrency: 'USD',
    currency: 'USD',
    ownerAccountID: 1,
} as const;

const mockTransaction = {
    accountID: 1,
    amount: 0,
    canDelete: true,
    category: '',
    groupAmount: 1284,
    groupCurrency: 'USD',
    created: '2025-09-19',
    currency: 'USD',
    policy: {
        id: '06F34677820A4D07',
        type: 'team',
        role: 'admin',
        owner: 'test@test.com',
        name: 'Policy',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: true,
    },
    reportAction: {
        reportActionID: '2454187434077044186',
        actionName: 'IOU',
        created: '2025-09-19',
    },
    holdReportAction: undefined,
    merchant: '(none)',
    modifiedAmount: -1284,
    modifiedCreated: '2025-09-07',
    modifiedCurrency: 'USD',
    modifiedMerchant: 'The Home Depot',
    policyID: '06F34677820A4D07',
    reportID: '515146912679679',
    tag: '',
    transactionID: '1',
    action: 'approve',
    allActions: ['approve'],
    formattedFrom: 'Main Applause QA',
    formattedTo: 'Main Applause QA',
    formattedTotal: -1284,
    formattedMerchant: 'The Home Depot',
    date: '2025-09-07',
    shouldShowMerchant: true,
    shouldShowYear: true,
    keyForList: '1',
    isAmountColumnWide: false,
    isTaxAmountColumnWide: false,
    shouldAnimateInHighlight: false,
    report: {
        reportID: '515146912679679',
    },
    from: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_15.png',
        displayName: 'Main Applause QA',
    },
    to: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_15.png',
        displayName: 'Main Applause QA',
    },
} as TransactionListItemType;

const mockReport = {
    accountID: 1,
    chatReportID: '4735435600700077',
    chatType: undefined,
    created: '2025-09-19 20:00:47',
    currency: 'USD',
    isOneTransactionReport: true,
    isOwnPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    managerID: 1,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 1,
    parentReportActionID: '2454187434077044186',
    parentReportID: '4735435600700077',
    policyID: '06F34677820A4D07',
    reportID: '515146912679679',
    reportName: 'Expense Report #515146912679679',
    stateNum: 1,
    statusNum: 1,
    total: -1284,
    type: 'expense',
    unheldTotal: -1284,
    from: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_15.png',
        displayName: 'Main Applause QA',
    },
    to: {
        accountID: 1,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_15.png',
        displayName: 'Main Applause QA',
    },
    shouldShowYear: false,
    action: 'view',
    transactions: [mockTransaction],
    groupedBy: 'expense-report',
    keyForList: '515146912679679',
} as TransactionReportGroupListItemType;

mockTransaction.report = mockReport;

const wrapper = ({children}: {children: React.ReactNode}) => <SearchContextProvider>{children}</SearchContextProvider>;

describe('SearchContext', () => {
    it('returns selectedReports for TransactionReportGroupListItem', () => {
        const {result} = renderHook(() => useSearchContext(), {wrapper});
        act(() => {
            result.current.setSelectedTransactions({[mockTransaction.keyForList]: mockSelectedTransaction}, [mockReport]);
        });
        const selectedReport = result.current.selectedReports.at(0);

        expect(selectedReport?.managerID).toEqual(1);
        expect(selectedReport?.ownerAccountID).toBe(1);
        expect(selectedReport?.parentReportActionID).toBe('2454187434077044186');
        expect(selectedReport?.parentReportID).toBe('4735435600700077');
    });

    it('returns selectedReports for TransactionListItemType', () => {
        const {result} = renderHook(() => useSearchContext(), {wrapper});
        act(() => {
            result.current.setSelectedTransactions({[mockTransaction.keyForList]: mockSelectedTransaction}, [mockTransaction]);
        });
        const selectedReport = result.current.selectedReports.at(0);

        expect(selectedReport?.managerID).toEqual(1);
        expect(selectedReport?.ownerAccountID).toBe(1);
        expect(selectedReport?.parentReportActionID).toBe('2454187434077044186');
        expect(selectedReport?.parentReportID).toBe('4735435600700077');
    });
});
