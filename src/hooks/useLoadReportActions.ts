import {useIsFocused} from '@react-navigation/native';
import {useCallback, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getNewerActions, getOlderActions} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useNetwork from './useNetwork';

type UseLoadReportActionsArguments = {
    /** The id of the current report */
    reportID: string;

    /** The id of the reportAction (if specific action was linked to */
    reportActionID?: string;

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
function useLoadReportActions({reportID, reportActionID, reportActions, allReportActionIDs, transactionThreadReport, hasOlderActions, hasNewerActions}: UseLoadReportActionsArguments) {
    const didLoadOlderChats = useRef(false);
    const didLoadNewerChats = useRef(false);

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const newestReportAction = useMemo(() => reportActions?.at(0), [reportActions]);
    const oldestReportAction = useMemo(() => reportActions?.at(-1), [reportActions]);

    const reportActionIDMap = useMemo(() => {
        return reportActions.map((action) => ({
            reportActionID: action.reportActionID,
            reportID: allReportActionIDs?.includes(action.reportActionID) ? reportID : transactionThreadReport?.reportID,
        }));
    }, [reportActions, allReportActionIDs, reportID, transactionThreadReport?.reportID]);

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

            didLoadOlderChats.current = true;

            if (!isEmptyObject(transactionThreadReport)) {
                // Get older actions based on the oldest reportAction for the current report
                const oldestActionCurrentReport = reportActionIDMap.findLast((item) => item.reportID === reportID);
                getOlderActions(oldestActionCurrentReport?.reportID, oldestActionCurrentReport?.reportActionID);

                // Get older actions based on the oldest reportAction for the transaction thread report
                const oldestActionTransactionThreadReport = reportActionIDMap.findLast((item) => item.reportID === transactionThreadReport.reportID);
                getOlderActions(oldestActionTransactionThreadReport?.reportID, oldestActionTransactionThreadReport?.reportActionID);
            } else {
                // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
                getOlderActions(reportID, oldestReportAction.reportActionID);
            }
        },
        [isOffline, oldestReportAction, reportID, reportActionIDMap, transactionThreadReport, hasOlderActions],
    );

    const loadNewerChats = useCallback(
        (force = false) => {
            if (
                !force &&
                (!reportActionID ||
                    !isFocused ||
                    !newestReportAction ||
                    !hasNewerActions ||
                    isOffline ||
                    // If there was an error only try again once on initial mount. We should also still load
                    // more in case we have cached messages.
                    didLoadNewerChats.current ||
                    newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ) {
                return;
            }

            didLoadNewerChats.current = true;

            // If this is a one transaction report, ensure we load newer actions for both this report and the report associated with the transaction
            if (!isEmptyObject(transactionThreadReport)) {
                // Get newer actions based on the newest reportAction for the current report
                const newestActionCurrentReport = reportActionIDMap.find((item) => item.reportID === reportID);
                getNewerActions(newestActionCurrentReport?.reportID, newestActionCurrentReport?.reportActionID);

                // Get newer actions based on the newest reportAction for the transaction thread report
                const newestActionTransactionThreadReport = reportActionIDMap.find((item) => item.reportID === transactionThreadReport.reportID);
                getNewerActions(newestActionTransactionThreadReport?.reportID, newestActionTransactionThreadReport?.reportActionID);
            } else if (newestReportAction) {
                getNewerActions(reportID, newestReportAction.reportActionID);
            }
        },
        [reportActionID, isFocused, newestReportAction, hasNewerActions, isOffline, transactionThreadReport, reportActionIDMap, reportID],
    );

    return {
        loadOlderChats,
        loadNewerChats,
    };
}

export default useLoadReportActions;
