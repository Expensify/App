import {render} from '@testing-library/react-native';

import type {SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SearchColumnsPage from '@src/pages/Search/SearchColumnsPage';
import type {SearchResults} from '@src/types/onyx';

import React from 'react';

// Capture what the picker hands the list instead of asserting on rendered rows: `currentColumns` IS the
// seed under test, and the real list adds drag handles and Onyx-backed labels that are irrelevant here.
const capturedProps: {currentColumns?: SearchCustomColumnIds[]; allColumns?: SearchCustomColumnIds[]; isLoadingIndicatorShown?: boolean} = {};
jest.mock('@components/ColumnsSettingsList', () => ({
    __esModule: true,
    default: (props: {currentColumns: SearchCustomColumnIds[]; allColumns: SearchCustomColumnIds[]}) => {
        capturedProps.currentColumns = props.currentColumns;
        capturedProps.allColumns = props.allColumns;
        return null;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'submitter@test.com'}),
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined}),
}));

jest.mock('@components/FullscreenLoadingIndicator', () => ({
    __esModule: true,
    default: () => {
        capturedProps.isLoadingIndicatorShown = true;
        return null;
    },
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

const onyxData: Record<string, unknown> = {};
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => [options?.selector ? options.selector(onyxData[key]) : onyxData[key]],
}));

let mockResultsContext: {currentSearchResults: SearchResults | undefined; shouldUseLiveData: boolean} = {
    currentSearchResults: undefined,
    shouldUseLiveData: false,
};
let mockQueryContext: {currentSearchKey: string | undefined; currentSearchQueryJSON: SearchQueryJSON | undefined} = {
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => mockResultsContext,
    useSearchQueryContext: () => mockQueryContext,
}));

const POLICY_ID = 'policy1';
const ACCOUNT_ID = 1;

/** A resolved expense snapshot with exactly one transaction that has a description. */
function buildSnapshot(withDescription: boolean): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture only carries the fields getColumnsToShow reads
    return {
        search: {
            offset: 0,
            hash: 123,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            count: 1,
            total: 2500,
            currency: 'USD',
        },
        data: {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: {
                transactionID: '1',
                reportID: 'report1',
                policyID: POLICY_ID,
                accountID: ACCOUNT_ID,
                amount: -2500,
                currency: 'USD',
                merchant: 'Test Merchant',
                created: '2026-09-18',
                comment: withDescription ? {comment: 'Lunch with client'} : {},
            },
        },
    } as unknown as SearchResults;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture only carries the fields the picker reads
const EXPENSE_QUERY_JSON = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    groupBy: undefined,
    filters: {},
    flatFilters: [],
    hash: 123,
    recentSearchHash: 123,
    inputQuery: 'type:expense',
} as unknown as SearchQueryJSON;

/** The same expense query with a groupBy applied. */
function buildGroupedQueryJSON(groupBy: string): SearchQueryJSON {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture only carries the fields the picker reads
    return {...EXPENSE_QUERY_JSON, groupBy} as unknown as SearchQueryJSON;
}

describe('SearchColumnsPage seeding (Part A)', () => {
    beforeEach(() => {
        capturedProps.currentColumns = undefined;
        capturedProps.allColumns = undefined;
        capturedProps.isLoadingIndicatorShown = undefined;
        mockIsOffline = false;
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockResultsContext = {currentSearchResults: undefined, shouldUseLiveData: false};
        mockQueryContext = {currentSearchKey: undefined, currentSearchQueryJSON: EXPENSE_QUERY_JSON};
    });

    test('seeds the picker from the snapshot so a data-driven Description renders as checked', () => {
        // Given an expense snapshot whose only transaction has a description, and no saved column selection
        const snapshot = buildSnapshot(true);
        mockResultsContext = {currentSearchResults: snapshot, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then Description is seeded as selected, because the table derives it from the same data. Seeding from
        // the static default list instead would show it unchecked while the table renders it.
        expect(capturedProps.currentColumns).toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
    });

    test('does not seed Description when no transaction has one', () => {
        // Given the same snapshot with the description removed
        const snapshot = buildSnapshot(false);
        mockResultsContext = {currentSearchResults: snapshot, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then Description stays unchecked, matching a table that does not render the column
        expect(capturedProps.currentColumns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
    });

    test('an explicit saved selection wins over the snapshot seed', () => {
        // Given a saved selection equal to the built-in default set, which omits Description. This is the exact
        // fixed point that used to make unchecking Description a no-op.
        const savedColumns = Object.values(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE);
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE, columns: savedColumns};
        const snapshot = buildSnapshot(true);
        mockResultsContext = {currentSearchResults: snapshot, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then the saved selection is authoritative and the data-driven seed is ignored, so unchecking sticks
        expect(capturedProps.currentColumns).toEqual(savedColumns);
        expect(capturedProps.currentColumns).not.toContain(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION);
    });

    test('skips the seed for a grouped search, where it could only ever be empty', () => {
        // Given a grouped search: getColumnsToShow returns only GROUP_* columns, none of which are selectable here
        mockQueryContext = {currentSearchKey: undefined, currentSearchQueryJSON: buildGroupedQueryJSON(CONST.SEARCH.GROUP_BY.MERCHANT)};
        onyxData[ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM] = {type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: CONST.SEARCH.GROUP_BY.MERCHANT};
        const snapshot = buildSnapshot(true);
        mockResultsContext = {currentSearchResults: snapshot, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then nothing is seeded, leaving ColumnsSettingsList on its own group-defaults fallback
        expect(capturedProps.currentColumns).toEqual([]);
    });

    test('waits for the snapshot while a sort is in flight instead of seeding the static defaults', () => {
        // Given a sort that swapped in a new snapshot the server has not filled yet, while the table still shows
        // the previous rows
        mockResultsContext = {currentSearchResults: undefined, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then it shows a loading indicator and does not mount the list, which reads its seed only once on mount
        expect(capturedProps.isLoadingIndicatorShown).toBe(true);
        expect(capturedProps.currentColumns).toBeUndefined();
    });

    test('does not wait for the snapshot while offline', () => {
        // Given the same unfilled snapshot, but offline, where the server will not respond until reconnecting
        mockIsOffline = true;
        mockResultsContext = {currentSearchResults: undefined, shouldUseLiveData: false};

        // When the picker renders
        render(<SearchColumnsPage />);

        // Then the list mounts on its static-defaults fallback rather than spinning indefinitely
        expect(capturedProps.isLoadingIndicatorShown).toBeUndefined();
        expect(capturedProps.currentColumns).toEqual([]);
    });
});
