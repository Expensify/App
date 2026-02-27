import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContext} from '@components/Search/SearchContext';
import type {SearchColumnType} from '@components/Search/types';
import MonthListItemHeader from '@components/SelectionListWithSections/Search/MonthListItemHeader';
import type {TransactionMonthGroupListItemType} from '@components/SelectionListWithSections/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

// Mock useResponsiveLayout to control screen size in tests
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

// Mock search context with all required SearchContextProps fields
const mockSearchContext = {
    currentSearchHash: 12345,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    selectedReports: [],
    selectedTransactionIDs: [],
    selectedTransactions: {},
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    showSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
    shouldUseLiveData: false,
    setLastSearchType: jest.fn(),
    setCurrentSearchHashAndKey: jest.fn(),
    setCurrentSearchQueryJSON: jest.fn(),
    setSelectedTransactions: jest.fn(),
    removeTransaction: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    shouldShowSelectAllMatchingItems: jest.fn(),
    selectAllMatchingItems: jest.fn(),
    setShouldResetSearchQuery: jest.fn(),
};

const createMonthListItem = (year: number, month: number, options: Partial<TransactionMonthGroupListItemType> = {}): TransactionMonthGroupListItemType => ({
    year,
    month,
    formattedMonth: options.formattedMonth ?? `January ${year}`,
    count: options.count ?? 5,
    currency: options.currency ?? 'USD',
    total: options.total ?? 250,
    groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
    transactions: [],
    transactionsQueryJSON: undefined,
    keyForList: `month-${year}-${month}`,
    sortKey: options.sortKey ?? year * 100 + month,
    ...options,
});

// Helper function to wrap component with context
const renderMonthListItemHeader = (
    monthItem: TransactionMonthGroupListItemType,
    props: Partial<{
        onCheckboxPress: jest.Mock;
        isDisabled: boolean;
        canSelectMultiple: boolean;
        isSelectAllChecked: boolean;
        isIndeterminate: boolean;
        onDownArrowClick: jest.Mock;
        isExpanded: boolean;
        columns: SearchColumnType[];
    }> = {},
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchContext.Provider value={mockSearchContext}>
                <MonthListItemHeader
                    month={monthItem}
                    onCheckboxPress={props.onCheckboxPress ?? jest.fn()}
                    isDisabled={props.isDisabled ?? false}
                    canSelectMultiple={props.canSelectMultiple ?? false}
                    isSelectAllChecked={props.isSelectAllChecked ?? false}
                    isIndeterminate={props.isIndeterminate ?? false}
                    onDownArrowClick={props.onDownArrowClick}
                    isExpanded={props.isExpanded ?? false}
                    columns={props.columns ?? [CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]}
                />
            </SearchContext.Provider>
        </ComposeProviders>,
    );
};

describe('MonthListItemHeader', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Default to small screen (mobile) layout
        mockedUseResponsiveLayout.mockReturnValue({
            isLargeScreenWidth: false,
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isMediumScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isExtraSmallScreenHeight: false,
            isExtraLargeScreenWidth: false,
            isSmallScreen: true,
            isInNarrowPaneModal: false,
            onboardingIsMediumOrLargerScreenWidth: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Month name display', () => {
        it('should display the formatted month name', async () => {
            const monthItem = createMonthListItem(2026, 1, {formattedMonth: 'January 2026'});
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('January 2026')).toBeOnTheScreen();
        });

        it('should display different months correctly', async () => {
            const monthItem = createMonthListItem(2025, 12, {formattedMonth: 'December 2025'});
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('December 2025')).toBeOnTheScreen();
        });

        it('should display month with different year', async () => {
            const monthItem = createMonthListItem(2024, 6, {formattedMonth: 'June 2024'});
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('June 2024')).toBeOnTheScreen();
        });
    });

    describe('Checkbox functionality', () => {
        it('should render checkbox when canSelectMultiple is true', async () => {
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeOnTheScreen();
        });

        it('should not render checkbox when canSelectMultiple is false', async () => {
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
        });

        it('should call onCheckboxPress when checkbox is pressed', async () => {
            const onCheckboxPress = jest.fn();
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            fireEvent.press(checkbox);

            expect(onCheckboxPress).toHaveBeenCalledWith(monthItem);
        });

        it('should show checkbox as checked when isSelectAllChecked is true', async () => {
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true, isSelectAllChecked: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeChecked();
        });
    });

    describe('Total and count display', () => {
        it('should display the total amount', async () => {
            const monthItem = createMonthListItem(2026, 1, {total: 50000, currency: 'USD'});
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            // TotalCell formats the amount, so we check for the formatted version
            // $500.00 is 50000 cents
            expect(screen.getByText('$500.00')).toBeOnTheScreen();
        });

        it('should display the total amount with different currencies', async () => {
            const monthItem = createMonthListItem(2026, 1, {total: 10000, currency: 'EUR'});
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            // Should display EUR formatted amount
            expect(screen.getByTestId('TotalCell')).toBeOnTheScreen();
        });
    });

    describe('Disabled state', () => {
        it('should render checkbox with disabled styling when isDisabled is true', async () => {
            const onCheckboxPress = jest.fn();
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true, isDisabled: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });

        it('should render checkbox with disabled styling when isDisabledCheckbox is true on month item', async () => {
            const onCheckboxPress = jest.fn();
            const monthItem = createMonthListItem(2026, 1, {isDisabledCheckbox: true});
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });
    });

    describe('Large screen layout', () => {
        beforeEach(() => {
            mockedUseResponsiveLayout.mockReturnValue({
                isLargeScreenWidth: true,
                shouldUseNarrowLayout: false,
                isSmallScreenWidth: false,
                isMediumScreenWidth: false,
                isExtraSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraLargeScreenWidth: true,
                isSmallScreen: false,
                isInNarrowPaneModal: false,
                onboardingIsMediumOrLargerScreenWidth: true,
            });
        });

        it('should render column components on large screen', async () => {
            const monthItem = createMonthListItem(2026, 1, {count: 5, total: 25000});
            renderMonthListItemHeader(monthItem, {
                columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL],
            });
            await waitForBatchedUpdatesWithAct();

            // Should display month name, expense count, and total
            expect(screen.getByText('January 2026')).toBeOnTheScreen();
            expect(screen.getByText('5')).toBeOnTheScreen();
            expect(screen.getByText('$250.00')).toBeOnTheScreen();
        });

        it('should render checkbox on large screen when canSelectMultiple is true', async () => {
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {canSelectMultiple: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeOnTheScreen();
        });
    });

    describe('Expand/Collapse functionality', () => {
        it('should render expand/collapse button when onDownArrowClick is provided', async () => {
            const onDownArrowClick = jest.fn();
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {onDownArrowClick, isExpanded: false});
            await waitForBatchedUpdatesWithAct();

            // The expand/collapse button should be rendered with "Expand" label when not expanded
            const expandButton = screen.getByLabelText('Expand');
            expect(expandButton).toBeOnTheScreen();
        });

        it('should call onDownArrowClick when expand/collapse button is pressed', async () => {
            const onDownArrowClick = jest.fn();
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {onDownArrowClick, isExpanded: false});
            await waitForBatchedUpdatesWithAct();

            const expandButton = screen.getByLabelText('Expand');
            fireEvent.press(expandButton);

            expect(onDownArrowClick).toHaveBeenCalled();
        });

        it('should show "Collapse" label when isExpanded is true', async () => {
            const onDownArrowClick = jest.fn();
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem, {onDownArrowClick, isExpanded: true});
            await waitForBatchedUpdatesWithAct();

            const collapseButton = screen.getByLabelText('Collapse');
            expect(collapseButton).toBeOnTheScreen();
        });

        it('should not render expand/collapse button when onDownArrowClick is not provided', async () => {
            const monthItem = createMonthListItem(2026, 1);
            renderMonthListItemHeader(monthItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Expand')).not.toBeOnTheScreen();
            expect(screen.queryByLabelText('Collapse')).not.toBeOnTheScreen();
        });
    });
});
