import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollOffsetContextProvider from '@components/ScrollOffsetContextProvider';
import ExpenseGroupedSearchView from '@components/Search/ExpenseGroupedSearchView';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import type * as SearchActions from '@libs/actions/Search';
import {search} from '@libs/actions/Search';
import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {Profiler, useCallback, useMemo} from 'react';
import Onyx from 'react-native-onyx';

import type MockBaseSearchListModule from '../../utils/mockBaseSearchList';

import {activateListRow, resetMockBaseSearchList} from '../../utils/mockBaseSearchList';
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

// Force the non-split (native/narrow) rendering path so groups render through TransactionGroupListItem.
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<typeof SearchActions>('@libs/actions/Search'),
    search: jest.fn(),
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'ios'),
}));

// Group header/children only render on the split path; stub them so importing the view stays lightweight.
jest.mock('@components/Search/SearchList/ListItem/GroupHeader', () => ({__esModule: true, default: () => null}));
jest.mock('@components/Search/SearchList/ListItem/GroupChildrenContainer', () => ({__esModule: true, default: () => null}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn((callback: () => void) => {
        queueMicrotask(() => callback());
        return () => {};
    }),
    useRoute: jest.fn(() => ({key: 'search-test-route'})),
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

// Capture each group row's tap handler, its open state and its toggle so they can be exercised without the heavy real TransactionGroupListItem.
const mockRowSelect: Record<string, () => void> = {};
const mockRowToggle: Record<string, () => void> = {};
const mockRowExpanded: Record<string, boolean> = {};
jest.mock('@components/Search/SearchList/ListItem/TransactionGroupListItem', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const {View: RNView} = jest.requireActual<{View: React.ComponentType<{testID?: string}>}>('react-native');
    return {
        __esModule: true,
        default: (props: {item: SearchListItem; onSelectRow: (item: SearchListItem) => void; isExpanded: boolean; onToggle: () => void}) => {
            mockRowSelect[props.item?.keyForList ?? ''] = () => props.onSelectRow?.(props.item);
            mockRowToggle[props.item?.keyForList ?? ''] = props.onToggle;
            mockRowExpanded[props.item?.keyForList ?? ''] = props.isExpanded;
            return ReactLocal.createElement(RNView, {testID: `row-${props.item?.keyForList ?? 'unknown'}`});
        },
    };
});

// Renders the real list, but lets a test activate any row.
jest.mock('@components/Search/SearchList/BaseSearchList', () => jest.requireActual<{default: typeof MockBaseSearchListModule}>('../../utils/mockBaseSearchList').default);

// Capture SelectionTopBar props so the selection-count math can be asserted directly.
type CapturedTopBarProps = {selectedItemsLength: number; totalItems: number; isSelectAllChecked: boolean | undefined};
const mockTopBar: {current: CapturedTopBarProps | null} = {current: null};
jest.mock('@components/Search/primitives/SelectionTopBar', () => ({
    __esModule: true,
    default: (props: CapturedTopBarProps) => {
        mockTopBar.current = {selectedItemsLength: props.selectedItemsLength, totalItems: props.totalItems, isSelectAllChecked: props.isSelectAllChecked};
        return null;
    },
}));

const mockToggle = jest.fn();
const mockToggleAll = jest.fn();
const mockSelectedTransactions: {current: Record<string, {isSelected: boolean}>} = {current: {}};
/** Stable by construction, as the registry's own are: a subscriber lists these in its effect dependencies. */
const mockShiftRangeGroups = {addGroupToRange: jest.fn(), removeGroupFromRange: jest.fn(), registryGeneration: 0};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchRowSelectionActions: () => ({toggle: mockToggle, toggleAll: mockToggleAll}),
    useSearchSelectionContext: () => ({selectedTransactions: mockSelectedTransactions.current, excludedTransactions: {}, areAllMatchingItemsSelected: false}),
    useSearchShiftRangeGroups: () => mockShiftRangeGroups,
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
}));

function selectKeys(...keys: string[]): Record<string, {isSelected: boolean}> {
    return Object.fromEntries(keys.map((key) => [key, {isSelected: true}]));
}

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

// Counts group rows whose AnimatedExitRow has a live FadeOutUp `exiting` animation. Each row's Animated.View always
// receives an `entering` prop (identifying the wrapper) and an `exiting` prop that is only non-null when armed.
function countArmedExitAnimations(root: ReturnType<typeof render>['UNSAFE_root']): number {
    return root.findAll((node) => typeof node.type !== 'string' && !!node.props && 'entering' in node.props && node.props.exiting != null).length;
}

/**
 * Builds group rows, each carrying child transactions. `deletedTransactions` marks transaction indices as
 * pending-delete; `isPendingDelete` flags the group row itself, which is what a whole-group delete does.
 * `hasTransactionsQuery` gives the group a query of its own to fetch its expenses with, its hash being 100 plus its index.
 */
function createMockGroupData(groups: Array<{transactionCount: number; deletedTransactions?: Set<number>; isPendingDelete?: boolean; hasTransactionsQuery?: boolean}>): SearchListItem[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial group rows
    return groups.map((group, i) => ({
        keyForList: `group-${i}`,
        cardID: i,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        pendingAction: group.isPendingDelete ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        transactionsQueryJSON: group.hasTransactionsQuery ? {hash: 100 + i} : undefined,
        transactions: Array.from({length: group.transactionCount}, (_, j) => ({
            keyForList: `txn-${i}-${j}`,
            transactionID: `${i}-${j}`,
            pendingAction: group.deletedTransactions?.has(j) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        })),
    })) as unknown as SearchListItem[];
}

/** Max render count for the view subtree on initial mount with stable props. Also guards against re-render regressions. */
const MAX_INITIAL_RENDER_COUNT = 15;

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
ThemeProviderWithLight.displayName = 'ThemeProviderWithLight';

type RenderOverrides = {
    data?: SearchListItem[];
    canSelectMultiple?: boolean;
    tableHeaderVisible?: boolean;
    isMobileSelectionModeEnabled?: boolean;
    hasLoadedAllTransactions?: boolean;
    onSelectRow?: (item: SearchListItem) => void;
    onRenderCount?: () => void;
    queryJSON?: SearchQueryJSON;
};

function renderView(overrides: RenderOverrides = {}) {
    let data = overrides.data ?? createMockGroupData([{transactionCount: 1}, {transactionCount: 1}, {transactionCount: 1}]);

    function Wrapper() {
        const onSelectRow = useCallback((item: SearchListItem) => overrides.onSelectRow?.(item), []);
        const onEndReached = useCallback(() => {}, []);
        const onLayout = useCallback(() => {}, []);
        const queryJSON = useMemo(() => overrides.queryJSON ?? STABLE_QUERY_JSON, []);
        const columns = useMemo(() => STABLE_COLUMNS, []);
        const contentContainerStyle = useMemo(() => ({}), []);
        const containerStyle = useMemo(() => ({}), []);

        const view = (
            <ExpenseGroupedSearchView
                queryJSON={queryJSON}
                data={data}
                columns={columns}
                canSelectMultiple={overrides.canSelectMultiple ?? false}
                isActionColumnWide={false}
                columnSizeOptions={{}}
                isMobileSelectionModeEnabled={overrides.isMobileSelectionModeEnabled ?? false}
                tableHeaderVisible={overrides.tableHeaderVisible ?? false}
                hasLoadedAllTransactions={overrides.hasLoadedAllTransactions ?? true}
                newTransactions={[]}
                onSelectRow={onSelectRow}
                onEndReached={onEndReached}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
                containerStyle={containerStyle}
            />
        );

        if (!overrides.onRenderCount) {
            return view;
        }
        return (
            <Profiler
                id="expense-grouped-search-view"
                onRender={overrides.onRenderCount}
            >
                {view}
            </Profiler>
        );
    }

    const buildTree = () => (
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider, ScrollOffsetContextProvider]}>
            <Wrapper />
        </ComposeProviders>
    );
    const result = render(buildTree());
    return {
        ...result,
        setData: (nextData: SearchListItem[]) => {
            data = nextData;
            result.rerender(buildTree());
        },
    };
}

/** Activates a group row, the way Enter on the focused row does. */
function activateRow(keyForList: string) {
    activateListRow((item) => item.keyForList === keyForList, keyForList);
}

beforeAll(() => Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT]}));

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    setHasRadio(true);
    mockToggle.mockClear();
    mockToggleAll.mockClear();
    mockSelectedTransactions.current = {};
    mockTopBar.current = null;
    mockIsOffline.current = false;
    for (const key of Object.keys(mockRowSelect)) {
        delete mockRowSelect[key];
    }
    for (const key of Object.keys(mockRowToggle)) {
        delete mockRowToggle[key];
    }
    for (const key of Object.keys(mockRowExpanded)) {
        delete mockRowExpanded[key];
    }
    resetMockBaseSearchList();
    jest.mocked(search).mockClear();
    Onyx.merge(ONYXKEYS.COLLECTION.REPORT, {});
    Onyx.merge(ONYXKEYS.COLLECTION.POLICY, {});
});

afterEach(() => Onyx.clear());

describe('ExpenseGroupedSearchView', () => {
    it('does not exceed the max render count on initial mount with stable props', async () => {
        let renderCount = 0;
        renderView({data: createMockGroupData(Array.from({length: 100}, () => ({transactionCount: 1}))), onRenderCount: () => (renderCount += 1)});
        await waitForBatchedUpdates();
        expect(renderCount).toBeLessThanOrEqual(MAX_INITIAL_RENDER_COUNT);
    });

    it('renders one row per group item', async () => {
        renderView({data: createMockGroupData([{transactionCount: 2}, {transactionCount: 1}, {transactionCount: 3}])});
        await waitForBatchedUpdates();
        expect(screen.queryAllByTestId(/^row-group-/)).toHaveLength(3);
    });

    it('computes selection counts over child transactions, excluding deleted ones', async () => {
        // 2 groups: group-0 has txn-0-0, txn-0-1; group-1 has txn-1-0 (deleted) -> 2 selectable transactions.
        // One transaction selected -> not all-checked.
        mockSelectedTransactions.current = selectKeys('txn-0-0');
        renderView({
            data: createMockGroupData([{transactionCount: 2}, {transactionCount: 1, deletedTransactions: new Set([0])}]),
            canSelectMultiple: true,
            tableHeaderVisible: true,
            hasLoadedAllTransactions: true,
        });
        await waitForBatchedUpdates();

        expect(mockTopBar.current?.selectedItemsLength).toBe(1);
        expect(mockTopBar.current?.totalItems).toBe(2);
        expect(mockTopBar.current?.isSelectAllChecked).toBe(false);
    });

    it('marks select-all checked when every selectable transaction is selected', async () => {
        mockSelectedTransactions.current = selectKeys('txn-0-0', 'txn-0-1');
        renderView({
            data: createMockGroupData([{transactionCount: 2}, {transactionCount: 1, deletedTransactions: new Set([0])}]),
            canSelectMultiple: true,
            tableHeaderVisible: true,
            hasLoadedAllTransactions: true,
        });
        await waitForBatchedUpdates();

        expect(mockTopBar.current?.selectedItemsLength).toBe(2);
        expect(mockTopBar.current?.totalItems).toBe(2);
        expect(mockTopBar.current?.isSelectAllChecked).toBe(true);
    });

    it('toggles selection on row tap while in mobile selection mode, instead of navigating', async () => {
        const onSelectRow = jest.fn();
        renderView({data: createMockGroupData([{transactionCount: 1}, {transactionCount: 1}]), isMobileSelectionModeEnabled: true, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['group-0']?.());

        expect(mockToggle).toHaveBeenCalledTimes(1);
        expect(onSelectRow).not.toHaveBeenCalled();
    });

    it('navigates on row tap when not in mobile selection mode', async () => {
        const onSelectRow = jest.fn();
        renderView({data: createMockGroupData([{transactionCount: 1}, {transactionCount: 1}]), isMobileSelectionModeEnabled: false, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['group-0']?.());

        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(mockToggle).not.toHaveBeenCalled();
    });

    it('does not arm the FadeOutUp exit on a stable group row, so it cannot flicker on remount', async () => {
        const {UNSAFE_root: root} = renderView({data: createMockGroupData([{transactionCount: 1}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        expect(countArmedExitAnimations(root)).toBe(0);
    });

    it('drops a group row flagged pending delete from the list', async () => {
        renderView({data: createMockGroupData([{transactionCount: 2, isPendingDelete: true}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        expect(screen.queryByTestId('row-group-0')).toBeNull();
        expect(screen.getByTestId('row-group-1')).toBeOnTheScreen();
    });

    it('keeps a group row flagged pending delete out of the list after its child transactions are cleared', async () => {
        // Deleting every expense in a group clears the children from their sub-snapshot before the next Search
        // response drops the group entry. The row must not come back across that window.
        const {setData} = renderView({data: createMockGroupData([{transactionCount: 2, isPendingDelete: true}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        act(() => setData(createMockGroupData([{transactionCount: 0, isPendingDelete: true}, {transactionCount: 1}])));
        await waitForBatchedUpdates();

        expect(screen.queryByTestId('row-group-0')).toBeNull();
    });

    it('brings a group row back when a failed delete clears its pending-delete flag', async () => {
        const {setData} = renderView({data: createMockGroupData([{transactionCount: 2, isPendingDelete: true}, {transactionCount: 1}])});
        await waitForBatchedUpdates();
        expect(screen.queryByTestId('row-group-0')).toBeNull();

        act(() => setData(createMockGroupData([{transactionCount: 2}, {transactionCount: 1}])));
        await waitForBatchedUpdates();

        expect(screen.getByTestId('row-group-0')).toBeOnTheScreen();
    });

    it('keeps a group row flagged pending delete visible while offline so its pending-delete styling shows', async () => {
        mockIsOffline.current = true;
        renderView({data: createMockGroupData([{transactionCount: 2, isPendingDelete: true}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        expect(screen.getByTestId('row-group-0')).toBeOnTheScreen();
    });

    it('keeps a group row whose child transactions are all pending delete, since only the group flag removes a row', async () => {
        // A group is deleted by flagging its own snapshot entry. Reading the state off the children instead is what
        // made the row flicker, because the children are cleared before the group entry is.
        renderView({data: createMockGroupData([{transactionCount: 2, deletedTransactions: new Set([0, 1])}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        expect(screen.getByTestId('row-group-0')).toBeOnTheScreen();
    });

    it('keeps a group row whose transactions have not loaded yet', async () => {
        // An empty transaction list also means "this group's sub-snapshot has not arrived", so an empty group that is
        // not flagged must still render.
        renderView({data: createMockGroupData([{transactionCount: 0}, {transactionCount: 1}])});
        await waitForBatchedUpdates();

        expect(screen.getByTestId('row-group-0')).toBeOnTheScreen();
    });
});

describe('ExpenseGroupedSearchView open groups on narrow layouts', () => {
    it("fetches a group's expenses when a click opens it, and not when it closes", async () => {
        // Given a list grouped by card on a narrow layout, where each group fetches its expenses with its own query
        renderView({
            data: createMockGroupData([
                {transactionCount: 1, hasTransactionsQuery: true},
                {transactionCount: 1, hasTransactionsQuery: true},
            ]),
        });
        await waitForBatchedUpdates();

        // When the first group is clicked open
        act(() => mockRowToggle['group-0']?.());

        // Then its first page is fetched once, with its own query
        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: {hash: 100}, offset: 0}));

        // When it is clicked closed
        act(() => mockRowToggle['group-0']?.());

        // Then nothing more is fetched, since there is nothing to show
        expect(search).toHaveBeenCalledTimes(1);
    });

    it("fetches a group's expenses when Enter opens it", async () => {
        // Given a list grouped by card on a narrow layout, where each group fetches its expenses with its own query
        renderView({data: createMockGroupData([{transactionCount: 1, hasTransactionsQuery: true}])});
        await waitForBatchedUpdates();

        // When Enter is pressed on the group
        activateRow('group-0');

        // Then its first page is fetched once, the same as when it is clicked open
        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: {hash: 100}, offset: 0}));
    });

    it('opens and closes a group that is not a report when Enter is pressed on it, the same as clicking it', async () => {
        // Given a list grouped by card on a narrow layout, where each group renders as one row that opens and closes on click
        const onSelectRow = jest.fn();
        renderView({data: createMockGroupData([{transactionCount: 1}, {transactionCount: 1}]), onSelectRow});
        await waitForBatchedUpdates();
        expect(mockRowExpanded['group-0']).toBe(false);

        // When Enter is pressed on the first group
        activateRow('group-0');

        // Then it opens, and nothing is selected because a card group has no page to open
        expect(mockRowExpanded['group-0']).toBe(true);
        expect(mockRowExpanded['group-1']).toBe(false);
        expect(onSelectRow).not.toHaveBeenCalled();

        // When Enter is pressed on it again
        activateRow('group-0');

        // Then it closes
        expect(mockRowExpanded['group-0']).toBe(false);
    });

    it('opens the report when Enter is pressed on a report group', async () => {
        // Given a list of expense reports, where clicking a report opens it
        const onSelectRow = jest.fn();
        renderView({
            data: createMockGroupData([{transactionCount: 1}]),
            onSelectRow,
            queryJSON: {...STABLE_QUERY_JSON, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        });
        await waitForBatchedUpdates();

        // When Enter is pressed on it
        activateRow('group-0');

        // Then the report is selected under its own key, and the row doesn't open
        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(onSelectRow).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'group-0'}));
        expect(mockRowExpanded['group-0']).toBe(false);
    });

    it('does not open a group that is pending delete when Enter is pressed on it', async () => {
        // Given an offline list, where a group whose expenses were all deleted stays in place with pending-delete styling
        mockIsOffline.current = true;
        const onSelectRow = jest.fn();
        renderView({data: createMockGroupData([{transactionCount: 2, isPendingDelete: true}, {transactionCount: 1}]), onSelectRow});
        await waitForBatchedUpdates();

        // When Enter is pressed on that group
        activateRow('group-0');

        // Then it stays closed and nothing is selected
        expect(mockRowExpanded['group-0']).toBe(false);
        expect(onSelectRow).not.toHaveBeenCalled();
    });

    it('closes an open group once every expense in it is pending delete', async () => {
        // Given a group the user opened by clicking it
        const {setData} = renderView({data: createMockGroupData([{transactionCount: 2}, {transactionCount: 1}])});
        await waitForBatchedUpdates();
        act(() => mockRowToggle['group-0']?.());
        expect(mockRowExpanded['group-0']).toBe(true);

        // When every expense in it is deleted, which leaves the group itself in the list
        act(() => setData(createMockGroupData([{transactionCount: 2, deletedTransactions: new Set([0, 1])}, {transactionCount: 1}])));
        await waitForBatchedUpdates();

        // Then it closes, rather than keep showing only deleted expenses
        expect(mockRowExpanded['group-0']).toBe(false);
    });
});
