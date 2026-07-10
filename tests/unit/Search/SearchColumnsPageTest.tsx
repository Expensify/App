import {render, waitFor} from '@testing-library/react-native';

import type {SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import SearchColumnsPage from '@pages/Search/SearchColumnsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type SearchResults from '@src/types/onyx/SearchResults';

import React from 'react';
import Onyx from 'react-native-onyx';

// The page renders ColumnsSettingsList and hands it applyChanges as onSave; the list itself is
// irrelevant here, so it is stubbed to capture that callback.
const mockColumnsSettingsList = jest.fn();
jest.mock('@components/ColumnsSettingsList', () => ({
    __esModule: true,
    default: (props: unknown) => {
        mockColumnsSettingsList(props);
        return null;
    },
}));

let mockSearchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm> | undefined;
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockSearchAdvancedFiltersForm],
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

let mockCurrentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined;
let mockCurrentSearchResults: SearchResults | undefined;
let mockShouldUseLiveData = false;
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: mockCurrentSearchQueryJSON}),
    useSearchResultsContext: () => ({currentSearchResults: mockCurrentSearchResults, shouldUseLiveData: mockShouldUseLiveData}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

const mockIsSearchDataLoaded = jest.fn();
jest.mock('@libs/SearchUIUtils', () => ({
    getCustomColumns: () => ({}),
    getCustomColumnDefault: () => [],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- variadic passthrough to the jest mock defined above
    isSearchDataLoaded: (...args: unknown[]) => mockIsSearchDataLoaded(...args),
}));

const mockNavigate = Navigation.navigate as jest.Mock;

// SearchQueryUtils is intentionally NOT mocked: the offline pre-seed only fires when the rebuilt
// query differs from the current one by nothing but `columns`, and that equivalence check is the
// behavior under test, so it must run against the real query builder/parser.

const SORT_OPTIONS = {sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE, sortOrder: CONST.SEARCH.SORT_ORDER.DESC};

const baseForm: Partial<SearchAdvancedFiltersForm> = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    keyword: 'coffee',
    columns: [CONST.SEARCH.TABLE_COLUMNS.MERCHANT],
};

const newColumns: SearchCustomColumnIds[] = [CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.EXPORTED];

function buildQueryJSONFromForm(form: Partial<SearchAdvancedFiltersForm>) {
    return buildSearchQueryJSON(buildQueryStringFromFilterFormValues(form, SORT_OPTIONS));
}

function makeSearchResults(): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixture is intentionally partial
    return {
        data: {personalDetailsList: {}},
        search: {isLoading: false, hasMoreResults: false, type: CONST.SEARCH.DATA_TYPES.EXPENSE},
    } as unknown as SearchResults;
}

function renderPageAndGetOnSave() {
    render(<SearchColumnsPage />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowing the captured stub props to the onSave callback under test
    const props = mockColumnsSettingsList.mock.calls.at(-1)?.[0] as {onSave: (selectedColumnIds: SearchCustomColumnIds[]) => void};
    return props.onSave;
}

describe('SearchColumnsPage', () => {
    let setSpy: jest.SpyInstance;

    beforeEach(() => {
        mockColumnsSettingsList.mockClear();
        mockNavigate.mockClear();
        mockIsSearchDataLoaded.mockReset().mockReturnValue(true);
        setSpy = jest.spyOn(Onyx, 'set').mockImplementation(() => Promise.resolve());
        mockIsOffline = false;
        mockShouldUseLiveData = false;
        mockSearchAdvancedFiltersForm = baseForm;
        mockCurrentSearchQueryJSON = buildQueryJSONFromForm(baseForm);
        mockCurrentSearchResults = makeSearchResults();
    });

    afterEach(() => {
        setSpy.mockRestore();
    });

    it('pre-seeds the destination snapshot and navigates when offline and only columns changed', async () => {
        mockIsOffline = true;

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        const expectedQueryString = buildQueryStringFromFilterFormValues({...baseForm, columns: newColumns}, SORT_OPTIONS);
        const expectedQueryJSON = buildSearchQueryJSON(expectedQueryString);

        // Navigation must wait for the snapshot copy to settle so the destination hash has data when Search reads it.
        expect(mockNavigate).not.toHaveBeenCalled();

        // The column change produces a new hash, which is why the destination snapshot is empty offline.
        expect(expectedQueryJSON?.hash).not.toBe(mockCurrentSearchQueryJSON?.hash);
        expect(setSpy).toHaveBeenCalledTimes(1);
        expect(setSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expectedQueryJSON?.hash}`, expect.objectContaining({data: mockCurrentSearchResults?.data}));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: expectedQueryString}), {forceReplace: true});
        });
    });

    it('navigates without pre-seeding any snapshot when online', () => {
        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        const expectedQueryString = buildQueryStringFromFilterFormValues({...baseForm, columns: newColumns}, SORT_OPTIONS);

        expect(setSpy).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: expectedQueryString}), {forceReplace: true});
    });

    it('does not copy the loaded snapshot when offline and the query changed beyond columns', () => {
        mockIsOffline = true;
        // The form drifted from the currently loaded query (different keyword), so the rebuilt
        // query is not a columns-only variation and must not reuse the loaded results.
        mockSearchAdvancedFiltersForm = {...baseForm, keyword: 'tea'};

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        expect(setSpy).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not copy anything when offline and the current snapshot has not finished loading', () => {
        mockIsOffline = true;
        mockIsSearchDataLoaded.mockReturnValue(false);

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        expect(setSpy).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not copy anything when offline and the results are synthesized from live to-do data', () => {
        mockIsOffline = true;
        mockShouldUseLiveData = true;

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        expect(setSpy).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('still navigates when the snapshot copy fails', async () => {
        mockIsOffline = true;
        setSpy.mockImplementation(() => Promise.reject(new Error('write failed')));

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        expect(setSpy).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });
    });

    it('drops transient request state from the copied snapshot', () => {
        mockIsOffline = true;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixture is intentionally partial
        mockCurrentSearchResults = {
            data: {personalDetailsList: {}},
            search: {isLoading: true, hasMoreResults: false, type: CONST.SEARCH.DATA_TYPES.EXPENSE},
            errors: {error: 'stale error from an interrupted request'},
        } as unknown as SearchResults;

        const onSave = renderPageAndGetOnSave();
        onSave(newColumns);

        expect(setSpy).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowing the captured spy payload to the copied snapshot under test
        const copiedSnapshot = setSpy.mock.calls.at(0)?.[1] as SearchResults;
        // No request ever runs against the destination hash, so stale flags would never clear there.
        expect(copiedSnapshot.errors).toBeUndefined();
        // Everything else in `search` (type, status, hasMoreResults, ...) must survive the copy, or the
        // destination snapshot would fail isSearchDataLoaded and re-break the offline flow.
        expect(copiedSnapshot.search).toEqual({...mockCurrentSearchResults.search, isLoading: false});
        expect(copiedSnapshot.data).toEqual(mockCurrentSearchResults.data);
    });

    it('pre-seeds the destination snapshot for a grouped query when offline and only columns changed', async () => {
        mockIsOffline = true;
        const groupedForm: Partial<SearchAdvancedFiltersForm> = {
            ...baseForm,
            groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY],
        };
        mockSearchAdvancedFiltersForm = groupedForm;
        mockCurrentSearchQueryJSON = buildQueryJSONFromForm(groupedForm);

        const onSave = renderPageAndGetOnSave();
        const groupedNewColumns: SearchCustomColumnIds[] = [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY, CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT];
        onSave(groupedNewColumns);

        // The parser derives each group-by's own default sort (e.g. groupCategory), so the expected
        // string must use the parsed query's sort — exactly the inputs the page passes to the builder.
        const expectedQueryString = buildQueryStringFromFilterFormValues(
            {...groupedForm, columns: groupedNewColumns},
            {sortBy: mockCurrentSearchQueryJSON?.sortBy, sortOrder: mockCurrentSearchQueryJSON?.sortOrder},
        );
        const expectedQueryJSON = buildSearchQueryJSON(expectedQueryString);

        expect(expectedQueryJSON?.hash).not.toBe(mockCurrentSearchQueryJSON?.hash);
        expect(setSpy).toHaveBeenCalledTimes(1);
        expect(setSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expectedQueryJSON?.hash}`, expect.objectContaining({data: mockCurrentSearchResults?.data}));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: expectedQueryString}), {forceReplace: true});
        });
    });
});
