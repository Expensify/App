import {act, renderHook} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import SearchQueryProvider from '@components/Search/SearchQueryProvider';

import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {useContext} from 'react';

let mockAccountID = 1;
let mockRootState: unknown;
let mockFocusedScreen: {name: string; params: {q: string; rawQuery?: string}} | undefined;
const mockNavigationListeners = new Set<() => void>();

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => true,
        getRootState: () => mockRootState,
        addListener: (_event: string, listener: () => void) => {
            mockNavigationListeners.add(listener);
            return () => mockNavigationListeners.delete(listener);
        },
    },
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useNavigation: () => ({getState: () => mockRootState}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {setParams: jest.fn()},
    getDeepestFocusedScreen: () => mockFocusedScreen,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: mockAccountID, email: ''}),
}));

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/useCardFeedsForDisplay', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useLoadSearchCategoryData', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useShouldReturnTripRooms', () => ({__esModule: true, default: () => false}));

function setSearchRoute(q?: string, rawQuery?: string) {
    mockFocusedScreen = q === undefined ? undefined : {name: SCREENS.SEARCH.ROOT, params: {q, rawQuery}};
    mockRootState = {
        index: 0,
        routes: [
            {
                key: 'tab',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes:
                        q === undefined
                            ? [{name: SCREENS.SETTINGS.ROOT}]
                            : [
                                  {
                                      name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                      state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT, params: {q, rawQuery}}]},
                                  },
                              ],
                },
            },
        ],
    };
    act(() => {
        for (const listener of mockNavigationListeners) {
            listener();
        }
    });
}

describe('SearchQueryProvider account-scoped retention', () => {
    beforeEach(() => {
        mockAccountID = 1;
        mockNavigationListeners.clear();
        mockRootState = undefined;
    });

    it('retains the query and raw filters when navigation drops Search within the same account', () => {
        // Given a real provider and navigation subscription have observed a query with raw filters
        const query = 'type:expense merchant:Amazon';
        const rawQuery = 'type:expense merchant:Amazon';
        setSearchRoute(query, rawQuery);
        const {result} = renderHook(() => useContext(SearchQueryContext), {wrapper: SearchQueryProvider});
        const originalQuery = result.current.currentSearchQueryJSON;
        expect(originalQuery?.hash).toBe(buildSearchQueryJSON(query, rawQuery)?.hash);

        // When Search is removed from the root state without changing the account
        setSearchRoute();

        // Then the whole query, including its raw filter list, remains available
        expect(result.current.currentSearchQueryJSON).toEqual(originalQuery);
    });

    it.each([
        [1, 2],
        [2, 1],
    ])('drops the old query after switching from account %s to %s without remounting the provider', (previousAccountID, accountID) => {
        // Given the provider has recorded the previous account's Drafts query
        mockAccountID = previousAccountID;
        const oldQuery = `type:expense-report action:submit from:${previousAccountID}`;
        setSearchRoute(oldQuery, oldQuery);
        const {result, rerender} = renderHook(() => useContext(SearchQueryContext), {wrapper: SearchQueryProvider});
        expect(result.current.currentSearchQueryJSON?.hash).toBe(buildSearchQueryJSON(oldQuery)?.hash);

        // When the account changes while the navigation subscription still holds the old value,
        // followed by the reset to a non-Search screen before Spend is reopened
        mockAccountID = accountID;
        rerender({});
        setSearchRoute();
        rerender({});

        // Then the old query and raw filters cannot be used as a fallback even after loading has finished
        expect(result.current.currentSearchQueryJSON).toEqual(buildSearchQueryJSON(buildSearchQueryString()));

        // When the new account opens Drafts and later leaves Search
        const newQuery = `type:expense-report action:submit from:${accountID}`;
        setSearchRoute(newQuery, newQuery);
        setSearchRoute();

        // Then only that account's newly observed query is retained
        expect(result.current.currentSearchQueryJSON).toEqual(buildSearchQueryJSON(newQuery, newQuery));
    });
});
