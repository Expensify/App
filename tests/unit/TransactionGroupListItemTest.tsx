import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React, {act} from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {SearchContextProvider} from '@components/Search/SearchContext';
import TransactionGroupListItem from '@src/components/SelectionListWithSections/Search/TransactionGroupListItem';
import type {TransactionGroupListItemProps, TransactionListItemType, TransactionReportGroupListItemType} from '@src/components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
    handleActionButtonPress: jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    getSections: jest.fn(() => []),
    isCorrectSearchUserName: jest.fn(() => true),
    getTableMinWidth: jest.fn(() => 0),
    getSuggestedSearches: jest.fn(() => ({})),
}));

const mockTransaction: TransactionListItemType = {
    accountID: 1,
    amount: 0,
    category: '',
    groupAmount: 1284,
    groupCurrency: 'USD',
    created: '2025-09-19',
    submitted: '2025-09-19',
    approved: undefined,
    posted: undefined,
    exported: undefined,
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
    shouldShowYearSubmitted: false,
    shouldShowYearApproved: false,
    shouldShowYearPosted: false,
    shouldShowYearExported: false,
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
};

const mockReport: TransactionReportGroupListItemType = {
    accountID: 1,
    chatReportID: '4735435600700077',
    chatType: undefined,
    created: '2025-09-19 20:00:47',
    submitted: '2025-09-19',
    approved: undefined,
    exported: undefined,
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
    shouldShowYearSubmitted: false,
    shouldShowYearApproved: false,
    shouldShowYearExported: false,
    action: 'view',
    transactions: [],
    groupedBy: 'expense-report',
    keyForList: '515146912679679',
};

const createFakeTransactions = (numberOfTransactions: number): TransactionListItemType[] => {
    return Array.from({length: numberOfTransactions}, (_, index) => ({
        ...mockTransaction,
        transactionID: index.toString(),
    }));
};

const createFakeReport = (numberOfTransactions: number): TransactionReportGroupListItemType => {
    return {
        ...mockReport,
        transactions: createFakeTransactions(numberOfTransactions),
    };
};

describe('TransactionGroupListItem', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    const mockOnSelectRow = jest.fn();
    const numberOfTransactions = 21;
    const report = createFakeReport(numberOfTransactions);

    const defaultProps: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
        item: report,
        showTooltip: false,
        onSelectRow: mockOnSelectRow,
        searchType: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        canSelectMultiple: true,
    };

    function TestWrapper({children}: {children: React.ReactNode}) {
        return (
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <ScreenWrapper testID="test">
                    <SearchContextProvider>{children}</SearchContextProvider>
                </ScreenWrapper>
            </ComposeProviders>
        );
    }

    const renderTransactionGroupListItem = () => {
        return render(
            <TransactionGroupListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
            />,
            {wrapper: TestWrapper},
        );
    };

    const expand = async () => {
        const expandButton = screen.getByLabelText('Expand');
        fireEvent.press(expandButton);
        await waitForBatchedUpdatesWithAct();
    };

    const collapse = async () => {
        const collapseButton = screen.getByLabelText('Collapse');
        fireEvent.press(collapseButton);
        await waitForBatchedUpdatesWithAct();
    };

    const showMore = async () => {
        const showMoreButton = screen.getByText('Show more');
        fireEvent.press(showMoreButton);
        await waitForBatchedUpdatesWithAct();
    };

    const getVisibleTransactionRowsCount = () => screen.getAllByTestId('transaction-item-row').length;

    it('should render TransactionGroupListItem with groupBy reports', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByRole(CONST.ROLE.CHECKBOX)).toBeTruthy();
        expect(screen.getByRole(CONST.ROLE.CHECKBOX)).not.toBeChecked();
        expect(screen.getByTestId('ReportSearchHeader')).toBeTruthy();
        expect(screen.getByTestId('TotalCell')).toBeTruthy();
        expect(screen.getByTestId('ActionCell')).toBeTruthy();
        expect(screen.getByLabelText('Expand')).toBeTruthy();
        expect(screen.queryByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID)).toBeNull();
    });

    it(`should toggle expansion state with ${CONST.TRANSACTION.RESULTS_PAGE_SIZE} items when Expand is triggered`, async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();
        await expand();

        expect(screen.getByLabelText('Collapse')).toBeTruthy();
        expect(screen.getByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID)).toBeTruthy();

        expect(getVisibleTransactionRowsCount()).toBe(CONST.TRANSACTION.RESULTS_PAGE_SIZE);
    });

    it('should show more transactions and hide button when show more button is triggered and limit of transactions is reached', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();
        await expand();
        await showMore();

        expect(getVisibleTransactionRowsCount()).toBe(numberOfTransactions);

        const showMoreButtonSecond = screen.queryByText('Show more');
        expect(showMoreButtonSecond).toBeNull();
    });

    it('should collapse the list when Collapse is triggered', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();
        await expand();
        await collapse();

        expect(screen.getByLabelText('Expand')).toBeTruthy();
    });

    it(`should show only ${CONST.TRANSACTION.RESULTS_PAGE_SIZE} transactions when collapsed and expanded again`, async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();
        await expand();
        await showMore();
        await collapse();
        await expand();

        expect(getVisibleTransactionRowsCount()).toBe(CONST.TRANSACTION.RESULTS_PAGE_SIZE);
        expect(screen.getByText('Show more')).toBeTruthy();
    });

    it('should pass onDEWModalOpen callback to ReportListItemHeader for SUBMIT action', async () => {
        const mockOnDEWModalOpen = jest.fn();
        const reportWithSubmitAction: TransactionReportGroupListItemType = {
            ...report,
            action: 'submit',
            hash: 0,
        };

        const propsWithDEWCallback: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
            ...defaultProps,
            item: reportWithSubmitAction,
            onDEWModalOpen: mockOnDEWModalOpen,
        };

        render(
            <TransactionGroupListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...propsWithDEWCallback}
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // Verify that the component renders with the callback prop
        expect(screen.getByTestId('ReportSearchHeader')).toBeTruthy();
    });

    it('should pass onDEWModalOpen callback to ReportListItemHeader for APPROVE action', async () => {
        const mockOnDEWModalOpen = jest.fn();
        const reportWithApproveAction: TransactionReportGroupListItemType = {
            ...report,
            action: 'approve',
            hash: 0,
        };

        const propsWithDEWCallback: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
            ...defaultProps,
            item: reportWithApproveAction,
            onDEWModalOpen: mockOnDEWModalOpen,
        };

        render(
            <TransactionGroupListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...propsWithDEWCallback}
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // Verify that the component renders with the callback prop
        expect(screen.getByTestId('ReportSearchHeader')).toBeTruthy();
    });
});
