import {useIsFocused} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getNewerActions, getOlderActions} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useNetwork from './useNetwork';

type UseLoadReportActionsArguments = {
    /** The id of the current report */
    reportID: string;

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
};

/**
 * Provides reusable logic to get the functions for loading older/newer reportActions.
 * Used in the report displaying components
 */
function useLoadReportActions({reportID, reportActions, allReportActionIDs, transactionThreadReport, hasOlderActions, hasNewerActions}: UseLoadReportActionsArguments) {
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const newestReportAction = useMemo(() => reportActions?.at(0), [reportActions]);
    const oldestReportAction = useMemo(() => reportActions?.at(-1), [reportActions]);

    const isTransactionThreadReport = !isEmptyObject(transactionThreadReport);

    // Track oldest/newest actions per report in a single pass
    const {currentReportOldest, currentReportNewest, transactionThreadOldest, transactionThreadNewest} = useMemo(() => {
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

        return {
            currentReportOldest: currentReportOldestAction,
            currentReportNewest: currentReportNewestAction,
            transactionThreadOldest: transactionThreadOldestAction,
            transactionThreadNewest: transactionThreadNewestAction,
        };
    }, [allReportActionIDs, isTransactionThreadReport, reportActions, reportID, transactionThreadReport?.reportID]);

    /**
     * Retrieves the next set of reportActions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(
        (force = false) => {
            // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
            if (!force && isOffline) {
                return;
            }

            // Don't load more reportActions if we're already at the beginning of the chat history
            if (!oldestReportAction || !hasOlderActions) {
                return;
            }

            if (isTransactionThreadReport) {
                getOlderActions(reportID, currentReportOldest?.reportActionID);
                getOlderActions(transactionThreadReport?.reportID, transactionThreadOldest?.reportActionID);
            } else {
                getOlderActions(reportID, currentReportOldest?.reportActionID);
            }
        },
        [
            currentReportOldest?.reportActionID,
            hasOlderActions,
            isOffline,
            isTransactionThreadReport,
            oldestReportAction,
            reportID,
            transactionThreadOldest?.reportActionID,
            transactionThreadReport?.reportID,
        ],
    );

    const loadNewerChats = useCallback(
        (force = false) => {
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

            if (!isEmptyObject(transactionThreadReport)) {
                getNewerActions(reportID, currentReportNewest?.reportActionID);
                getNewerActions(transactionThreadReport.reportID, transactionThreadNewest?.reportActionID);
            } else if (newestReportAction) {
                getNewerActions(reportID, newestReportAction.reportActionID);
            }
        },
        [currentReportNewest?.reportActionID, hasNewerActions, isFocused, isOffline, newestReportAction, reportID, transactionThreadNewest?.reportActionID, transactionThreadReport],
    );

    return {
        loadOlderChats,
        loadNewerChats,
    };
}

export default useLoadReportActions;
