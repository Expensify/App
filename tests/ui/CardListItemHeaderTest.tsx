import {act, fireEvent, render, screen, userEvent} from '@testing-library/react-native';

import AccountAvatarWithCardFeed from '@components/Avatar/connected/AccountAvatarWithCardFeed';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CardListItemHeader from '@components/Search/SearchList/ListItem/CardListItemHeader';
import type {TransactionCardGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchActionsContextValue, SearchStateContextValue} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
// These assertions cover header forwarding, while CardUtilsTest covers the real icon resolver.
jest.mock('@components/Avatar/connected/AccountAvatarWithCardFeed', () => jest.fn(() => null));

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

// SearchUIUtils builds this row from personal details and the corresponding SearchResults group.
const createCardItem = (overrides: Partial<TransactionCardGroupListItemType> = {}): TransactionCardGroupListItemType =>
    createMock<TransactionCardGroupListItemType>({
        groupedBy: CONST.SEARCH.GROUP_BY.CARD,
        accountID: 123,
        displayName: 'Alex Rivera',
        login: 'alex@example.com',
        keyForList: 'group_123',
        transactions: [],
        count: 7,
        total: 12345,
        currency: 'USD',
        cardID: 42,
        bank: ' cards_2267989_ccupload666 ',
        cardName: 'Travel',
        lastFourPAN: '4242',
        formattedCardName: 'Travel card',
        formattedFeedName: 'Imported feed',
        ...overrides,
    });

function renderHeader(item: TransactionCardGroupListItemType, props: Partial<Omit<Parameters<typeof CardListItemHeader>[0], 'card'>> = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={mockSearchStateContext}
                actions={mockSearchActionsContext}
            >
                <CardListItemHeader
                    card={item}
                    canSelectMultiple
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
}

describe('CardListItemHeader', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => {
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth: true}));
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
    ] as const)('emits the original row once with checkbox state $checked', async ({isSelectAllChecked, isIndeterminate, checked}) => {
        // Given selection state belongs to the parent, so the header must preserve it.
        const item = createCardItem();
        const selectItem = jest.fn<void, [TransactionCardGroupListItemType]>();
        renderHeader(item, {onCheckboxPress: selectItem, isSelectAllChecked, isIndeterminate});
        await waitForBatchedUpdatesWithAct();
        // When the real checkbox is pressed, its event reaches the header callback.
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
        // Then consumers receive the original row, including all its group data.
        expect(selectItem).toHaveBeenCalledTimes(1);
        const selectedItem = selectItem.mock.calls.at(0)?.[0];
        expect(selectedItem).toBeDefined();
        expect(selectedItem).toBe(item);
    });

    it.each([false, undefined])('omits selection when canSelectMultiple is %s', async (canSelectMultiple) => {
        // Given some search modes do not allow selection.
        const item = createCardItem();
        // When the header renders in such a mode.
        renderHeader(item, {canSelectMultiple});
        await waitForBatchedUpdatesWithAct();
        // Then no checkbox offers an unavailable action.
        expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it.each(['header', 'row'] as const)('blocks selection disabled by the %s', async (disabledBy) => {
        // Given either the group or its parent can disable selection.
        const item = createCardItem({isDisabledCheckbox: disabledBy === 'row'});
        const selectItem = jest.fn<void, [TransactionCardGroupListItemType]>();
        renderHeader(item, {onCheckboxPress: selectItem, isDisabled: disabledBy === 'header'});
        await waitForBatchedUpdatesWithAct();
        // When a host press is attempted, userEvent respects the disabled control instead of calling composite handlers.
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
        await userEvent.setup().press(checkbox);
        // Then a disabled group cannot be selected.
        expect(selectItem).not.toHaveBeenCalled();
    });

    it('allows a checkbox without a callback', async () => {
        // Given the selection callback is optional.
        renderHeader(createCardItem());
        await waitForBatchedUpdatesWithAct();
        // When selection is pressed before a consumer attaches a callback.
        await userEvent.setup().press(screen.getByRole('checkbox'));
        // Then the header remains mounted without throwing.
        expect(screen.getByRole('checkbox')).toBeOnTheScreen();
    });

    it('keeps supported column order and duplicates while omitting unsupported columns', async () => {
        // Given MERCHANT is a valid search column that this group header does not implement.
        const item = createCardItem();
        // When callers place the total before the identifying column and repeat the total.
        renderHeader(item, {
            columns: [
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            ],
        });
        await waitForBatchedUpdatesWithAct();
        // Then only supported cells render, in caller order, including the repeated cell.
        const cells = screen.getAllByText(/^(\$123\.45|Travel card|7)$/);
        expect(cells).toHaveLength(4);
        expect(cells.at(0)).toBe(screen.getAllByText('$123.45').at(0));
        expect(cells.at(1)).toBe(screen.getByText('Travel card'));
        expect(cells.at(2)).toBe(screen.getByText('7'));
        expect(cells.at(3)).toBe(screen.getAllByText('$123.45').at(1));
        expect(screen.queryByText('Merchant')).toBeNull();
        expect(screen.getAllByText(/.+/)).toHaveLength(4);
    });

    it.each([undefined, []])('renders no wide cells for columns %s', async (columns) => {
        // Given wide headers take their visible cells solely from the column list.
        const item = createCardItem();
        // When no columns are requested.
        renderHeader(item, {columns});
        await waitForBatchedUpdatesWithAct();
        // Then neither identifying nor total cells are inserted as fallbacks.
        expect(screen.queryByText('Travel card')).toBeNull();
        expect(screen.queryByText('$123.45')).toBeNull();
        expect(screen.queryByText('7')).toBeNull();
    });

    it.each([true, false])('forwards the untouched bank text on wide layout %s', async (isLargeScreenWidth) => {
        // Given bank text may contain legacy prefixes or unrecognized characters.
        const item = createCardItem();
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth}));
        // When either avatar site renders in the real header.
        renderHeader(item, {columns: [CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD, CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED]});
        await waitForBatchedUpdatesWithAct();
        // Then the lower avatar receives the original text and account identity without normalization.
        expect(AccountAvatarWithCardFeed).toHaveBeenCalled();
        const avatarProps = jest.mocked(AccountAvatarWithCardFeed).mock.calls.at(-1)?.[0];
        expect(avatarProps).toBeDefined();
        expect(avatarProps?.cardFeed).toBe(item.bank);
        expect(avatarProps?.accountID).toBe(item.accountID);
        if (isLargeScreenWidth) {
            expect(avatarProps?.size).toBe(CONST.AVATAR_SIZE.SMALL);
            expect(screen.getByText('Imported feed')).toBeOnTheScreen();
        } else {
            expect(avatarProps?.size).toBeUndefined();
            expect(screen.getByText('Alex Rivera')).toBeOnTheScreen();
            expect(screen.getByText('$123.45')).toBeOnTheScreen();
        }
        expect(screen.getByText('Travel card')).toBeOnTheScreen();
    });

    it('keeps the narrow expand action and total beside the cardholder details', async () => {
        // Given narrow search results expand the group from the header itself.
        const item = createCardItem();
        const expandGroup = jest.fn();
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth: false}));
        // When the user expands the real narrow header.
        renderHeader(item, {onDownArrowClick: expandGroup, columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Expand'));
        // Then the callback fires once and narrow content does not depend on the wide column list.
        expect(expandGroup).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Alex Rivera')).toBeOnTheScreen();
        expect(screen.getByText('Travel card')).toBeOnTheScreen();
        expect(screen.getByText('$123.45')).toBeOnTheScreen();
        expect(screen.queryByText('7')).toBeNull();
    });
});
