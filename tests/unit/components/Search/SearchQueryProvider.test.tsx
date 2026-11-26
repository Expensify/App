import {act, renderHook} from '@testing-library/react-native';

import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import SearchQueryProvider from '@components/Search/SearchQueryProvider';

import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useContext} from 'react';

import createRandomPolicy from '../../../utils/collections/policies';

let mockAccountID = 1;
let mockPolicies: OnyxCollection<Policy>;
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

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = key === jest.requireActual<{default: typeof ONYXKEYS}>('@src/ONYXKEYS').default.COLLECTION.POLICY ? mockPolicies : undefined;
        return [options?.selector ? options.selector(value) : value];
    },
}));
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

function buildPolicies(policy: Partial<Policy>): OnyxCollection<Policy> {
    return {
        [`${ONYXKEYS.COLLECTION.POLICY}1`]: {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
            role: CONST.POLICY.ROLE.ADMIN,
            areExpensifyCardsEnabled: false,
            ...policy,
        },
    };
}

describe('SearchQueryProvider policy updates', () => {
    beforeEach(() => {
        mockAccountID = 1;
        mockNavigationListeners.clear();
        mockRootState = undefined;
    });

    it('keeps the same context value when a policy changes without changing the Expensify Card flag', () => {
        // Given the provider has built its value from the current policies
        mockPolicies = buildPolicies({name: 'Workspace'});
        setSearchRoute(buildSearchQueryString());
        const {result, rerender} = renderHook(() => useContext(SearchQueryContext), {wrapper: SearchQueryProvider});
        const firstValue = result.current;

        // When a policy field the suggested searches don't read changes, as any policy update does
        mockPolicies = buildPolicies({name: 'Renamed workspace'});
        rerender({});

        // Then the value is the same object, so the Search page and every other consumer don't render again
        expect(result.current).toBe(firstValue);
    });

    it('rebuilds the suggested searches when a policy enables the Expensify Card', () => {
        // Given an admin of a paid workspace without the Expensify Card
        mockPolicies = buildPolicies({areExpensifyCardsEnabled: false});
        setSearchRoute(buildSearchQueryString());
        const {result, rerender} = renderHook(() => useContext(SearchQueryContext), {wrapper: SearchQueryProvider});
        const firstSuggestedSearches = result.current.suggestedSearches;

        // When the workspace enables the Expensify Card
        mockPolicies = buildPolicies({areExpensifyCardsEnabled: true});
        rerender({});

        // Then the reconciliation search switches to Expensify Card withdrawals
        const reconciliationKey = CONST.SEARCH.SEARCH_KEYS.RECONCILIATION;
        expect(result.current.suggestedSearches).not.toBe(firstSuggestedSearches);
        expect(result.current.suggestedSearches[reconciliationKey].searchQuery).toBe(getSuggestedSearches(mockAccountID, undefined, true)[reconciliationKey].searchQuery);
    });
});

describe('SearchQueryProvider account-scoped retention', () => {
    beforeEach(() => {
        mockAccountID = 1;
        mockPolicies = undefined;
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
