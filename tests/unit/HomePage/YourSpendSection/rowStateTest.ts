import type {OnyxEntry} from 'react-native-onyx';
import {getYourSpendRowState, YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/useYourSpendData';
import type SearchResults from '@src/types/onyx/SearchResults';

// Helpers

const makeSearchResults = (overrides: Partial<SearchResults> = {}): SearchResults =>
    ({
        search: {
            offset: 0,
            type: 'expense',
            status: '',
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            count: 5,
        },
        data: {},
        ...overrides,
    }) as SearchResults;

const makeSearchResultsWithCount = (count: number): SearchResults =>
    makeSearchResults({
        search: {
            offset: 0,
            type: 'expense',
            status: '',
            hasMoreResults: false,
            hasResults: count > 0,
            isLoading: false,
            count,
        },
    });

// Not applicable -> always HIDDEN regardless of data

describe('getYourSpendRowState — not applicable', () => {
    it('returns HIDDEN when row is not applicable, no data', () => {
        const state = getYourSpendRowState({isApplicable: false, isOffline: false, searchResults: undefined});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.HIDDEN);
    });

    it('returns HIDDEN when row is not applicable, even with results', () => {
        const state = getYourSpendRowState({isApplicable: false, isOffline: false, searchResults: makeSearchResultsWithCount(10)});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.HIDDEN);
    });
});

// Applicable — online, no data yet → LOADING

describe('getYourSpendRowState — applicable, online, loading', () => {
    it('returns LOADING when online and searchResults is undefined', () => {
        const state = getYourSpendRowState({isApplicable: true, isOffline: false, searchResults: undefined});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.LOADING);
    });
});

// Applicable — offline handling
// Per plan: "Offline with no cached snapshot → LOADING indefinitely is
// prevented by short-circuiting to HIDDEN_EMPTY when isOffline && !searchResults."

describe('getYourSpendRowState — offline', () => {
    it('returns HIDDEN_EMPTY when offline with no cached snapshot', () => {
        // Prevents skeleton-stuck-forever bug: offline + no data → hide rather than spin
        const state = getYourSpendRowState({isApplicable: true, isOffline: true, searchResults: undefined as OnyxEntry<SearchResults>});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });

    it('returns READY when offline but cached snapshot exists with results', () => {
        const state = getYourSpendRowState({isApplicable: true, isOffline: true, searchResults: makeSearchResultsWithCount(3)});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.READY);
    });
});

// Applicable — online, data loaded

describe('getYourSpendRowState — applicable, data loaded', () => {
    it('returns READY when count > 0', () => {
        const state = getYourSpendRowState({isApplicable: true, isOffline: false, searchResults: makeSearchResultsWithCount(1)});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.READY);
    });

    it('returns READY when count is large', () => {
        const state = getYourSpendRowState({isApplicable: true, isOffline: false, searchResults: makeSearchResultsWithCount(100)});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.READY);
    });

    it('returns HIDDEN_EMPTY when count === 0', () => {
        // Hide approval/payment rows whose count === 0 (per plan decision #8)
        const state = getYourSpendRowState({isApplicable: true, isOffline: false, searchResults: makeSearchResultsWithCount(0)});
        expect(state).toBe(YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY);
    });
});
