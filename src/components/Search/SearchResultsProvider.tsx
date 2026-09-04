import {getTransactionsByReportID, getViolationsFromSearchData} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

function SearchResultsProvider({children}: SearchResultsProviderProps) {
    const {currentSearchHash} = useSearchQueryContext();

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`);
    const currentSearchResults = snapshotSearchResults ?? undefined;

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

    // Computed here, not per row: it scans every snapshot key.
    const searchData = currentSearchResults?.data;
    const currentSearchTransactionsByReportID = searchData ? getTransactionsByReportID(searchData) : EMPTY_TRANSACTIONS_BY_REPORT_ID;
    const currentSearchViolations = searchData ? getViolationsFromSearchData(searchData) : CONST.EMPTY_OBJECT;

    const resultsValue: SearchResultsContextValue = {
        currentSearchResults,
        currentSearchTransactionsByReportID,
        currentSearchViolations,
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
