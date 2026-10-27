import {render, renderHook, screen} from '@testing-library/react-native';

import GroupChildrenContainer from '@components/Search/SearchList/ListItem/GroupChildrenContainer';
import type {GroupChildrenContainerItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {GROUP_ITEM_TYPES} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchActionsContextValue, SearchStateContextValue, SelectedTransactions} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';

import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import {buildCategoryGroup, buildTransactionRow} from '../utils/collections/searchListItems';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';

jest.mock('@components/Search/SearchList/ListItem/GroupChildrenContent', () => ({__esModule: true, default: () => null}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

/** Holds the collapse animation partway, where the rows are still drawn whether or not the group is open. */
jest.mock('@hooks/useExpandCollapseAnimation', () => ({__esModule: true, default: () => ({isRendered: true, animatedStyle: {}, onLayout: jest.fn()})}));

const GROUP_KEY = 'Advertising';

const rows: TransactionListItemType[] = [buildTransactionRow(1, '1'), buildTransactionRow(2, '2')];

/** A selection entry per key. Only `isSelected` is read here, so any real entry shape will do. */
const select = (...keys: string[]): SelectedTransactions => Object.fromEntries(keys.map((key) => [key, mapEmptyReportToSelectedEntry(buildCategoryGroup(key))[1]]));

/** A group whose own search returned both of its expenses, while the group-by count still holds a third that left it. */
const group = {...buildCategoryGroup(GROUP_KEY, rows), count: 3, hasMoreTransactions: false};

const buildContainerItem = (): GroupChildrenContainerItemType => ({
    ...group,
    listItemType: GROUP_ITEM_TYPES.CHILDREN_CONTAINER,
    keyForList: `children_${GROUP_KEY}`,
    groupKeyForList: GROUP_KEY,
});

const baseState = {
    currentSearchHash: 12345,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    currentSearchTransactionsByReportID: new Map(),
    currentSearchViolations: {},
    currentSelectedTransactionReportID: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
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
    suggestedSearches: getEmptyObject<SearchStateContextValue['suggestedSearches']>(),
    sortedReportIDs: [],
    hasSelectedTransactions: false,
} satisfies SearchStateContextValue;

const baseActions = {
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

const drawContainer = (isExpanded: boolean, selection: SelectedTransactions) => (
    <MockSearchContextProvider
        state={{...baseState, selectedTransactions: selection}}
        actions={baseActions}
    >
        <GroupChildrenContainer
            item={buildContainerItem()}
            isExpanded={isExpanded}
            canSelectMultiple
            onSelectRow={jest.fn()}
            onCheckboxPress={jest.fn()}
        />
    </MockSearchContextProvider>
);

describe('GroupChildrenContainer', () => {
    beforeEach(() => {
        mockedUseResponsiveLayout.mockReturnValue({
            isInLandscapeMode: false,
            isLargeScreenWidth: true,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isMediumScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isExtraSmallScreenHeight: false,
            isExtraLargeScreenWidth: false,
            isSmallScreen: false,
            isInNarrowPaneModal: false,
            onboardingIsMediumOrLargerScreenWidth: false,
        });
    });

    it('keeps the checked background while its rows are still drawn as the group closes', () => {
        // Given an open group with both expenses it shows checked, which paints the checked background
        const checkedBackground = renderHook(() => useTheme()).result.current.activeComponentBG;
        const {rerender} = render(drawContainer(true, select('1', '2')));
        expect(screen.root).toHaveStyle({backgroundColor: checkedBackground});

        // When it closes, while the collapse animation still draws its rows
        rerender(drawContainer(false, select('1', '2')));

        // Then the background stays checked until the rows are gone, rather than switching to unchecked against the group-by count partway through the animation
        expect(screen.root).toHaveStyle({backgroundColor: checkedBackground});
    });
});
