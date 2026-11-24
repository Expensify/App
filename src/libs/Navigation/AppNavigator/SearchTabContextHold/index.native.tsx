import {SearchQueryContext, SearchResultsContext, SearchShouldUseLiveDataContext, useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {SearchTabHoldContext} from '@hooks/useSearchTabHold';
import type {SearchTabHold} from '@hooks/useSearchTabHold';

import NAVIGATORS from '@src/NAVIGATORS';

import React, {useState} from 'react';

import type SearchTabContextHoldProps from './types';

/**
 * The native tab bar mounts the Spend tab at startup and never freezes it, because it shows a tab before JS could
 * unfreeze it. The search contexts get a new value on every snapshot change, so a hidden Spend tab would re-render on
 * every expense update. On a narrow layout, until the tab is first shown, this gives it the search contexts as they were
 * when it went hidden, and the tab catches up once when it is shown. A tab that the idle preload is building keeps the
 * live contexts until its first content is on screen.
 *
 * A wide layout is not held: its hidden Spend page builds the full list at startup without the idle preload, and that
 * list relies on seeing expense updates to refresh its results when it is first shown.
 */
function SearchTabContextHold({isInPreloadedTab, isPreloadedContentReady, children}: SearchTabContextHoldProps) {
    const query = useSearchQueryContext();
    const results = useSearchResultsContext();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const hasSpendBeenShown = useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const shouldHold = shouldUseNarrowLayout && !hasSpendBeenShown && (!isInPreloadedTab || isPreloadedContentReady);

    // Captured on the first render that holds and dropped when the hold ends. A tab held since startup and then built by the
    // idle preload therefore holds the contexts it was built with, not the ones from startup. A new query while held, like
    // the saved Spend query applied after startup, is captured again, so the hidden tab shows the query it will open with.
    const [heldContexts, setHeldContexts] = useState<SearchTabHold>();
    const isHeldQueryCurrent = heldContexts?.query.currentSearchHash === query.currentSearchHash;
    if (shouldHold && (!heldContexts || !isHeldQueryCurrent)) {
        setHeldContexts({query, results});
    } else if (!shouldHold && heldContexts) {
        setHeldContexts(undefined);
    }

    const providedContexts = shouldHold && heldContexts ? heldContexts : {query, results};

    // The live data flag is also read on its own, by every snapshot read, so it is held with the results it belongs to.
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
