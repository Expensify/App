import useTodoSearchResults from '@hooks/useTodoSearchResults';

import {isTodoSearch} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
import {SearchResultsActionsContext, SearchResultsContext} from './SearchContextDefinitions';

type SearchResultsProviderProps = {
    children: React.ReactNode;
};

// Default search info when building from live data
// Used for to-do searches where we build SearchResults from live Onyx data instead of API snapshots
const defaultSearchInfo: SearchResultsInfo = {
    offset: 0,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    hasMoreResults: false,
    hasResults: true,
    isLoading: false,
    count: 0,
    total: 0,
    currency: '',
};

function SearchResultsProvider({children}: SearchResultsProviderProps) {
    const {currentSearchHash, currentSearchKey} = useSearchQueryContext();

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`);

    // JACK_TODO: we should not use live data when filters are applied
    const shouldUseLiveData = isTodoSearch(currentSearchKey);
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

    const setSortedReportIDs: SearchResultsActionsValue['setSortedReportIDs'] = (newIDs) => {
        setSortedReportIDsState((prev) => {
            // ensure that we don't save the same report IDs unless they are really different
            const hasChanged = prev.length !== newIDs.length || prev.some((id, i) => id !== newIDs.at(i));
            return hasChanged ? newIDs : prev;
        });
    };

    const resultsValue: SearchResultsContextValue = {
        currentSearchResults,
        shouldUseLiveData,
        sortedReportIDs,
        shouldShowFiltersBarLoading,
        lastSearchType,
    };

    const resultsActionsValue: SearchResultsActionsValue = {
        setSortedReportIDs,
        setShouldShowFiltersBarLoading,
        setLastSearchType,
    };

    return (
        <SearchResultsContext value={resultsValue}>
            <SearchResultsActionsContext value={resultsActionsValue}>{children}</SearchResultsActionsContext>
        </SearchResultsContext>
    );
}

export default SearchResultsProvider;
