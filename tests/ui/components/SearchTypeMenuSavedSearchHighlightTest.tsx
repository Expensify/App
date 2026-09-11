import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type * as SearchContext from '@components/Search/SearchContext';
import type {SearchQueryContextValue} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches, savedSearchIDToSearchKey} from '@libs/SearchUIUtils';

import StaticSearchTypeMenu from '@pages/Search/SearchPageNarrow/StaticSearchTypeMenu';
import SearchTypeMenuNarrow from '@pages/Search/SearchTypeMenuNarrow';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useTodoCounts', () => ({
    __esModule: true,
    default: jest.fn(() => ({counts: {}})),
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

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        jest.clearAllMocks();
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
