/** Verifies saved sorting survives the router's readable input and submission round-trip. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import type {SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockCurrentQuery: Readonly<SearchQueryJSON> | undefined;
let mockIsSavedSearch = true;
let mockIsFromSearchPage = true;
let mockOnListItemPress: ((item: SearchQueryItem) => void) | undefined;
const mockGetSearchKeyForQuery = jest.fn(() => undefined);

jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<typeof import('@components/Search/SearchContext')>('@components/Search/SearchContext'),
    useSearchQueryContext: () => ({
        currentSearchQueryJSON: mockCurrentQuery,
        currentSearchHash: mockCurrentQuery?.hash,
        currentSearchKey: mockIsSavedSearch ? savedSearchIDToSearchKey('saved-sort') : CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    }),
    useSearchQueryActions: () => ({setShouldResetSearchQuery: jest.fn(), getSearchKeyForQuery: mockGetSearchKeyForQuery}),
}));

jest.mock('@components/Search/SearchRouter/SearchRouterContext', () => ({
    peekPendingRouterState: () => ({query: '', isFromSearchPageSearchButton: mockIsFromSearchPage}),
    clearPendingRouterState: jest.fn(),
}));

jest.mock('@components/Search/DeferredSearchAutocompleteList', () => ({
    __esModule: true,
    default: ({onListItemPress}: {onListItemPress: (item: SearchQueryItem) => void}) => {
        mockOnListItemPress = onListItemPress;
        return null;
    },
}));

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@src/hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => ({
        contextualReportID: undefined,
        isSearchRouterScreen: false,
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
            getRootState: () => undefined,
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

async function renderSearchRouter() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <SearchRouter
                onRouterClose={jest.fn()}
                isSearchRouterDisplayed
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

function submitQuery(query: string, isSeparateSuggestion = false) {
    fireEvent.changeText(screen.getByTestId('search-autocomplete-text-input'), query);
    act(() => {
        mockOnListItemPress?.({
            text: query,
            searchQuery: query,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.SEARCH,
            keyForList: isSeparateSuggestion ? 'separate-search' : CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.FIND_ITEM,
        });
    });
}

function getNavigatedQuery() {
    expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    const route = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
    if (typeof route !== 'string') {
        throw new Error('Expected a search route');
    }
    const params = new URLSearchParams(route.slice(route.indexOf('?') + 1));
    return {query: buildSearchQueryJSON(params.get('q') ?? ''), params};
}

describe('SearchRouter saved search sorting', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsSavedSearch = true;
        mockIsFromSearchPage = true;
        mockOnListItemPress = undefined;
        mockCurrentQuery = buildSearchQueryJSON('type:expense from:123 sortBy:amount sortOrder:asc');
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 123, email: 'saved-search@example.com'});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each(['asc', 'desc'])('retains Amount %s and From after unsupported grouping is appended', async (sortOrder) => {
        // Given a saved search whose readable input hides its Amount sorting
        mockCurrentQuery = buildSearchQueryJSON(`type:expense from:123 sortBy:amount sortOrder:${sortOrder}`);
        await renderSearchRouter();
        const input = screen.getByTestId('search-autocomplete-text-input');
        const readableQuery = input.props.value as string;
        expect(readableQuery).not.toMatch(/sort-?by|sort-?order/i);
        expect(readableQuery).toContain('from:me');

        // When the edited query is submitted through the router's Find item
        submitQuery(`${readableQuery} group-by:reports`);

        // Then navigation retains the saved sort, resolves me to its account ID, and keeps the saved identity
        const {query, params} = getNavigatedQuery();
        expect(query).toMatchObject({sortBy: 'amount', sortOrder});
        expect(query?.flatFilters).toEqual(mockCurrentQuery?.flatFilters);
        expect(params.get('searchKey')).toBe(savedSearchIDToSearchKey('saved-sort'));
        expect(params.get('rawQuery')).not.toMatch(/sort-?by|sort-?order/i);
    });

    it.each([
        ['supported grouping', 'type:expense from:me group-by:category', 'groupCategory', 'asc'],
        ['explicit sorting', 'type:expense from:me sort-by:date sort-order:asc', 'date', 'asc'],
    ])('respects %s when submitting a saved search edit', async (_scenario, input, sortBy, sortOrder) => {
        // Given a saved Amount sort that must not override the edited query's sorting rules
        await renderSearchRouter();

        // When the user changes grouping or explicitly specifies sorting
        submitQuery(input);

        // Then the new query and search-key lookup both receive the resulting sort
        const {query} = getNavigatedQuery();
        expect(query).toMatchObject({sortBy, sortOrder});
        expect(mockGetSearchKeyForQuery).toHaveBeenCalledWith(expect.objectContaining({sortBy, sortOrder}));
    });

    it.each(['unsaved search', 'global search', 'separate suggestion'])('does not inherit sorting for a %s', async (scenario) => {
        // Given a search submission outside editing the active saved search
        mockIsSavedSearch = scenario !== 'unsaved search';
        mockIsFromSearchPage = scenario !== 'global search';
        await renderSearchRouter();

        // When a new query is submitted without sort fields
        submitQuery('type:expense from:123', scenario === 'separate suggestion');

        // Then the new search uses its default Date descending sort
        expect(getNavigatedQuery().query).toMatchObject({sortBy: 'date', sortOrder: 'desc'});
    });
});
