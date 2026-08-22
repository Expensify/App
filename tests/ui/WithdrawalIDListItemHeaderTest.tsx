import {act, render, screen} from '@testing-library/react-native';

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
    applySelection: jest.fn(),
    setSelectedReports: jest.fn(),
    removeTransaction: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    selectAllMatchingItems: jest.fn(),
    setShouldResetSearchQuery: jest.fn(),
    setSortedReportIDs: jest.fn(),
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

const renderHeader = (item: TransactionWithdrawalIDGroupListItemType, onDownArrowClick?: jest.Mock) =>
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

    describe('Cash back row', () => {
        it('should show the Cash back badge instead of the settlement status', async () => {
            // state 8 would otherwise render "Cleared", so cash back has to win over the settlement state.
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500, state: 8}));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Cash back')).toBeOnTheScreen();
            expect(screen.queryByText('Cleared')).not.toBeOnTheScreen();
        });

        it('should leave the Expenses cell blank rather than showing a count', async () => {
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('0')).not.toBeOnTheScreen();
        });

        it('should render the backend-signed total as a negative amount', async () => {
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('-$25.00')).toBeOnTheScreen();
        });
    });

    describe('Settlement row is unaffected', () => {
        it('should show the settlement status badge', async () => {
            renderHeader(createWithdrawalItem({count: 4, total: 40000, state: 8}));
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Cleared')).toBeOnTheScreen();
            expect(screen.queryByText('Cash back')).not.toBeOnTheScreen();
        });

        it('should show the expense count and a positive total', async () => {
            renderHeader(createWithdrawalItem({count: 4, total: 40000}));
            await waitForBatchedUpdatesWithAct();

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
            renderHeader(createWithdrawalItem({count: 4, total: 40000}), jest.fn());
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText('Expand')).toBeOnTheScreen();
        });

        it('should not render the arrow for a cash back row', async () => {
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Expand')).not.toBeOnTheScreen();
        });
    });
});
