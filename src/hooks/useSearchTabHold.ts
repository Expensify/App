import type {SearchQueryContextValue, SearchResultsContextValue} from '@components/Search/types';

import {createContext, useContext} from 'react';

/** The search contexts a hidden Spend tab is held on. Each hold captures a new object. */
type SearchTabHold = {
    query: SearchQueryContextValue;
    results: SearchResultsContextValue;
};

// The current hold of a hidden Spend tab, or undefined while it is not held. Search tells a new hold from one it already
// captured its own reads for by its identity.
const SearchTabHoldContext = createContext<SearchTabHold | undefined>(undefined);

function useSearchTabHold(): SearchTabHold | undefined {
    return useContext(SearchTabHoldContext);
}

export default useSearchTabHold;
export {SearchTabHoldContext};
export type {SearchTabHold};
