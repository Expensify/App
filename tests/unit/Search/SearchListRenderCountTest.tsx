import {render} from '@testing-library/react-native';
import React, {Profiler, useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollOffsetContextProvider from '@components/ScrollOffsetContextProvider';
import SearchList from '@components/Search/SearchList';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import type {SearchListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@components/Icon/Expensicons');

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        isKeyboardShown: false,
        keyboardHeight: 0,
    })),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        isSmallScreenWidth: false,
        isLargeScreenWidth: true,
        shouldUseNarrowLayout: false,
    })),
}));

jest.mock('@hooks/useSafeAreaPaddings', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        safeAreaPaddingBottomStyle: {},
    })),
}));

jest.mock('@hooks/useWindowDimensions', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        windowWidth: 1200,
        windowHeight: 800,
    })),
}));

jest.mock('@react-navigation/native', () => ({
    // Defer callback to after commit so focus effect runs at effect time, not during render.
    // Running during render would skew render-count/duration and is unrepresentative of production.
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

/** Maximum allowed render count for the SearchList subtree on initial mount with stable props (measured via Profiler). Exceeding this suggests a re-render regression. */
const MAX_INITIAL_RENDER_COUNT = 15;

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
ThemeProviderWithLight.displayName = 'ThemeProviderWithLight';

/** Minimal list item component to avoid heavy TransactionListItem dependencies */
function MockListItem({item}: {item: SearchListItem}) {
    return (
        <View>
            <Text>{item?.keyForList ?? 'unknown'}</Text>
        </View>
    );
}
MockListItem.displayName = 'MockListItem';

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

function createMockData(length: number): SearchListItem[] {
    return Array.from({length}, (_, i) => ({
        keyForList: `transaction-${i}`,
        transactionID: `${i}`,
        reportID: '1',
        policyID: 'policy-1',
        amount: 100,
        currency: 'USD',
        created: '2025-01-01',
        merchant: `Merchant ${i}`,
        category: '',
        tag: '',
        modifiedAmount: 100,
        modifiedCreated: '2025-01-01',
        modifiedCurrency: 'USD',
        modifiedMerchant: `Merchant ${i}`,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportAction: {reportActionID: `${i}`, actionName: 'created', created: '2025-01-01'},
        policy: {id: 'policy-1', name: 'Policy', type: 'team', role: 'admin', owner: 'test@test.com', outputCurrency: 'USD', isPolicyExpenseChatEnabled: true},
        formattedMerchant: `Merchant ${i}`,
        formattedTotal: 100,
        date: '2025-01-01',
        shouldShowMerchant: true,
        shouldShowYear: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
    })) as unknown as SearchListItem[];
}

const MOCK_DATA = createMockData(100);

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT],
    }),
);

beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    Onyx.merge(ONYXKEYS.COLLECTION.REPORT, {});
    Onyx.merge(ONYXKEYS.COLLECTION.POLICY, {});
});

afterEach(() => {
    Onyx.clear();
});

describe('SearchList render count', () => {
    it('should not exceed max render count on initial mount with stable props', async () => {
        let countRef: React.RefObject<number> | null = null;

        function SearchListWrapper({onRenderCount}: {onRenderCount: () => void}) {
            const onSelectRow = useCallback(() => {}, []);
            const onCheckboxPress = useCallback(() => {}, []);
            const onAllCheckboxPress = useCallback(() => {}, []);
            const onEndReached = useCallback(() => {}, []);
            const onLayout = useCallback(() => {}, []);

            const queryJSON = useMemo(() => STABLE_QUERY_JSON, []);
            const columns = useMemo(() => STABLE_COLUMNS, []);
            const data = useMemo(() => MOCK_DATA, []);
            const selectedTransactions = useMemo(() => ({}), []);
            const contentContainerStyle = useMemo(() => ({}), []);
            const containerStyle = useMemo(() => ({}), []);

            return (
                <Profiler
                    id="search-list"
                    onRender={onRenderCount}
                >
                    <SearchList
                        data={data}
                        ListItem={MockListItem as never}
                        onSelectRow={onSelectRow}
                        onCheckboxPress={onCheckboxPress}
                        onAllCheckboxPress={onAllCheckboxPress}
                        canSelectMultiple={false}
                        selectedTransactions={selectedTransactions}
                        queryJSON={queryJSON}
                        columns={columns}
                        isMobileSelectionModeEnabled={false}
                        contentContainerStyle={contentContainerStyle}
                        containerStyle={containerStyle}
                        onEndReached={onEndReached}
                        onLayout={onLayout}
                    />
                </Profiler>
            );
        }

        function SearchListWrapperWithProviders({onRenderCount}: {onRenderCount: () => void}) {
            return (
                <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider, ScrollOffsetContextProvider]}>
                    <SearchListWrapper onRenderCount={onRenderCount} />
                </ComposeProviders>
            );
        }

        function TestRoot() {
            const renderCountRef = useRef(0);
            useEffect(() => {
                countRef = renderCountRef;
            });
            return (
                <SearchListWrapperWithProviders
                    onRenderCount={() => {
                        renderCountRef.current += 1;
                    }}
                />
            );
        }

        render(<TestRoot />);
        await waitForBatchedUpdates();

        const ref = countRef as React.RefObject<number> | null;
        expect(ref?.current ?? 0).toBeLessThanOrEqual(MAX_INITIAL_RENDER_COUNT);
    });
});
