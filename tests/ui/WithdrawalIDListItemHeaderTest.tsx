import {act, render, screen, userEvent} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {TransactionWithdrawalIDGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import WithdrawalIDListItemHeader from '@components/Search/SearchList/ListItem/WithdrawalIDListItemHeader';
import type {SearchActionsContextValue, SearchColumnType, SearchStateContextValue} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import React from 'react';
import Onyx from 'react-native-onyx';

import {makeSettlementGroup} from '../utils/ExpensifyCardStatementTestUtils';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const mockSearchStateContext = {
    currentSearchHash: 12345,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
    currentSearchResults: undefined,
    currentSearchTransactionsByReportID: new Map(),
    currentSearchViolations: undefined,
    currentSelectedTransactionReportID: undefined,
    selectedReports: [],
    selectedTransactionIDs: [],
    selectedTransactions: {},
    excludedTransactions: {},
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldShowFiltersBarLoading: false,
    shouldUseLiveData: false,
    currentSimilarSearchHash: -1,
    suggestedSearches: getSuggestedSearches(),
    sortedReportIDs: [],
    hasSelectedTransactions: false,
} satisfies SearchStateContextValue;

const mockSearchActionsContext = {
    setLastSearchType: jest.fn(),
    setCurrentSelectedTransactionReportID: jest.fn(),
    setSelectedTransactions: jest.fn(),
    getSelectedTransactions: jest.fn(() => ({})),
    getExcludedTransactions: () => ({}),
    getAreAllMatchingItemsSelected: () => false,
    applySelection: jest.fn(),
    setSelectedReports: jest.fn(),
    removeTransaction: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    selectAllMatchingItems: jest.fn(),
    setShouldResetSearchQuery: jest.fn(),
    setSortedReportIDs: jest.fn(),
    getSearchKeyForQuery: jest.fn(),
} satisfies SearchActionsContextValue;

const WIDE_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
];

/** A settlement row by default; pass `{isCashBack: true, count: 0, total: -2500}` for the cash back variant. */
const createWithdrawalItem = (overrides: Partial<SearchWithdrawalIDGroup> = {}): TransactionWithdrawalIDGroupListItemType => ({
    ...makeSettlementGroup(overrides),
    groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
    transactions: [],
    transactionsQueryJSON: undefined,
    formattedWithdrawalID: String(overrides.entryID ?? 123),
    keyForList: `group_${overrides.entryID ?? 123}`,
});

const renderHeader = (
    item: TransactionWithdrawalIDGroupListItemType,
    onDownArrowClick?: jest.Mock,
    props: Partial<Omit<Parameters<typeof WithdrawalIDListItemHeader>[0], 'withdrawalID'>> = {},
) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={mockSearchStateContext}
                actions={mockSearchActionsContext}
            >
                <WithdrawalIDListItemHeader
                    withdrawalID={item}
                    canSelectMultiple={false}
                    onDownArrowClick={onDownArrowClick}
                    isExpanded={false}
                    columns={WIDE_COLUMNS}
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );

describe('WithdrawalIDListItemHeader', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

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
            isInLandscapeMode: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it.each([
        {isSelectAllChecked: false, isIndeterminate: false, checked: false},
        {isSelectAllChecked: true, isIndeterminate: false, checked: true},
        {isSelectAllChecked: false, isIndeterminate: true, checked: 'mixed'},
    ] as const)('emits the original withdrawal once with checkbox state $checked', async ({isSelectAllChecked, isIndeterminate, checked}) => {
        // Given settlement selection must retain the complete producer row and parent-owned checkbox state.
        const item = createWithdrawalItem();
        const selectItem = jest.fn<void, [TransactionWithdrawalIDGroupListItemType]>();
        renderHeader(item, undefined, {canSelectMultiple: true, onCheckboxPress: selectItem, isSelectAllChecked, isIndeterminate});
        await waitForBatchedUpdatesWithAct();
        // When the real checkbox dispatches a selection event.
        const checkbox = screen.getByRole('checkbox');
        if (checked === 'mixed') {
            expect(checkbox).toBePartiallyChecked();
        } else if (checked) {
            expect(checkbox).toBeChecked();
        } else {
            expect(checkbox).not.toBeChecked();
            expect(checkbox).not.toBePartiallyChecked();
        }
        await userEvent.setup().press(checkbox);
        // Then the caller receives exactly the supplied object once.
        expect(selectItem).toHaveBeenCalledTimes(1);
        const selectedItem = selectItem.mock.calls.at(0)?.[0];
        expect(selectedItem).toBeDefined();
        expect(selectedItem).toBe(item);
    });

    it.each(['header', 'row'] as const)('blocks selection disabled by the %s', async (disabledBy) => {
        // Given either the row or its parent can disallow selection.
        const item = {...createWithdrawalItem(), isDisabledCheckbox: disabledBy === 'row'};
        const selectItem = jest.fn<void, [TransactionWithdrawalIDGroupListItemType]>();
        renderHeader(item, undefined, {canSelectMultiple: true, onCheckboxPress: selectItem, isDisabled: disabledBy === 'header'});
        await waitForBatchedUpdatesWithAct();
        // When a host press is attempted, userEvent respects the disabled control instead of calling composite handlers.
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
        await userEvent.setup().press(checkbox);
        // Then disabled settlements remain unselected.
        expect(selectItem).not.toHaveBeenCalled();
    });

    it.each([false, undefined])('omits selection when canSelectMultiple is %s', async (canSelectMultiple) => {
        // Given selection is unavailable in some search modes.
        const item = createWithdrawalItem();
        // When the header renders without multiple selection enabled.
        renderHeader(item, undefined, {canSelectMultiple});
        await waitForBatchedUpdatesWithAct();
        // Then it does not offer a checkbox.
        expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('allows selection without a callback', async () => {
        // Given the checkbox callback is optional.
        renderHeader(createWithdrawalItem(), undefined, {canSelectMultiple: true});
        await waitForBatchedUpdatesWithAct();
        // When selection is pressed before a callback is attached.
        await userEvent.setup().press(screen.getByRole('checkbox'));
        // Then the header remains available without throwing.
        expect(screen.getByRole('checkbox')).toBeOnTheScreen();
    });

    it('keeps supported column order and duplicates while omitting unsupported columns', async () => {
        // Given MERCHANT is a valid search column without a withdrawal-header cell.
        const item = createWithdrawalItem({entryID: 456, total: 12345, count: 7});
        // When the caller places totals before the withdrawal ID and requests a duplicate total.
        renderHeader(item, undefined, {
            columns: [
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            ],
        });
        await waitForBatchedUpdatesWithAct();
        // Then supported cells retain their order and unsupported columns add no fallback.
        const cells = screen.getAllByText(/^(\$123\.45|456|7)$/);
        expect(cells).toHaveLength(4);
        expect(cells.at(0)).toBe(screen.getAllByText('$123.45').at(0));
        expect(cells.at(1)).toBe(screen.getByText('456'));
        expect(cells.at(2)).toBe(screen.getByText('7'));
        expect(cells.at(3)).toBe(screen.getAllByText('$123.45').at(1));
        expect(screen.queryByText('Merchant')).toBeNull();
        expect(screen.getAllByText(/.+/)).toHaveLength(4);
    });

    it.each([undefined, []])('renders no wide cells for columns %s', async (columns) => {
        // Given wide headers render only the columns the caller requests.
        const item = createWithdrawalItem({entryID: 456, total: 12345, count: 7});
        // When no columns are requested.
        renderHeader(item, undefined, {columns});
        await waitForBatchedUpdatesWithAct();
        // Then no identifying, expense, or total cell appears by default.
        expect(screen.queryByText('456')).toBeNull();
        expect(screen.queryByText('7')).toBeNull();
        expect(screen.queryByText('$123.45')).toBeNull();
    });

    describe('Cash back row', () => {
        it('should show the Cash back badge instead of the settlement status', async () => {
            // Given a cash back row carrying state 8, which on its own would render "Cleared"
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500, state: 8}));
            await waitForBatchedUpdatesWithAct();

            // Then the cash back badge wins over the settlement state
            expect(screen.getByText('Cash back')).toBeOnTheScreen();
            expect(screen.queryByText('Cleared')).not.toBeOnTheScreen();
        });

        it('should leave the Expenses cell blank rather than showing a count', async () => {
            // Given a cash back row, which holds no expenses
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then the Expenses cell stays empty, since a 0 would read as an empty settlement
            expect(screen.queryByText('0')).not.toBeOnTheScreen();
        });

        it('should render the backend-signed total as a negative amount', async () => {
            // Given a cash back row whose total the backend already signs negative
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then the credit shows as a negative amount without the client flipping it again
            expect(screen.getByText('-$25.00')).toBeOnTheScreen();
        });
    });

    describe('Settlement row is unaffected', () => {
        it('should show the settlement status badge', async () => {
            // Given a cleared settlement row
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000, state: 8}));
            await waitForBatchedUpdatesWithAct();

            // Then it keeps its settlement status, so the cash back badge only applies to credits
            expect(screen.getByText('Cleared')).toBeOnTheScreen();
            expect(screen.queryByText('Cash back')).not.toBeOnTheScreen();
        });

        it('should show the expense count and a positive total', async () => {
            // Given a settlement row with 4 expenses
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000}));
            await waitForBatchedUpdatesWithAct();

            // Then its count and positive total are unchanged by the cash back handling
            expect(screen.getByText('4')).toBeOnTheScreen();
            expect(screen.getByText('$400.00')).toBeOnTheScreen();
        });
    });

    // The arrow only lives in this component on narrow layouts; on wide screens the parent owns the toggle.
    describe('Narrow layout expand arrow', () => {
        beforeEach(() => {
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
                isInLandscapeMode: false,
            });
        });

        it('should render the arrow for a settlement row', async () => {
            // Given a settlement row on a narrow layout, which has expenses to expand into
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000}), jest.fn());
            await waitForBatchedUpdatesWithAct();

            // Then the expand arrow is shown
            expect(screen.getByLabelText('Expand')).toBeOnTheScreen();
        });

        it('should not render the arrow for a cash back row', async () => {
            // Given a cash back row on a narrow layout, which has nothing to expand into
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then no expand arrow is shown
            expect(screen.queryByLabelText('Expand')).not.toBeOnTheScreen();
        });
    });
});
