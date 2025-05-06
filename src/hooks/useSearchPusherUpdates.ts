import {useEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {search} from '@libs/actions/Search';
import CONST from '@src/CONST';
import type {ReportActions, Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import usePrevious from './usePrevious';

/**
 * Hook to detect new transactions or report actions from Pusher and trigger a search refresh
 */
function useSearchPusherUpdates({
    isOffline,
    queryJSON,
    transactions,
    previousTransactions,
    reportActions,
    searchResults,
}: {
    isOffline: boolean;
    queryJSON: SearchQueryJSON;
    transactions?: OnyxCollection<Transaction>;
    previousTransactions?: OnyxCollection<Transaction>;
    reportActions?: OnyxCollection<ReportActions>;
    searchResults?: SearchResults;
}) {
    const previousSearchResults = usePrevious(searchResults?.data);
    const previousReportActions = usePrevious(reportActions);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    // Detect Pusher updates and trigger search
    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (!isChat && (!transactions || !previousTransactions)) {
            return;
        }

        const currentTransactionIDs = Object.keys(transactions ?? {});
        const previousTransactionIDs = Object.keys(previousTransactions ?? {});

        const hasNewTransactions = currentTransactionIDs.length !== previousTransactionIDs.length;

        const currentSearchResultIDs = Object.keys(searchResults?.data ?? {});
        const previousSearchResultIDs = Object.keys(previousSearchResults ?? {});

        const hasSearchResultsChanged = currentSearchResultIDs.length !== previousSearchResultIDs.length;

        if (hasNewTransactions || hasSearchResultsChanged) {
            search({queryJSON, offset: 0});
        }
    }, [isOffline, queryJSON, transactions, previousTransactions, reportActions, previousReportActions, isChat, searchResults?.data, previousSearchResults]);
}

export default useSearchPusherUpdates;
