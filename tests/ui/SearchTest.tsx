import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React, {act} from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {SearchContextProvider} from '@components/Search/SearchContext';
import TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import type {TransactionGroupListItemProps, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    getSections: jest.fn(() => []),
    isCorrectSearchUserName: jest.fn(() => true),
}));

const mockTransaction: TransactionListItemType = {
    accountID: 1,
    amount: 0,
    canDelete: true,
    canHold: true,
    canUnhold: false,
    category: '',
    convertedAmount: 1284,
    convertedCurrency: 'USD',
    created: '2025-09-19',
    currency: 'USD',
    managerID: 1,
    merchant: '(none)',
    modifiedAmount: -1284,
    modifiedCreated: '2025-09-07',
    modifiedCurrency: 'USD',
    modifiedMerchant: 'The Home Depot',
    policyID: '06F34677820A4D07',
    reportID: '515146912679679',
    reportType: 'expense',
    tag: '',
    transactionID: '1',
    transactionThreadReportID: '2925191332104975',
    transactionType: 'cash',
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
};

const mockEmptyReport: TransactionReportGroupListItemType = {
    accountID: 1,
    chatReportID: '4735435600700077',
    chatType: undefined,
    created: '2025-09-19 20:00:47',
    currency: 'USD',
    isOneTransactionReport: false,
    isOwnPolicyExpenseChat: false,
    isPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    managerID: 1,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 1,
    parentReportActionID: '2454187434077044186',
    parentReportID: '4735435600700077',
    policyID: '06F34677820A4D07',
    private_isArchived: '',
    reportID: '515146912679679',
    reportName: 'Expense Report #515146912679679',
    stateNum: 1,
    statusNum: 1,
    total: 0,
    type: 'expense',
    unheldTotal: 0,
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
    transactions: [],
    groupedBy: 'reports',
    keyForList: '515146912679679',
    action: CONST.SEARCH.ACTION_TYPES.VIEW,
};

const mockNonEmptyReport: TransactionReportGroupListItemType = {
    accountID: 2,
    chatReportID: '4735435600700078',
    chatType: undefined,
    created: '2025-09-20 10:00:00',
    currency: 'USD',
    isOneTransactionReport: false,
    isOwnPolicyExpenseChat: false,
    isPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    managerID: 2,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 2,
    parentReportActionID: '2454187434077044187',
    parentReportID: '4735435600700078',
    policyID: '06F34677820A4D07',
    private_isArchived: '',
    reportID: '515146912679680',
    reportName: 'Expense Report #515146912679680',
    stateNum: 1,
    statusNum: 1,
    total: -1284,
    type: 'expense',
    unheldTotal: -1284,
    from: {
        accountID: 2,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_16.png',
        displayName: 'Test User',
    },
    to: {
        accountID: 2,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_16.png',
        displayName: 'Test User',
    },
    transactions: [
        {
            ...mockTransaction,
            transactionID: '2',
            reportID: '515146912679680',
            keyForList: '2',
        },
    ],
    groupedBy: 'reports',
    keyForList: '515146912679680',
    action: CONST.SEARCH.ACTION_TYPES.VIEW,
};

describe('Search - Empty Report Selection', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnSelectRow.mockClear();
        mockOnCheckboxPress.mockClear();
        return act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    const mockOnSelectRow = jest.fn();
    const mockOnCheckboxPress = jest.fn();

    const defaultProps: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
        item: mockEmptyReport,
        showTooltip: false,
        onSelectRow: mockOnSelectRow,
        onCheckboxPress: mockOnCheckboxPress,
        groupBy: CONST.SEARCH.GROUP_BY.REPORTS,
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

    it('should render an empty report with checkbox', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        // Then the empty report should be rendered with a checkbox
        expect(screen.getByRole(CONST.ROLE.CHECKBOX)).toBeTruthy();
        expect(screen.getByRole(CONST.ROLE.CHECKBOX)).not.toBeChecked();
        expect(screen.getByTestId('ReportSearchHeader')).toBeTruthy();
        expect(screen.getByTestId('TotalCell')).toBeTruthy();
        expect(screen.getByTestId('ActionCell')).toBeTruthy();
    });

    it('should call onCheckboxPress when checkbox is clicked on an empty report', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        // When clicking on the empty report checkbox
        const checkbox = screen.getByRole(CONST.ROLE.CHECKBOX);
        expect(checkbox).not.toBeChecked();

        fireEvent.press(checkbox);
        await waitForBatchedUpdatesWithAct();

        // Then onCheckboxPress should be called with the empty report and undefined (for groupBy reports)
        expect(mockOnCheckboxPress).toHaveBeenCalledTimes(1);
        expect(mockOnCheckboxPress).toHaveBeenCalledWith(mockEmptyReport, undefined);
    });

    it('should call onCheckboxPress multiple times when checkbox is clicked multiple times', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        const checkbox = screen.getByRole(CONST.ROLE.CHECKBOX);

        // First click
        fireEvent.press(checkbox);
        await waitForBatchedUpdatesWithAct();
        expect(mockOnCheckboxPress).toHaveBeenCalledTimes(1);

        // Second click
        fireEvent.press(checkbox);
        await waitForBatchedUpdatesWithAct();

        // Then onCheckboxPress should be called twice
        expect(mockOnCheckboxPress).toHaveBeenCalledTimes(2);
    });

    it('should not show expandable content for an empty report', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        // Empty reports should not have expandable transaction content
        // The AnimatedCollapsible content should not be visible
        const collapsibleContent = screen.queryByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID);

        // The collapsible content should not be rendered for empty reports
        expect(collapsibleContent).toBeNull();
    });

    it('should handle selecting both empty and non-empty reports', async () => {
        // First render and select an empty report
        const {unmount: unmountEmpty} = renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        const emptyCheckbox = screen.getByRole(CONST.ROLE.CHECKBOX);
        expect(emptyCheckbox).not.toBeChecked();

        fireEvent.press(emptyCheckbox);
        await waitForBatchedUpdatesWithAct();

        expect(mockOnCheckboxPress).toHaveBeenCalledTimes(1);
        expect(mockOnCheckboxPress).toHaveBeenCalledWith(mockEmptyReport, undefined);

        unmountEmpty();
        mockOnCheckboxPress.mockClear();

        // Render and select a non-empty report
        const nonEmptyProps: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
            ...defaultProps,
            item: mockNonEmptyReport,
        };

        const {unmount: unmountNonEmpty} = render(
            <TransactionGroupListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...nonEmptyProps}
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();

        const nonEmptyCheckbox = screen.getByRole(CONST.ROLE.CHECKBOX);
        expect(nonEmptyCheckbox).not.toBeChecked();

        fireEvent.press(nonEmptyCheckbox);
        await waitForBatchedUpdatesWithAct();

        expect(mockOnCheckboxPress).toHaveBeenCalledTimes(1);
        expect(mockOnCheckboxPress).toHaveBeenCalledWith(mockNonEmptyReport, undefined);

        unmountNonEmpty();
    });

    it('should track the number of checkbox presses for multiple selections', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        const checkbox = screen.getByRole(CONST.ROLE.CHECKBOX);

        for (let i = 1; i <= 3; i++) {
            fireEvent.press(checkbox);
            await waitForBatchedUpdatesWithAct();
            expect(mockOnCheckboxPress).toHaveBeenCalledTimes(i);
        }

        expect(mockOnCheckboxPress).toHaveBeenNthCalledWith(1, mockEmptyReport, undefined);
        expect(mockOnCheckboxPress).toHaveBeenNthCalledWith(2, mockEmptyReport, undefined);
        expect(mockOnCheckboxPress).toHaveBeenNthCalledWith(3, mockEmptyReport, undefined);
    });

    it('should show expandable content for non-empty reports', async () => {
        const nonEmptyProps: TransactionGroupListItemProps<TransactionReportGroupListItemType> = {
            ...defaultProps,
            item: mockNonEmptyReport,
        };

        render(
            <TransactionGroupListItem
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...nonEmptyProps}
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // Non-empty reports should have an expand button
        const expandButton = screen.getByLabelText('Expand');
        expect(expandButton).toBeTruthy();

        // Initially, the collapsible content should not be visible
        let collapsibleContent = screen.queryByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID);
        expect(collapsibleContent).toBeNull();

        // Click the expand button
        fireEvent.press(expandButton);
        await waitForBatchedUpdatesWithAct();

        // After expanding, the collapsible content should be visible
        collapsibleContent = screen.queryByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID);
        expect(collapsibleContent).toBeTruthy();

        // The button label should change to 'Collapse'
        const collapseButton = screen.getByLabelText('Collapse');
        expect(collapseButton).toBeTruthy();

        // Click the collapse button
        fireEvent.press(collapseButton);
        await waitForBatchedUpdatesWithAct();

        // The button label should change back to 'Expand'
        const expandButtonAgain = screen.getByLabelText('Expand');
        expect(expandButtonAgain).toBeTruthy();
    });

    it('should not show expand button for empty reports', async () => {
        renderTransactionGroupListItem();
        await waitForBatchedUpdatesWithAct();

        // Empty reports should have an expand button but it should be disabled
        const expandButton = screen.queryByLabelText('Expand');
        expect(expandButton).toBeTruthy();

        // The collapsible content should not be rendered for empty reports
        const collapsibleContent = screen.queryByTestId(CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID);
        expect(collapsibleContent).toBeNull();
    });
});
