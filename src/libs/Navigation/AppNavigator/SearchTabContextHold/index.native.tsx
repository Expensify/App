import {SearchQueryContext, SearchResultsContext, useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryContextValue, SearchResultsContextValue} from '@components/Search/types';

import useHasTabBeenShown from '@hooks/useHasTabBeenShown';

import NAVIGATORS from '@src/NAVIGATORS';

import React, {useState} from 'react';

import type SearchTabContextHoldProps from './types';

type HeldSearchContexts = {
    query: SearchQueryContextValue;
    results: SearchResultsContextValue;
};

/**
 * The native tab bar mounts the Spend tab at startup and never freezes it, because it shows a tab before JS could
 * unfreeze it. The search contexts get a new value on every snapshot change, so a hidden Spend tab would re-render on
 * every expense update. Until the tab is first shown, this gives it the search contexts as they were when it went
 * hidden, and the tab catches up once when it is shown. A tab that the idle preload is building keeps the live
 * contexts until its first content is on screen.
 */
function SearchTabContextHold({isInPreloadedTab, isPreloadedContentReady, children}: SearchTabContextHoldProps) {
    const query = useSearchQueryContext();
    const results = useSearchResultsContext();
    const hasSpendBeenShown = useHasTabBeenShown(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const shouldHold = !hasSpendBeenShown && (!isInPreloadedTab || isPreloadedContentReady);

    // Captured on the first render that holds and dropped when the hold ends. A tab held since startup and then built by the
    // idle preload therefore holds the contexts it was built with, not the ones from startup.
    const [heldContexts, setHeldContexts] = useState<HeldSearchContexts>();
    if (shouldHold && !heldContexts) {
        setHeldContexts({query, results});
    } else if (!shouldHold && heldContexts) {
        setHeldContexts(undefined);
    }

    const providedContexts = shouldHold && heldContexts ? heldContexts : {query, results};

    return (
        <SearchQueryContext value={providedContexts.query}>
            <SearchResultsContext value={providedContexts.results}>{children}</SearchResultsContext>
        </SearchQueryContext>
    );
}

export default SearchTabContextHold;
