import {render} from '@testing-library/react-native';

import {SearchQueryContext, SearchResultsContext, SearchShouldUseLiveDataContext, useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import {EMPTY_TRANSACTIONS_BY_REPORT_ID} from '@components/Search/SearchContextDefinitions';
import type {SearchQueryContextValue, SearchResultsContextValue} from '@components/Search/types';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';

import SearchTabContextHold from '@libs/Navigation/AppNavigator/SearchTabContextHold/index.native';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {use} from 'react';

jest.mock('@hooks/useHasTabBeenShown', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

let mockShouldUseNarrowLayout = true;
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

// The query hash changes when the user picks another search, the results version on every expense update.
function buildContexts(hash: number, resultsVersion: number, shouldUseLiveData: boolean): {query: SearchQueryContextValue; results: SearchResultsContextValue} {
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
            shouldUseLiveData,
            sortedReportIDs: CONST.EMPTY_ARRAY,
            shouldShowFiltersBarLoading: false,
            lastSearchType: `${resultsVersion}`,
            approvalWorkflowRules: undefined,
        },
    };
}

// Records the contexts and live data flag that each render of the page below the hold reads.
const probeRenders: Array<{queryHash: number; resultsType: string | undefined}> = [];
const probeLiveDataFlags: boolean[] = [];
function SearchContextProbe() {
    const {currentSearchHash} = useSearchQueryContext();
    const {lastSearchType} = useSearchResultsContext();
    probeRenders.push({queryHash: currentSearchHash, resultsType: lastSearchType});
    probeLiveDataFlags.push(use(SearchShouldUseLiveDataContext));
    return null;
}

const probe = <SearchContextProbe />;

type HoldProps = {
    hash?: number;
    resultsVersion: number;
    shouldUseLiveData?: boolean;
    shouldHoldWhenHidden?: boolean;
};

function HoldWithContexts({hash = 1, resultsVersion, shouldUseLiveData = false, shouldHoldWhenHidden = true}: HoldProps) {
    const {query, results} = buildContexts(hash, resultsVersion, shouldUseLiveData);
    return (
        <SearchQueryContext value={query}>
            <SearchShouldUseLiveDataContext value={shouldUseLiveData}>
                <SearchResultsContext value={results}>
                    <SearchTabContextHold shouldHoldWhenHidden={shouldHoldWhenHidden}>{probe}</SearchTabContextHold>
                </SearchResultsContext>
            </SearchShouldUseLiveDataContext>
        </SearchQueryContext>
    );
}

describe('SearchTabContextHold on native', () => {
    beforeEach(() => {
        probeRenders.length = 0;
        probeLiveDataFlags.length = 0;
        mockShouldUseNarrowLayout = true;
        jest.mocked(useHasTabBeenShown).mockReturnValue(false);
    });

    it.each([
        ['keeps a hidden tab that was never shown on the results it went hidden with', true, false, true, 1],
        ['gives a hidden tab the idle preload is still building the live results', true, false, false, 2],
        ['gives a tab that was already shown the live results', true, true, true, 2],
        ['gives a hidden tab on a wide layout the live results', false, false, true, 2],
    ])('%s', (_description, shouldUseNarrowLayout, hasBeenShown, shouldHoldWhenHidden, expectedResultsVersion) => {
        // Given the Spend tab mounted below the hold in the state this case describes
        mockShouldUseNarrowLayout = shouldUseNarrowLayout;
        jest.mocked(useHasTabBeenShown).mockReturnValue(hasBeenShown);
        const {rerender} = render(
            <HoldWithContexts
                resultsVersion={1}
                shouldHoldWhenHidden={shouldHoldWhenHidden}
            />,
        );

        // When an expense update gives the search results a new value
        rerender(
            <HoldWithContexts
                resultsVersion={2}
                shouldHoldWhenHidden={shouldHoldWhenHidden}
            />,
        );

        // Then only a tab that is not held reads the new results, so a held tab has nothing new to render
        expect(probeRenders.at(-1)).toEqual({queryHash: 1, resultsType: `${expectedResultsVersion}`});
    });

    it('holds a hidden tab on the new query when the query changes while it is held', () => {
        // Given a hidden Spend tab held since startup on the default query
        const {rerender} = render(<HoldWithContexts resultsVersion={1} />);

        // When the saved Spend query is applied after startup
        rerender(
            <HoldWithContexts
                hash={2}
                resultsVersion={2}
            />,
        );
        rerender(
            <HoldWithContexts
                hash={2}
                resultsVersion={3}
            />,
        );

        // Then the hidden tab shows the query it will open with, and later expense updates are still held
        expect(probeRenders.at(-1)).toEqual({queryHash: 2, resultsType: '2'});
    });

    it('keeps a held tab on the live data flag of the results it holds', () => {
        // Given a hidden Spend tab held on snapshot results
        const {rerender} = render(<HoldWithContexts resultsVersion={1} />);

        // When an update switches the search to live data while the tab is held
        rerender(
            <HoldWithContexts
                resultsVersion={2}
                shouldUseLiveData
            />,
        );

        // Then the snapshot reads below keep reading the snapshot the held results came from
        expect(probeLiveDataFlags.at(-1)).toBe(false);
    });

    it('catches a held tab up to the latest contexts when it is first shown', () => {
        // Given a hidden Spend tab held on its first results while two expense updates arrive
        const {rerender} = render(<HoldWithContexts resultsVersion={1} />);
        rerender(<HoldWithContexts resultsVersion={2} />);
        rerender(<HoldWithContexts resultsVersion={3} />);
        expect(probeRenders.at(-1)?.resultsType).toBe('1');

        // When the user opens the tab
        jest.mocked(useHasTabBeenShown).mockReturnValue(true);
        rerender(<HoldWithContexts resultsVersion={3} />);

        // Then the page renders once with the latest results, so the user sees current data
        expect(probeRenders.at(-1)).toEqual({queryHash: 1, resultsType: '3'});
    });
});
