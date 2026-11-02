import {act, render, screen} from '@testing-library/react-native';
import React, {Profiler, useCallback, useMemo} from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollOffsetContextProvider from '@components/ScrollOffsetContextProvider';
import ExpenseReportSearchView from '@components/Search/ExpenseReportSearchView';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';
import {setHasRadio} from '@libs/NetworkState';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
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

// Capture each report row's tap handler so the mobile-selection-mode toggle can be exercised without the heavy real ExpenseReportListItem.
const mockRowSelect: Record<string, () => void> = {};
jest.mock('@components/Search/SearchList/ListItem/ExpenseReportListItem', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const {View: RNView} = jest.requireActual<{View: React.ComponentType<{testID?: string}>}>('react-native');
    return {
        __esModule: true,
        default: (props: {item: SearchListItem; onSelectRow: (item: SearchListItem) => void}) => {
            mockRowSelect[props.item?.keyForList ?? ''] = () => props.onSelectRow?.(props.item);
            return ReactLocal.createElement(RNView, {testID: `row-${props.item?.keyForList ?? 'unknown'}`});
        },
    };
});

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
jest.mock('@components/Search/SearchContext', () => ({
    useSearchRowSelectionActions: () => ({toggle: mockToggle, toggleAll: mockToggleAll}),
    useSearchSelectionContext: () => ({selectedTransactions: mockSelectedTransactions.current}),
}));

function selectKeys(...keys: string[]): Record<string, {isSelected: boolean}> {
    return Object.fromEntries(keys.map((key) => [key, {isSelected: true}]));
}

const STABLE_QUERY_JSON: SearchQueryJSON = {
    hash: 0,
    recentSearchHash: 0,
    similarSearchHash: 0,
    groupBy: undefined,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: 'desc',
    view: CONST.SEARCH.VIEW.TABLE,
    flatFilters: [],
    inputQuery: '',
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS, right: ''},
    policyID: undefined,
    columns: undefined,
    limit: undefined,
    rawFilterList: undefined,
};

const STABLE_COLUMNS: SearchColumnType[] = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.ACTION];

/** Builds report rows, each carrying child transactions; `deletedTransactions` marks transaction indices as pending-delete. */
function createMockReportData(reports: Array<{transactionCount: number; deletedTransactions?: Set<number>}>): SearchListItem[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial report-group rows
    return reports.map((report, i) => ({
        keyForList: `report-${i}`,
        reportID: `${i}`,
        groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        transactions: Array.from({length: report.transactionCount}, (_, j) => ({
            keyForList: `txn-${i}-${j}`,
            transactionID: `${i}-${j}`,
            pendingAction: report.deletedTransactions?.has(j) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
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
};

function renderView(overrides: RenderOverrides = {}) {
    const data = overrides.data ?? createMockReportData([{transactionCount: 1}, {transactionCount: 1}, {transactionCount: 1}]);

    function Wrapper() {
        const onSelectRow = useCallback((item: SearchListItem) => overrides.onSelectRow?.(item), []);
        const onEndReached = useCallback(() => {}, []);
        const onLayout = useCallback(() => {}, []);
        const queryJSON = useMemo(() => STABLE_QUERY_JSON, []);
        const columns = useMemo(() => STABLE_COLUMNS, []);
        const contentContainerStyle = useMemo(() => ({}), []);
        const containerStyle = useMemo(() => ({}), []);

        const view = (
            <ExpenseReportSearchView
                queryJSON={queryJSON}
                data={data}
                columns={columns}
                canSelectMultiple={overrides.canSelectMultiple ?? false}
                isActionColumnWide={false}
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
                id="expense-report-search-view"
                onRender={overrides.onRenderCount}
            >
                {view}
            </Profiler>
        );
    }

    return render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider, ScrollOffsetContextProvider]}>
            <Wrapper />
        </ComposeProviders>,
    );
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
    for (const key of Object.keys(mockRowSelect)) {
        delete mockRowSelect[key];
    }
    Onyx.merge(ONYXKEYS.COLLECTION.REPORT, {});
    Onyx.merge(ONYXKEYS.COLLECTION.POLICY, {});
});

afterEach(() => Onyx.clear());

describe('ExpenseReportSearchView', () => {
    it('does not exceed the max render count on initial mount with stable props', async () => {
        let renderCount = 0;
        renderView({data: createMockReportData(Array.from({length: 100}, () => ({transactionCount: 1}))), onRenderCount: () => (renderCount += 1)});
        await waitForBatchedUpdates();
        expect(renderCount).toBeLessThanOrEqual(MAX_INITIAL_RENDER_COUNT);
    });

    it('renders one row per report item', async () => {
        renderView({data: createMockReportData([{transactionCount: 2}, {transactionCount: 1}, {transactionCount: 3}])});
        await waitForBatchedUpdates();
        expect(screen.queryAllByTestId(/^row-report-/)).toHaveLength(3);
    });

    it('computes selection counts over child transactions, excluding deleted ones', async () => {
        // 2 reports: report-0 has txn-0-0, txn-0-1; report-1 has txn-1-0 (deleted) -> 2 selectable transactions.
        // One transaction selected -> not all-checked.
        mockSelectedTransactions.current = selectKeys('txn-0-0');
        renderView({
            data: createMockReportData([{transactionCount: 2}, {transactionCount: 1, deletedTransactions: new Set([0])}]),
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
            data: createMockReportData([{transactionCount: 2}, {transactionCount: 1, deletedTransactions: new Set([0])}]),
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
        renderView({data: createMockReportData([{transactionCount: 1}, {transactionCount: 1}]), isMobileSelectionModeEnabled: true, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['report-0']?.());

        expect(mockToggle).toHaveBeenCalledTimes(1);
        expect(onSelectRow).not.toHaveBeenCalled();
    });

    it('navigates on row tap when not in mobile selection mode', async () => {
        const onSelectRow = jest.fn();
        renderView({data: createMockReportData([{transactionCount: 1}, {transactionCount: 1}]), isMobileSelectionModeEnabled: false, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['report-0']?.());

        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(mockToggle).not.toHaveBeenCalled();
    });
});
