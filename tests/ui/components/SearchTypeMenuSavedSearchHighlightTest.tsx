import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type * as SearchContext from '@components/Search/SearchContext';
import type {SearchQueryContextValue} from '@components/Search/types';

import {useSearchTypeMenuSectionsForNavigation} from '@hooks/useSearchTypeMenuSections';
import type * as SearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON, normalizeDatePresetsInQuery} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import StaticSearchTypeMenu from '@pages/Search/SearchPageNarrow/StaticSearchTypeMenu';
import SearchTypeMenuNarrow from '@pages/Search/SearchTypeMenuNarrow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import {useNavigation} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useTodoCounts', () => ({
    __esModule: true,
    default: jest.fn(() => ({counts: {}})),
}));

jest.mock('@hooks/useSearchTypeMenuSections', () => ({
    ...jest.requireActual<typeof SearchTypeMenuSections>('@hooks/useSearchTypeMenuSections'),
    useSearchTypeMenuSectionsForNavigation: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useNavigation: jest.fn(() => ({dispatch: jest.fn()})),
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@components/Search/SearchContext', () => {
    const actualSearchContext: typeof SearchContext = jest.requireActual('@components/Search/SearchContext');
    return {
        __esModule: true,
        ...actualSearchContext,
        useSearchQueryContext: jest.fn(),
    };
});

const mockedUseSearchQueryContext = jest.mocked(useSearchQueryContext);

const defaultSearchContext: SearchQueryContextValue = {
    currentSearchHash: -1,
    currentSimilarSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
    suggestedSearches: getSuggestedSearches(),
    shouldResetSearchQuery: false,
};

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>{children}</LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

describe('Search saved-search tab highlight', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.mocked(useNavigation).mockReturnValue({dispatch: jest.fn()});
        jest.mocked(useSearchTypeMenuSectionsForNavigation).mockReturnValue([{translationPath: 'search.savedSearchesMenuItemTitle', menuItems: []}]);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        jest.clearAllMocks();
    });

    it('restores the edited Approve query when pressing its narrow-menu tab', async () => {
        // Given Approve has a stored query with To removed and another tab is active
        const editedQuery = 'type:expense-report action:approve status:approved policyID:456';
        const dispatch = jest.fn();
        jest.mocked(useNavigation).mockReturnValue({dispatch});
        mockedUseSearchQueryContext.mockReturnValue({...defaultSearchContext, currentSearchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS});
        jest.mocked(useSearchTypeMenuSectionsForNavigation).mockReturnValue([
            {
                translationPath: 'search.tabs.expenseReports',
                menuItems: [
                    {
                        ...getSuggestedSearches()[CONST.SEARCH.SEARCH_KEYS.APPROVE],
                        searchQuery: 'type:expense-report action:approve to:123',
                    },
                ],
            },
        ]);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[CONST.SEARCH.SEARCH_KEYS.APPROVE]: {query: editedQuery, timestamp: '2026-01-01 00:00:00'}});
        });

        // When returning to Approve through the interactive narrow menu
        render(
            <Wrapper>
                <SearchTypeMenuNarrow />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('tab', {name: 'Needs approval'}));

        // Then navigation retains the edited query rather than restoring the default To restriction
        expect(dispatch).toHaveBeenCalledWith({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {params: {q: normalizeDatePresetsInQuery(editedQuery), name: undefined, rawQuery: undefined, searchKey: CONST.SEARCH.SEARCH_KEYS.APPROVE}},
        });
    });

    it("keeps saved search selected in static narrow menu when it's selected", async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        mockedUseSearchQueryContext.mockReturnValue({...defaultSearchContext, currentSearchKey: savedSearchIDToSearchKey(savedQueryJSON.hash.toString())});

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                },
            });
        });

        render(
            <Wrapper>
                <StaticSearchTypeMenu queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByRole('tab', {name: 'My saved search', selected: true})).toBeTruthy();
    });

    it("keeps saved search selected in interactive narrow menu when it's selected", async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        mockedUseSearchQueryContext.mockReturnValue({...defaultSearchContext, currentSearchKey: savedSearchIDToSearchKey(savedQueryJSON.hash.toString())});

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                },
            });
        });

        render(
            <Wrapper>
                <SearchTypeMenuNarrow queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByRole('tab', {name: 'My saved search', selected: true})).toBeTruthy();
    });
});
