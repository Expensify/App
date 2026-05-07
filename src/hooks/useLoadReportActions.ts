import {useIsFocused} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import {getNewerActions, getOlderActions} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useNetwork from './useNetwork';

type UseLoadReportActionsArguments = {
    /** The id of the current report */
    reportID: string | undefined;

    /** The list of reportActions linked to the current report  */
    reportActions: ReportAction[];

    /** The IDs of all reportActions linked to the current report (may contain some extra actions) */
    allReportActionIDs: string[];

    /** The transaction thread report associated with the current transaction, if any */
    transactionThreadReport: OnyxEntry<Report>;

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;

    /** Newest action ID from the last pagination response, used as cursor to avoid Pusher-delivered actions skipping gaps */
    newestFetchedReportActionID?: string;
};

/**
 * Provides reusable logic to get the functions for loading older/newer reportActions.
 * Used in the report displaying components
 */
function useLoadReportActions({
    reportID,
    reportActions,
    allReportActionIDs,
    transactionThreadReport,
    hasOlderActions,
    hasNewerActions,
    newestFetchedReportActionID,
}: UseLoadReportActionsArguments) {
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const newestReportAction = reportActions?.at(0);
    const oldestReportAction = reportActions?.at(-1);

    const isTransactionThreadReport = !isEmptyObject(transactionThreadReport);

    let currentReportNewestAction = null;
    let currentReportOldestAction = null;
    let transactionThreadNewestAction = null;
    let transactionThreadOldestAction = null;

    const allReportActionIDsSet = new Set(allReportActionIDs);

    for (const action of reportActions) {
        // Determine which report this action belongs to
        const isCurrentReport = allReportActionIDsSet.has(action.reportActionID);
        const targetReportID = isCurrentReport ? reportID : transactionThreadReport?.reportID;

        // Track newest/oldest per report
        if (targetReportID === reportID) {
            // Newest = first matching action we encounter
            if (!currentReportNewestAction) {
                currentReportNewestAction = action;
            }
            // Oldest = last matching action we encounter
            currentReportOldestAction = action;
        } else if (isTransactionThreadReport && transactionThreadReport?.reportID === targetReportID) {
            // Same logic for transaction thread
            if (!transactionThreadNewestAction) {
                transactionThreadNewestAction = action;
            }
            transactionThreadOldestAction = action;
        }
    }

    /**
     * Retrieves the next set of reportActions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = (force = false) => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (!force && isOffline) {
            return;
        }

        // Don't load more reportActions if we're already at the beginning of the chat history
        if (!oldestReportAction || !hasOlderActions) {
            return;
        }

        if (isTransactionThreadReport) {
            getOlderActions(reportID, currentReportOldestAction?.reportActionID);
            getOlderActions(transactionThreadReport?.reportID, transactionThreadOldestAction?.reportActionID);
        } else {
            getOlderActions(reportID, currentReportOldestAction?.reportActionID);
        }
    };

    const loadNewerChats = (force = false) => {
        if (
            !force &&
            (!isFocused ||
                !newestReportAction ||
                !hasNewerActions ||
                isOffline ||
                // If there was an error only try again once on initial mount. We should also still load
                // more in case we have cached messages.
                newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        ) {
            return;
        }

        // Use the Pusher-safe cursor when available instead of newestReportAction
        // (which may include Pusher-delivered actions like Concierge replies that skip gaps)
        if (newestFetchedReportActionID) {
            getNewerActions(reportID, newestFetchedReportActionID);
            return;
        }

        if (isTransactionThreadReport) {
            getNewerActions(reportID, currentReportNewestAction?.reportActionID);
            getNewerActions(transactionThreadReport.reportID, transactionThreadNewestAction?.reportActionID);
        } else if (newestReportAction) {
            getNewerActions(reportID, newestReportAction.reportActionID);
        }
    };

    return {
        loadOlderChats,
        loadNewerChats,
    };
}

export default useLoadReportActions;
