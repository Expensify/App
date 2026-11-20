import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollOffsetContextProvider from '@components/ScrollOffsetContextProvider';
import ExpenseGroupedSearchView from '@components/Search/ExpenseGroupedSearchView';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {isGroupHeaderItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import type * as SearchActions from '@libs/actions/Search';
import {search} from '@libs/actions/Search';
import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback, useMemo} from 'react';
import Onyx from 'react-native-onyx';

import type MockBaseSearchList from '../../utils/mockBaseSearchList';

import {pressEnterOnListRow, resetMockBaseSearchList} from '../../utils/mockBaseSearchList';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn(),
    })),
);

const mockIsOffline = {current: false};
jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: mockIsOffline.current,
    })),
);

jest.mock('@hooks/useKeyboardState', () => ({
    __esModule: true,
    default: jest.fn(() => ({isKeyboardShown: false, keyboardHeight: 0})),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({isSmallScreenWidth: false, isLargeScreenWidth: true, shouldUseNarrowLayout: false})),
}));

jest.mock('@hooks/useSafeAreaPaddings', () => ({
    __esModule: true,
    default: jest.fn(() => ({safeAreaPaddingBottomStyle: {}})),
}));

jest.mock('@hooks/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => ({windowWidth: 1200, windowHeight: 800})),
}));

// Force the split (wide web) rendering path, where each group becomes a GroupHeader row plus a GroupChildrenContainer row.
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<typeof SearchActions>('@libs/actions/Search'),
    search: jest.fn(),
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'web'),
}));

// Capture the last-item flag each split row receives. That flag is what paints the table's bottom border radius.
type CapturedRow = {groupKeyForList: string; isLastItem: boolean};
const capturedHeaders: Array<CapturedRow & {isExpanded: boolean}> = [];
const capturedChildren: CapturedRow[] = [];
jest.mock('@components/Search/SearchList/ListItem/GroupHeader', () => ({
    __esModule: true,
    default: (props: {item: {groupKeyForList: string}; isLastItem: boolean; isExpanded: boolean}) => {
        capturedHeaders.push({groupKeyForList: props.item.groupKeyForList, isLastItem: props.isLastItem, isExpanded: props.isExpanded});
        return null;
    },
}));

// Renders the real list, but lets a test press Enter on any row.
jest.mock('@components/Search/SearchList/BaseSearchList', () => {
    const {default: mockBaseSearchList} = jest.requireActual<{default: typeof MockBaseSearchList}>('../../utils/mockBaseSearchList');
    return {__esModule: true, default: mockBaseSearchList};
});
jest.mock('@components/Search/SearchList/ListItem/GroupChildrenContainer', () => ({
    __esModule: true,
    default: (props: {item: {groupKeyForList: string}; isLastItem: boolean}) => {
        capturedChildren.push({groupKeyForList: props.item.groupKeyForList, isLastItem: props.isLastItem});
        return null;
    },
}));

// Groups only render through TransactionGroupListItem off the split path. Stub it so importing the view stays lightweight.
jest.mock('@components/Search/SearchList/ListItem/TransactionGroupListItem', () => ({__esModule: true, default: () => null}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn((callback: () => void) => {
        queueMicrotask(() => callback());
        return () => {};
    }),
    useRoute: jest.fn(() => ({key: 'search-split-test-route'})),
    useIsFocused: () => true,
    createNavigationContainerRef: jest.fn(() => ({
        getCurrentRoute: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
        removeListener: jest.fn(),
        isReady: jest.fn(() => true),
        getState: jest.fn(),
    })),
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@components/Search/primitives/SelectionTopBar', () => ({__esModule: true, default: () => null}));

/** Stable by construction, as the registry's own are: a subscriber lists these in its effect dependencies. */
const mockShiftRangeGroups = {addGroupToRange: jest.fn(), removeGroupFromRange: jest.fn(), registryGeneration: 0};

jest.mock('@components/Search/SearchContext', () => ({
    useSearchRowSelectionActions: () => ({toggle: jest.fn(), toggleAll: jest.fn()}),
    useSearchSelectionContext: () => ({selectedTransactions: {}}),
    useSearchShiftRangeGroups: () => mockShiftRangeGroups,
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
}));

const STABLE_QUERY_JSON: SearchQueryJSON = {
    hash: 0,
    recentSearchHash: 0,
    similarSearchHash: 0,
    groupBy: CONST.SEARCH.GROUP_BY.CARD,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: 'desc',
    view: CONST.SEARCH.VIEW.TABLE,
    flatFilters: [],
    inputQuery: '',
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS, right: ''},
    columns: undefined,
    limit: undefined,
    rawFilterList: undefined,
};

const STABLE_COLUMNS: SearchColumnType[] = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.ACTION];

/** Builds group rows, each carrying one child transaction and a query whose hash is 100 plus its index. `isPendingDelete` flags the group row itself, and `isCashBack` makes it a cash back withdrawal. */
function createMockGroupData(groups: Array<{isPendingDelete?: boolean; isCashBack?: boolean}>): SearchListItem[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial group rows
    return groups.map((group, i) => ({
        keyForList: `group-${i}`,
        cardID: i,
        ...(group.isCashBack ? {groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID, isCashBack: true} : {}),
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        pendingAction: group.isPendingDelete ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        transactionsQueryJSON: {hash: 100 + i},
        transactions: [
            {
                keyForList: `txn-${i}-0`,
                transactionID: `${i}-0`,
            },
        ],
    })) as unknown as SearchListItem[];
}

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
ThemeProviderWithLight.displayName = 'ThemeProviderWithLight';

function renderView(data: SearchListItem[], {onSelectRow = () => {}, queryJSON = STABLE_QUERY_JSON}: {onSelectRow?: (item: SearchListItem) => void; queryJSON?: SearchQueryJSON} = {}) {
    function Wrapper() {
        const onEndReached = useCallback(() => {}, []);
        const onLayout = useCallback(() => {}, []);
        const columns = useMemo(() => STABLE_COLUMNS, []);
        const contentContainerStyle = useMemo(() => ({}), []);
        const containerStyle = useMemo(() => ({}), []);

        return (
            <ExpenseGroupedSearchView
                queryJSON={queryJSON}
                data={data}
                columns={columns}
                canSelectMultiple={false}
                isActionColumnWide={false}
                columnSizeOptions={{}}
                isMobileSelectionModeEnabled={false}
                tableHeaderVisible={false}
                hasLoadedAllTransactions
                newTransactions={[]}
                onSelectRow={onSelectRow}
                onEndReached={onEndReached}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
                containerStyle={containerStyle}
            />
        );
    }

    return render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider, ScrollOffsetContextProvider]}>
            <Wrapper />
        </ComposeProviders>,
    );
}

/** The flag each group's header row was last rendered with. */
function headerFlagFor(groupKeyForList: string): boolean | undefined {
    return capturedHeaders.findLast((row) => row.groupKeyForList === groupKeyForList)?.isLastItem;
}

/** The flag each group's children-container row was last rendered with. */
function childrenFlagFor(groupKeyForList: string): boolean | undefined {
    return capturedChildren.findLast((row) => row.groupKeyForList === groupKeyForList)?.isLastItem;
}

/** Whether a group's header was last rendered as open. */
function isGroupExpanded(groupKeyForList: string): boolean | undefined {
    return capturedHeaders.findLast((row) => row.groupKeyForList === groupKeyForList)?.isExpanded;
}

/** Presses Enter on the header row of a group, the way the list does when that row has keyboard focus. */
function pressEnterOnHeader(groupKeyForList: string) {
    pressEnterOnListRow((item) => isGroupHeaderItem(item) && item.groupKeyForList === groupKeyForList, `header ${groupKeyForList}`);
}

beforeAll(() => Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT]}));

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    setHasRadio(true);
    mockIsOffline.current = false;
    capturedHeaders.length = 0;
    capturedChildren.length = 0;
    resetMockBaseSearchList();
    jest.mocked(search).mockClear();
    Onyx.merge(ONYXKEYS.COLLECTION.REPORT, {});
    Onyx.merge(ONYXKEYS.COLLECTION.POLICY, {});
});

afterEach(() => Onyx.clear());

describe('ExpenseGroupedSearchView split rendering', () => {
    it("marks the last group's header as the last item, since a collapsed group's children container is empty and cannot round the table", async () => {
        renderView(createMockGroupData([{}, {}, {}]));
        await waitForBatchedUpdates();

        expect(headerFlagFor('group-2')).toBe(true);
    });

    it('leaves every earlier group header unmarked, so only one row rounds the table', async () => {
        renderView(createMockGroupData([{}, {}, {}]));
        await waitForBatchedUpdates();

        expect(headerFlagFor('group-0')).toBe(false);
        expect(headerFlagFor('group-1')).toBe(false);
    });

    it("still marks the last group's children container, which takes over the rounding once the group expands", async () => {
        renderView(createMockGroupData([{}, {}, {}]));
        await waitForBatchedUpdates();

        expect(childrenFlagFor('group-2')).toBe(true);
        expect(childrenFlagFor('group-1')).toBe(false);
    });

    it('moves the marking up to the last group left in the list when the trailing group is dropped as pending delete', async () => {
        renderView(createMockGroupData([{}, {}, {isPendingDelete: true}]));
        await waitForBatchedUpdates();

        expect(headerFlagFor('group-2')).toBeUndefined();
        expect(headerFlagFor('group-1')).toBe(true);
    });
});

describe('ExpenseGroupedSearchView Enter on a focused group header', () => {
    it('opens and closes a group that is not a report, the same as clicking its header', async () => {
        // Given a list grouped by card, where clicking a header only opens or closes its group
        const onSelectRow = jest.fn();
        renderView(createMockGroupData([{}, {}]), {onSelectRow});
        await waitForBatchedUpdates();
        expect(isGroupExpanded('group-0')).toBe(false);

        // When Enter is pressed on the first group's header
        pressEnterOnHeader('group-0');

        // Then the group opens and fetches its expenses once, and nothing is selected because a card group has no page to open
        expect(isGroupExpanded('group-0')).toBe(true);
        expect(isGroupExpanded('group-1')).toBe(false);
        expect(onSelectRow).not.toHaveBeenCalled();
        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: {hash: 100}, offset: 0}));

        // When Enter is pressed on it again
        pressEnterOnHeader('group-0');

        // Then it closes, like a second click, without fetching again
        expect(isGroupExpanded('group-0')).toBe(false);
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('opens the report under its own key, not the prefixed header key', async () => {
        // Given a list of expense reports, where clicking a header opens the report
        const onSelectRow = jest.fn();
        renderView(createMockGroupData([{}]), {onSelectRow, queryJSON: {...STABLE_QUERY_JSON, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}});
        await waitForBatchedUpdates();

        // When Enter is pressed on the report's header
        pressEnterOnHeader('group-0');

        // Then the report is selected under its own key, and the group doesn't open
        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(onSelectRow).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'group-0'}), undefined, undefined);
        expect(isGroupExpanded('group-0')).toBe(false);
    });

    it('does nothing on a cash back row', async () => {
        // Given a withdrawal group that is a cash back credit
        const onSelectRow = jest.fn();
        renderView(createMockGroupData([{isCashBack: true}]), {onSelectRow});
        await waitForBatchedUpdates();

        // When Enter is pressed on its header
        pressEnterOnHeader('group-0');

        // Then it neither opens nor selects anything
        expect(isGroupExpanded('group-0')).toBe(false);
        expect(onSelectRow).not.toHaveBeenCalled();
    });
});
