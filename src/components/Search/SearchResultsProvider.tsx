import usePrevious from '@hooks/usePrevious';
import useTodoSearchResults from '@hooks/useTodoSearchResults';

import {getTransactionsByReportID, getViolationsFromSearchData, isSearchDataLoaded, isTodoSearch} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

import React, {useState} from 'react';
// This provider is the source of the snapshot data that `@hooks/useOnyx` later routes consumers onto,
// so going through that wrapper here would be self-referential. The wrapper also short-circuits its own
// logic for snapshot keys (see the `!key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)` guard in useOnyx.ts),
// so it would add nothing for this read. Use the raw react-native-onyx hook directly.
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

import type {SearchResultsActionsValue, SearchResultsContextValue} from './types';

import {useSearchQueryContext} from './SearchContext';
import {EMPTY_TRANSACTIONS_BY_REPORT_ID, SearchResultsActionsContext, SearchResultsContext} from './SearchContextDefinitions';

type SearchResultsProviderProps = {
    children: React.ReactNode;
};

// Default search info when building from live data
// Used for to-do searches where we build SearchResults from live Onyx data instead of API snapshots
const defaultSearchInfo: SearchResultsInfo = {
    offset: 0,
    hash: 0,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    hasMoreResults: false,
    hasResults: true,
    isLoading: false,
    count: 0,
    total: 0,
    currency: undefined,
};

function SearchResultsProvider({children}: SearchResultsProviderProps) {
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON, suggestedSearches} = useSearchQueryContext();
    const currentRecentSearchHash = currentSearchQueryJSON?.recentSearchHash ?? -1;

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`);

    const shouldUseLiveData = !!currentSearchKey && isTodoSearch(currentRecentSearchHash, suggestedSearches);
    const liveTodoData = useTodoSearchResults(shouldUseLiveData ? currentSearchKey : undefined);

    // If viewing a to-do search, use live Onyx data for the active category, otherwise return the snapshot data.
    // We do this so the results stay fresh as the user acts on reports, instead of showing a stale server snapshot.
    let currentSearchResults;
    if (shouldUseLiveData) {
        const liveData = liveTodoData ?? {data: {}, metadata: {count: 0, total: 0, currency: undefined}};
        const searchInfo: SearchResultsInfo = {
            ...(snapshotSearchResults?.search ?? defaultSearchInfo),
            count: liveData.metadata.count,
            total: liveData.metadata.total,
            currency: liveData.metadata.currency,
        };
        const hasResults = Object.keys(liveData.data).length > 0;
        // For to-do searches, always return a valid SearchResults object (even with empty data)
        // This ensures we show the empty state instead of loading/blocking views
        currentSearchResults = {
            search: {...searchInfo, isLoading: false, hasResults},
            data: liveData.data,
        };
    } else {
        currentSearchResults = snapshotSearchResults ?? undefined;
    }

    const [sortedReportIDs, setSortedReportIDsState] = useState<ReadonlyArray<string | undefined>>(CONST.EMPTY_ARRAY);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string>();

    // `displayedSearchResults` lives here rather than on the Search screen because it describes what the table
    // is rendering, and consumers outside that screen need to agree with it. The Edit columns picker is a
    // separate RHP route: seeding it from the raw `currentSearchResults` made it read no data across the two
    // gaps below and silently fall back to the static default columns while the table still showed the old set.
    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);
    const [isSorting, setIsSorting] = useState(false);

    // Adjust state during rendering rather than in a useEffect: the value is consumed in the same
    // render below (`displayedSearchResults = lastNonEmptySearchResults` when sorting), so a useEffect would
    // commit one stale render before catching up. The reference equality check
    // (`currentSearchResults !== lastNonEmptySearchResults`) bounds the re-render loop to a single
    // extra pass — see https://react.dev/reference/react/useState#storing-information-from-previous-renders.
    if (currentSearchResults?.data && !shouldUseLiveData && currentSearchResults !== lastNonEmptySearchResults) {
        setLastNonEmptySearchResults(currentSearchResults);
    }

    const prevIsLoading = usePrevious(currentSearchResults?.isLoading);

    // Clear the sorting flag during render too, for the same reason: an effect would commit one render with
    // the flag still set, and calling setState from an effect body cascades an extra render pass. The
    // loading true -> false transition guard means this fires once, on the render the new snapshot lands.
    if (isSorting && prevIsLoading && !currentSearchResults?.isLoading) {
        setIsSorting(false);
    }

    const isCurrentSearchResolved = isSearchDataLoaded(currentSearchResults, currentSearchQueryJSON);
    let displayedSearchResults: SearchResults | undefined;
    if (isCurrentSearchResolved && currentSearchResults?.search && currentSearchResults.data === undefined) {
        displayedSearchResults = {...currentSearchResults, data: {}};
    } else if (currentSearchResults?.data != null || currentSearchResults?.errors) {
        displayedSearchResults = currentSearchResults;
    } else if (isSorting) {
        displayedSearchResults = lastNonEmptySearchResults;
    }

    const setSortedReportIDs: SearchResultsActionsValue['setSortedReportIDs'] = (newIDs) => {
        setSortedReportIDsState((prev) => {
            // ensure that we don't save the same report IDs unless they are really different
            const hasChanged = prev.length !== newIDs.length || prev.some((id, i) => id !== newIDs.at(i));
            return hasChanged ? newIDs : prev;
        });
    };

    // Computed here, not per row: it scans every snapshot key.
    const searchData = currentSearchResults?.data;
    const currentSearchTransactionsByReportID = searchData ? getTransactionsByReportID(searchData) : EMPTY_TRANSACTIONS_BY_REPORT_ID;
    const currentSearchViolations = searchData ? getViolationsFromSearchData(searchData) : CONST.EMPTY_OBJECT;

    const resultsValue: SearchResultsContextValue = {
        currentSearchResults,
        displayedSearchResults,
        currentSearchTransactionsByReportID,
        currentSearchViolations,
        shouldUseLiveData,
        sortedReportIDs,
        shouldShowFiltersBarLoading,
        lastSearchType,
    };

    const resultsActionsValue: SearchResultsActionsValue = {
        setSortedReportIDs,
        setShouldShowFiltersBarLoading,
        setLastSearchType,
        setIsSorting,
    };

    return (
        <SearchResultsContext value={resultsValue}>
            <SearchResultsActionsContext value={resultsActionsValue}>{children}</SearchResultsActionsContext>
        </SearchResultsContext>
    );
}

export default SearchResultsProvider;
