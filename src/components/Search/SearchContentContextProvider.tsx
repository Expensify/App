import {getTransactionsByReportID, getViolationsFromSearchData, isTodoSearch} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import React from 'react';

import type {SearchQueryContextValue, SearchQueryJSON, SearchResultsContextValue} from './types';

import {useSearchQueryContext, useSearchResultsContext} from './SearchContext';
import {EMPTY_TRANSACTIONS_BY_REPORT_ID, SearchQueryContext, SearchResultsContext} from './SearchContextDefinitions';

type SearchContentContextProviderProps = {
    /** The query whose results the subtree renders. Differs from the live route query while the page holds the previous results. */
    queryJSON: SearchQueryJSON;

    /** The results the subtree renders, paired with `queryJSON`. */
    searchResults: SearchResults | undefined;

    children: React.ReactNode;
};

/**
 * Re-provides the query and results contexts for the pair a subtree actually renders.
 *
 * The providers above derive from the live route params, so they advance to the requested query as soon as it is
 * requested — and its snapshot is empty until the response lands. Rows read those contexts directly for their
 * snapshot report, policy and actions, and pass the hash into their action handlers. Held rows would therefore be
 * paired with a hash whose snapshot has no data, and pressing Submit/Approve/Pay would act on empty inputs.
 */
function SearchContentContextProvider({queryJSON, searchResults, children}: SearchContentContextProviderProps) {
    const liveQueryValue = useSearchQueryContext();
    const liveResultsValue = useSearchResultsContext();

    const isRenderingHeldSearch = queryJSON.hash !== liveQueryValue.currentSearchHash;
    const heldSearchKey = Object.values(liveQueryValue.suggestedSearches).find((search) => search.similarSearchHash === queryJSON.similarSearchHash)?.key;
    const heldData = searchResults?.data;

    const queryValue: SearchQueryContextValue = isRenderingHeldSearch
        ? {
              ...liveQueryValue,
              currentSearchHash: queryJSON.hash,
              currentSimilarSearchHash: queryJSON.similarSearchHash,
              currentSearchKey: heldSearchKey,
              currentSearchQueryJSON: queryJSON,
          }
        : liveQueryValue;

    const resultsValue: SearchResultsContextValue = isRenderingHeldSearch
        ? {
              ...liveResultsValue,
              currentSearchResults: searchResults,
              currentSearchTransactionsByReportID: heldData ? getTransactionsByReportID(heldData) : EMPTY_TRANSACTIONS_BY_REPORT_ID,
              currentSearchViolations: heldData ? getViolationsFromSearchData(heldData) : CONST.EMPTY_OBJECT,
              shouldUseLiveData: !!heldSearchKey && isTodoSearch(queryJSON.recentSearchHash, liveQueryValue.suggestedSearches),
          }
        : liveResultsValue;

    return (
        <SearchQueryContext value={queryValue}>
            <SearchResultsContext value={resultsValue}>{children}</SearchResultsContext>
        </SearchQueryContext>
    );
}

export default SearchContentContextProvider;
