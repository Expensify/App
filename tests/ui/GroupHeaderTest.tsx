import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import GroupHeader from '@components/Search/SearchList/ListItem/GroupHeader';
import type {GroupHeaderItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {GROUP_ITEM_TYPES} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchActionsContextValue, SearchStateContextValue, SelectedTransactions} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildCategoryGroup, buildTransactionRow} from '../utils/collections/searchListItems';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

/** The header renders its group's own sub-header; capturing its props is how the derived checkbox state and its press are read. */
type CapturedHeaderProps = {isSelectAllChecked: boolean; isIndeterminate: boolean; onCheckboxPress: () => void};
const capturedSubHeader: {current: CapturedHeaderProps | null} = {current: null};
jest.mock('@components/Search/SearchList/ListItem/CategoryListItemHeader', () => ({
    __esModule: true,
    default: (props: CapturedHeaderProps) => {
        capturedSubHeader.current = props;
        return null;
    },
}));

const checkboxState = () => ({isSelectAllChecked: capturedSubHeader.current?.isSelectAllChecked, isIndeterminate: capturedSubHeader.current?.isIndeterminate});

const GROUP_KEY = 'Advertising';

const children: TransactionListItemType[] = [buildTransactionRow(1, '1'), buildTransactionRow(2, '2'), buildTransactionRow(3, '3')];

/** A selection entry per key. Only `isSelected` is read here, so any real entry shape will do. */
const select = (...keys: string[]): SelectedTransactions => Object.fromEntries(keys.map((key) => [key, mapEmptyReportToSelectedEntry(buildCategoryGroup(key))[1]]));

const buildHeaderItem = (rows: TransactionListItemType[]): GroupHeaderItemType => ({
    ...buildCategoryGroup(GROUP_KEY, rows),
    listItemType: GROUP_ITEM_TYPES.GROUP_HEADER,
    keyForList: `header_${GROUP_KEY}`,
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
    selectedReports: [],
    selectedTransactionIDs: [],
    selectedTransactions: {},
    excludedTransactions: {},
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldShowFiltersBarLoading: false,
    currentSimilarSearchHash: -1,
    suggestedSearches: getEmptyObject<SearchStateContextValue['suggestedSearches']>(),
    sortedReportIDs: [],
    hasSelectedTransactions: false,
} satisfies SearchStateContextValue;

const baseActions = {
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

function renderGroupHeader(rows: TransactionListItemType[], selection: SelectedTransactions, onCheckboxPress = jest.fn()) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <ScreenWrapperStatusContext value={{didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false}}>
                <MockSearchContextProvider
                    state={{...baseState, selectedTransactions: selection}}
                    actions={baseActions}
                >
                    <GroupHeader
                        item={buildHeaderItem(rows)}
                        groupBy={CONST.SEARCH.GROUP_BY.CATEGORY}
                        searchType={CONST.SEARCH.DATA_TYPES.EXPENSE}
                        canSelectMultiple
                        isExpanded={false}
                        onToggle={jest.fn()}
                        onSelectRow={jest.fn()}
                        onCheckboxPress={onCheckboxPress}
                        isFirstItem
                        isLastItem={false}
                    />
                </MockSearchContextProvider>
            </ScreenWrapperStatusContext>
        </ComposeProviders>,
    );
    return onCheckboxPress;
}

describe('GroupHeader', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        capturedSubHeader.current = null;
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

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('reads indeterminate when some of the rows it carries are checked', () => {
        renderGroupHeader(children, select('1'));
        expect(checkboxState()).toEqual({isSelectAllChecked: false, isIndeterminate: true});
    });

    it('reads checked when every row it carries is checked', () => {
        renderGroupHeader(children, select('1', '2', '3'));
        expect(checkboxState()).toEqual({isSelectAllChecked: true, isIndeterminate: false});
    });

    it('reads unchecked when none of the rows it carries are', () => {
        renderGroupHeader(children, {});
        expect(checkboxState()).toEqual({isSelectAllChecked: false, isIndeterminate: false});
    });

    it('answers from its own key while it carries no rows, since there is nothing else to ask', () => {
        renderGroupHeader([], select(GROUP_KEY));
        expect(checkboxState()).toEqual({isSelectAllChecked: true, isIndeterminate: false});
    });

    it('hands the toggle the rows it carries, so a header deselect can reach them', () => {
        const onCheckboxPress = renderGroupHeader(children, select('1', '2', '3'));
        act(() => capturedSubHeader.current?.onCheckboxPress());
        expect(onCheckboxPress).toHaveBeenCalledWith(expect.objectContaining({keyForList: GROUP_KEY}), children);
    });

    it('hands the toggle no rows while it carries none, which is what makes the group its own unit', () => {
        const onCheckboxPress = renderGroupHeader([], select(GROUP_KEY));
        act(() => capturedSubHeader.current?.onCheckboxPress());
        expect(onCheckboxPress).toHaveBeenCalledWith(expect.objectContaining({keyForList: GROUP_KEY}), []);
    });
});
