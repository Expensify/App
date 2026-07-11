import {render, screen} from '@testing-library/react-native';

import type SearchAdvancedFiltersPopupComponent from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup';

import {clearCalendarPickerSelectedYear, setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {ComponentType, ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The popover lives only in the WEB variant (index.tsx) — the native variant returns null because advanced
// filters are served from a full page on native. jest-expo's haste platform resolves the bare import to
// index.native.tsx, so pull in the web file explicitly to exercise the effectiveFilter logic under test.
const {default: SearchAdvancedFiltersPopup} = jest.requireActual<{default: typeof SearchAdvancedFiltersPopupComponent}>(
    '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/index.tsx',
);

type MockReactNativePrimitives = {
    View: ComponentType<{testID?: string; children?: ReactNode}>;
    Text: ComponentType<{children?: ReactNode}>;
};

// The host wraps its body in SafeTriangle (pulls in react-native-svg + Browser detection).
// We only care about what filter the host hands down, so render the children straight through.
jest.mock('@components/SafeTriangle', () => {
    const {View} = jest.requireActual<MockReactNativePrimitives>('react-native');
    function MockSafeTriangle({children}: {children?: ReactNode}) {
        return <View testID="SafeTriangle">{children}</View>;
    }
    return MockSafeTriangle;
});

// FilterList renders icons, lazy assets and the whole advanced-filters menu tree. We don't need any of
// that to prove the host's selection logic — we only need to observe the `selectedFilter` it is handed.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => {
    const {View, Text} = jest.requireActual<MockReactNativePrimitives>('react-native');
    function MockFilterList({selectedFilter}: {selectedFilter?: string}) {
        return (
            <View testID="FilterList">
                <Text>{`selectedFilter:${selectedFilter ?? 'undefined'}`}</Text>
            </View>
        );
    }
    return MockFilterList;
});

// SearchAdvancedFiltersContent renders the concrete per-filter content (date pickers, amount inputs, ...).
// Stub it to surface the `filterKey` (== effectiveFilter) the host selected to display.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent', () => {
    const {View, Text} = jest.requireActual<MockReactNativePrimitives>('react-native');
    function MockSearchAdvancedFiltersContent({filterKey}: {filterKey?: string}) {
        return (
            <View testID={`content-${filterKey ?? 'undefined'}`}>
                <Text>{`filterKey:${filterKey ?? 'undefined'}`}</Text>
            </View>
        );
    }
    return MockSearchAdvancedFiltersContent;
});

// useUpdateFilterQuery only matters when the user edits a filter value; it pulls in Navigation/query-building.
// The host just needs `updateFilterQueryParams` to exist for the (untriggered) onChange handler.
jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({updateFilterQueryParams: jest.fn(), setFilterQueryParams: jest.fn()}),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

// The year-selector hide gate reads useRootNavigationState via useIsYearSelectorOpen; resolve the selector
// against an undefined navigation state so the bare navigation mock above doesn't crash (mirrors CalendarPickerTest).
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: undefined) => unknown) => selector(undefined),
}));

// A real, fully-typed SearchQueryJSON (the host only forwards it to the mocked useUpdateFilterQuery and to the
// mocked content's policyIDQuery, so a minimal expense query is enough). buildSearchQueryJSON returns undefined
// only for an unparseable query; throw if that ever happens so the prop stays non-optional without a cast.
const builtQueryJSON = buildSearchQueryJSON(`${CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE}:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);
if (!builtQueryJSON) {
    throw new Error('Failed to build the test SearchQueryJSON');
}
const queryJSON = builtQueryJSON;

const TYPE = CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE;
const DATE = CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;

describe('SearchAdvancedFiltersPopup year-selector return (BUG#1)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    test('with no pending year write-back, the host shows the default Type filter (not Date)', async () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
        await waitForBatchedUpdates();

        // The default selectedFilter is TYPE, and nothing forces Date, so both the menu and the content are on Type.
        expect(screen.getByText(`selectedFilter:${TYPE}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`content-${TYPE}`)).toBeOnTheScreen();
        expect(screen.queryByTestId(`content-${DATE}`)).toBeNull();
    });

    test('a NON-search-context pending year write-back does NOT force Date (stays on default Type)', async () => {
        // A DOB/date-input picker writes a `datePicker-*` context — only `search*` contexts belong to this host,
        // so this one must be ignored and the menu must keep its normal default.
        setCalendarPickerSelectedYear('datePicker-dob', 1995);
        await waitForBatchedUpdates();

        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
        await waitForBatchedUpdates();

        expect(screen.getByText(`selectedFilter:${TYPE}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`content-${TYPE}`)).toBeOnTheScreen();
        expect(screen.queryByTestId(`content-${DATE}`)).toBeNull();
    });

    test('a pending SEARCH-context year write-back forces the Date view (BUG#1 fix)', async () => {
        // Simulate returning from the year selector that was opened from the search single-date picker.
        setCalendarPickerSelectedYear('searchSingleDate', 2018);
        await waitForBatchedUpdates();

        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
        await waitForBatchedUpdates();

        // effectiveFilter is forced to DATE so the CalendarPicker re-mounts to consume the picked year,
        // instead of the popover resetting to the Type menu.
        expect(screen.getByText(`selectedFilter:${DATE}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`content-${DATE}`)).toBeOnTheScreen();
        expect(screen.queryByTestId(`content-${TYPE}`)).toBeNull();
    });

    test('any other search* context (e.g. searchRangeFrom) also forces the Date view', async () => {
        // The host gates on contextID.startsWith('search'), so every search picker context (single/range from/to)
        // routes the return back to the Date view, not just the single-date one.
        setCalendarPickerSelectedYear('searchRangeFrom', 2020);
        await waitForBatchedUpdates();

        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
        await waitForBatchedUpdates();

        expect(screen.getByText(`selectedFilter:${DATE}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`content-${DATE}`)).toBeOnTheScreen();
    });

    test('once the pending search year is cleared, the host returns to the default Type filter', async () => {
        setCalendarPickerSelectedYear('searchSingleDate', 2018);
        await waitForBatchedUpdates();
        clearCalendarPickerSelectedYear();
        await waitForBatchedUpdates();

        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);
        await waitForBatchedUpdates();

        // No pending search write-back => nothing forces Date => default Type menu.
        expect(screen.getByText(`selectedFilter:${TYPE}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`content-${TYPE}`)).toBeOnTheScreen();
        expect(screen.queryByTestId(`content-${DATE}`)).toBeNull();
    });
});
