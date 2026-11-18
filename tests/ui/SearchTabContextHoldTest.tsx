import {render} from '@testing-library/react-native';

import {SearchQueryContext, SearchResultsContext, useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import {EMPTY_TRANSACTIONS_BY_REPORT_ID} from '@components/Search/SearchContextDefinitions';
import type {SearchQueryContextValue, SearchResultsContextValue} from '@components/Search/types';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';

import SearchTabContextHold from '@libs/Navigation/AppNavigator/SearchTabContextHold/index.native';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useHasTabBeenShown', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

function buildContexts(hash: number): {query: SearchQueryContextValue; results: SearchResultsContextValue} {
    return {
        query: {
            currentSearchHash: hash,
            currentSimilarSearchHash: hash,
            currentSearchKey: undefined,
            currentSearchQueryJSON: undefined,
            currentDefaultSearchQueryJSON: undefined,
            currentDefaultSearchQueryFilterKeys: new Set(),
            suggestedSearches: getSuggestedSearches(),
            shouldResetSearchQuery: false,
        },
        results: {
            currentSearchResults: undefined,
            currentSearchTransactionsByReportID: EMPTY_TRANSACTIONS_BY_REPORT_ID,
            currentSearchViolations: {},
            shouldUseLiveData: false,
            sortedReportIDs: CONST.EMPTY_ARRAY,
            shouldShowFiltersBarLoading: false,
            lastSearchType: `${hash}`,
        },
    };
}

// Records what the Spend page below the hold reads on each render.
const probeRenders: Array<{queryHash: number; resultsType: string | undefined}> = [];
function SearchContextProbe() {
    const {currentSearchHash} = useSearchQueryContext();
    const {lastSearchType} = useSearchResultsContext();
    probeRenders.push({queryHash: currentSearchHash, resultsType: lastSearchType});
    return null;
}

const probe = <SearchContextProbe />;

type HoldProps = {
    hash: number;
    isInPreloadedTab: boolean;
    isPreloadedContentReady: boolean;
};

function HoldWithContexts({hash, isInPreloadedTab, isPreloadedContentReady}: HoldProps) {
    const {query, results} = buildContexts(hash);
    return (
        <SearchQueryContext value={query}>
            <SearchResultsContext value={results}>
                <SearchTabContextHold
                    isInPreloadedTab={isInPreloadedTab}
                    isPreloadedContentReady={isPreloadedContentReady}
                >
                    {probe}
                </SearchTabContextHold>
            </SearchResultsContext>
        </SearchQueryContext>
    );
}

describe('SearchTabContextHold on native', () => {
    beforeEach(() => {
        probeRenders.length = 0;
        jest.mocked(useHasTabBeenShown).mockReturnValue(false);
    });

    it.each([
        ['keeps a hidden tab that was never shown on the contexts it went hidden with', false, false, false, 1],
        ['gives a hidden tab the idle preload is still building the live contexts', false, true, false, 2],
        ['keeps a preloaded tab on the contexts it was built with once its first content is on screen', false, true, true, 1],
        ['gives a tab that was already shown the live contexts', true, false, false, 2],
    ])('%s', (_description, hasBeenShown, isInPreloadedTab, isPreloadedContentReady, expectedHash) => {
        // Given the Spend tab mounted below the hold, hidden or shown, preloaded or not
        jest.mocked(useHasTabBeenShown).mockReturnValue(hasBeenShown);
        const {rerender} = render(
            <HoldWithContexts
                hash={1}
                isInPreloadedTab={isInPreloadedTab}
                isPreloadedContentReady={isPreloadedContentReady}
            />,
        );

        // When an expense update gives the search contexts new values
        rerender(
            <HoldWithContexts
                hash={2}
                isInPreloadedTab={isInPreloadedTab}
                isPreloadedContentReady={isPreloadedContentReady}
            />,
        );

        // Then only a tab that is not held reads the new values, so a held tab has nothing new to render
        expect(probeRenders.at(-1)).toEqual({queryHash: expectedHash, resultsType: `${expectedHash}`});
    });

    it('catches a held tab up to the latest contexts when it is first shown', () => {
        // Given a hidden Spend tab held on its first contexts while two expense updates arrive
        const {rerender} = render(
            <HoldWithContexts
                hash={1}
                isInPreloadedTab={false}
                isPreloadedContentReady={false}
            />,
        );
        rerender(
            <HoldWithContexts
                hash={2}
                isInPreloadedTab={false}
                isPreloadedContentReady={false}
            />,
        );
        rerender(
            <HoldWithContexts
                hash={3}
                isInPreloadedTab={false}
                isPreloadedContentReady={false}
            />,
        );
        expect(probeRenders.at(-1)?.queryHash).toBe(1);

        // When the user opens the tab
        jest.mocked(useHasTabBeenShown).mockReturnValue(true);
        rerender(
            <HoldWithContexts
                hash={3}
                isInPreloadedTab={false}
                isPreloadedContentReady={false}
            />,
        );

        // Then the page renders once with the latest contexts, so the user sees current data
        expect(probeRenders.at(-1)).toEqual({queryHash: 3, resultsType: '3'});
    });
});
