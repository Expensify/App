import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollOffsetContextProvider from '@components/ScrollOffsetContextProvider';
import ExpenseFlatSearchView from '@components/Search/ExpenseFlatSearchView';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {Profiler, useCallback, useMemo} from 'react';
import Onyx from 'react-native-onyx';

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

// Capture each row's tap handler so the mobile-selection-mode toggle can be exercised without the heavy
// real TransactionListItem.
const mockRowSelect: Record<string, () => void> = {};
jest.mock('@components/Search/SearchList/ListItem/TransactionListItem', () => {
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
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
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

function createMockData(length: number, deletedKeys = new Set<string>()): SearchListItem[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial SearchListItem rows
    return Array.from({length}, (_, i) => {
        const keyForList = `transaction-${i}`;
        return {
            keyForList,
            transactionID: `${i}`,
            reportID: '1',
            policyID: 'policy-1',
            amount: 100,
            currency: 'USD',
            created: '2025-01-01',
            merchant: `Merchant ${i}`,
            formattedMerchant: `Merchant ${i}`,
            formattedTotal: 100,
            date: '2025-01-01',
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            pendingAction: deletedKeys.has(keyForList) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        };
    }) as unknown as SearchListItem[];
}

/** Max render count for the view subtree on initial mount with stable props. Also guards against re-render regressions from the memoization cleanup. */
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
    const data = overrides.data ?? createMockData(3);

    function Wrapper() {
        const onSelectRow = useCallback((item: SearchListItem) => overrides.onSelectRow?.(item), []);
        const onEndReached = useCallback(() => {}, []);
        const onLayout = useCallback(() => {}, []);
        const queryJSON = useMemo(() => STABLE_QUERY_JSON, []);
        const columns = useMemo(() => STABLE_COLUMNS, []);
        const contentContainerStyle = useMemo(() => ({}), []);
        const containerStyle = useMemo(() => ({}), []);

        const view = (
            <ExpenseFlatSearchView
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
                id="expense-flat-search-view"
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

describe('ExpenseFlatSearchView', () => {
    it('does not exceed the max render count on initial mount with stable props', async () => {
        let renderCount = 0;
        renderView({data: createMockData(100), onRenderCount: () => (renderCount += 1)});
        await waitForBatchedUpdates();
        expect(renderCount).toBeLessThanOrEqual(MAX_INITIAL_RENDER_COUNT);
    });

    it('renders one row per data item', async () => {
        renderView({data: createMockData(3)});
        await waitForBatchedUpdates();
        expect(screen.queryAllByTestId(/^row-transaction-/)).toHaveLength(3);
    });

    it('computes selection counts excluding deleted rows and reflects select-all state', async () => {
        // 3 rows, one pending-delete -> 2 selectable. One selected -> not all-checked.
        mockSelectedTransactions.current = selectKeys('transaction-0');
        renderView({
            data: createMockData(3, new Set(['transaction-2'])),
            canSelectMultiple: true,
            tableHeaderVisible: true,
            hasLoadedAllTransactions: true,
        });
        await waitForBatchedUpdates();

        expect(mockTopBar.current?.selectedItemsLength).toBe(1);
        expect(mockTopBar.current?.totalItems).toBe(2);
        expect(mockTopBar.current?.isSelectAllChecked).toBe(false);
    });

    it('marks select-all checked when every selectable row is selected', async () => {
        mockSelectedTransactions.current = selectKeys('transaction-0', 'transaction-1');
        renderView({
            data: createMockData(3, new Set(['transaction-2'])),
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
        renderView({data: createMockData(2), isMobileSelectionModeEnabled: true, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['transaction-0']?.());

        expect(mockToggle).toHaveBeenCalledTimes(1);
        expect(onSelectRow).not.toHaveBeenCalled();
    });

    it('navigates on row tap when not in mobile selection mode', async () => {
        const onSelectRow = jest.fn();
        renderView({data: createMockData(2), isMobileSelectionModeEnabled: false, onSelectRow});
        await waitForBatchedUpdates();

        act(() => mockRowSelect['transaction-0']?.());

        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(mockToggle).not.toHaveBeenCalled();
    });
});
