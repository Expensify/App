import {SearchQueryContext, SearchResultsContext, SearchShouldUseLiveDataContext, useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {SearchTabHoldContext} from '@hooks/useSearchTabHold';
import type {SearchTabHold} from '@hooks/useSearchTabHold';

import NAVIGATORS from '@src/NAVIGATORS';

import React, {useState} from 'react';

import type SearchTabContextHoldProps from './types';

/**
 * The native tab bar never freezes the hidden Spend tab, so every snapshot change would re-render it. On a narrow layout,
 * until the tab is first shown, this provides the search contexts as they were when the hold started. Wide layouts are
 * not held: their hidden list needs expense updates to refresh its results when it is first shown.
 */
function SearchTabContextHold({shouldHoldWhenHidden, children}: SearchTabContextHoldProps) {
    const query = useSearchQueryContext();
    const results = useSearchResultsContext();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const hasSpendBeenShown = useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const shouldHold = shouldUseNarrowLayout && !hasSpendBeenShown && shouldHoldWhenHidden;

    // Captured when the hold starts and again on a new query, so the hidden tab shows the query it will open with.
    const [heldContexts, setHeldContexts] = useState<SearchTabHold>();
    const isHeldQueryCurrent = heldContexts?.query.currentSearchHash === query.currentSearchHash;
    if (shouldHold && (!heldContexts || !isHeldQueryCurrent)) {
        setHeldContexts({query, results});
    } else if (!shouldHold && heldContexts) {
        setHeldContexts(undefined);
    }

    const providedContexts = shouldHold && heldContexts ? heldContexts : {query, results};

    // Snapshot reads use the live data flag directly, so it is held with the results.
    return (
        <SearchQueryContext value={providedContexts.query}>
            <SearchShouldUseLiveDataContext value={providedContexts.results.shouldUseLiveData}>
                <SearchResultsContext value={providedContexts.results}>
                    <SearchTabHoldContext value={shouldHold ? heldContexts : undefined}>{children}</SearchTabHoldContext>
                </SearchResultsContext>
            </SearchShouldUseLiveDataContext>
        </SearchQueryContext>
    );
}

export default SearchTabContextHold;
