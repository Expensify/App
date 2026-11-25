import type {SearchQueryContextValue, SearchResultsContextValue} from '@components/Search/types';

import {createContext, useContext} from 'react';

/** The search contexts a hidden Spend tab is held on. */
type SearchTabHold = {
    query: SearchQueryContextValue;
    results: SearchResultsContextValue;
};

// Undefined while not held. Each hold is a new object, so readers tell a new hold by its identity.
const SearchTabHoldContext = createContext<SearchTabHold | undefined>(undefined);

function useSearchTabHold(): SearchTabHold | undefined {
    return useContext(SearchTabHoldContext);
}

export default useSearchTabHold;
export {SearchTabHoldContext};
export type {SearchTabHold};
