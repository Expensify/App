import type {SearchQueryJSON} from '@components/Search/types';

import type {SearchKey} from './SearchUIUtils';

import {search} from './actions/Search';

type RefreshSearchParams = {
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined;
    currentSearchKey: SearchKey | undefined;
    shouldCalculateTotals: boolean;
    isOffline: boolean;
    isLoading: boolean;
};

function refreshSearchAfterReportAction({currentSearchQueryJSON, currentSearchKey, shouldCalculateTotals, isOffline, isLoading}: RefreshSearchParams) {
    if (!currentSearchQueryJSON || isOffline) {
        return;
    }
    search({
        queryJSON: currentSearchKey ? {...currentSearchQueryJSON, searchKey: currentSearchKey} : currentSearchQueryJSON,
        shouldCalculateTotals,
        offset: 0,
        isOffline,
        isLoading,
    });
}

export default refreshSearchAfterReportAction;
