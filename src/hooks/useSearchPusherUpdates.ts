import {useEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {search} from '@libs/actions/Search';
import CONST from '@src/CONST';
import type {ReportActions, Transaction} from '@src/types/onyx';
import usePrevious from './usePrevious';

/**
 * Hook to detect new transactions or report actions from Pusher and trigger a search refresh
 */
function useSearchPusherUpdates({
    isOffline,
    queryJSON,
    transactions,
    reportActions,
}: {
    isOffline: boolean;
    queryJSON: SearchQueryJSON;
    transactions?: OnyxCollection<Transaction>;
    reportActions?: OnyxCollection<ReportActions>;
}) {
    const previousTransactions = usePrevious(transactions);
    const previousReportActions = usePrevious(reportActions);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    // Detect Pusher updates and trigger search
    useEffect(() => {
        if (isOffline) {
            return;
        }

        // Only proceed if we have stable references to compare
        if (isChat && (!reportActions || !previousReportActions)) {
            return;
        }

        if (!isChat && (!transactions || !previousTransactions)) {
            return;
        }

        // For chat, check if there are new report actions
        if (isChat) {
            const currentReportActionsIDs = Object.values(reportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {}));

            const previousReportActionsIDs = new Set(Object.values(previousReportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {})));

            // Only trigger search if Pusher added new report actions
            const hasNewReportActions = currentReportActionsIDs.length > previousReportActionsIDs.size && currentReportActionsIDs.some((id) => !previousReportActionsIDs.has(id));

            if (hasNewReportActions) {
                search({queryJSON, offset: 0});
            }

            return;
        }

        // For expenses/transactions, check if there are new transactions
        const currentTransactionIDs = Object.keys(transactions ?? {});
        const previousTransactionIDs = Object.keys(previousTransactions ?? {});

        // Only trigger search if Pusher added new transactions
        const hasNewTransactions = currentTransactionIDs.length > previousTransactionIDs.length && currentTransactionIDs.some((id) => !previousTransactionIDs.includes(id));

        if (hasNewTransactions) {
            search({queryJSON, offset: 0});
        }
    }, [isOffline, queryJSON, transactions, previousTransactions, reportActions, previousReportActions, isChat]);
}

export default useSearchPusherUpdates;
