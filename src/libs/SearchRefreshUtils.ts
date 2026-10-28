import type {SearchQueryJSON} from '@components/Search/types';

import type {SearchKey} from './SearchKeyUtils';

import {search} from './actions/Search';

type RefreshSearchParams = {
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined;
    currentSearchKey: SearchKey | undefined;
    shouldCalculateTotals: boolean;
    isOffline: boolean;
    isLoading: boolean;
    /** Keeps a refresh of the Trips search asking for trip rooms, or it overwrites them with travel expenses */
    shouldReturnTripRooms: boolean;
};

function refreshSearchAfterReportAction({currentSearchQueryJSON, currentSearchKey, shouldCalculateTotals, isOffline, isLoading, shouldReturnTripRooms}: RefreshSearchParams) {
    if (!currentSearchQueryJSON || isOffline) {
        return;
    }
    search({
        searchKey: currentSearchKey,
        shouldCalculateTotals,
        offset: 0,
        queryJSON: currentSearchQueryJSON,
        isLoading,
        shouldReturnTripRooms,
    });
}

export default refreshSearchAfterReportAction;
