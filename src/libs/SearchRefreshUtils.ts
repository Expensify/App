import type {SearchQueryJSON} from '@components/Search/types';
import {search} from './actions/Search';
import type {SearchKey} from './SearchUIUtils';

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
        searchKey: currentSearchKey,
        shouldCalculateTotals,
        offset: 0,
        queryJSON: currentSearchQueryJSON,
        isOffline,
        isLoading,
    });
}

export default refreshSearchAfterReportAction;
