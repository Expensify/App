import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef} from 'react';
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
    const isLoadingNewerChats = useRef(false);
    const isLoadingOlderChats = useRef(false);

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
    }, [allReportActionIDs, reportActions, reportID, transactionThreadReport?.reportID, isTransactionThreadReport]);

    const isReportActionLoaded = useCallback(
        (actionID: string | undefined) => {
            if (!actionID) {
                return false;
            }

            return reportActions.some((action) => action.reportActionID === actionID);
        },
        [reportActions],
    );

    /**
     * Retrieves the next set of reportActions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(
        (force = false) => {
            // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
            if (!force && (isOffline || isLoadingOlderChats.current)) {
                return;
            }

            // Don't load more reportActions if we're already at the beginning of the chat history
            if (!oldestReportAction || !hasOlderActions) {
                return;
            }

            isLoadingOlderChats.current = true;

            getOlderActions(reportID, currentReportOldest?.reportActionID);
            if (isTransactionThreadReport) {
                getOlderActions(transactionThreadReport.reportID, transactionThreadOldest?.reportActionID);
            }
        },
        [
            isOffline,
            oldestReportAction,
            hasOlderActions,
            reportID,
            currentReportOldest?.reportActionID,
            isTransactionThreadReport,
            transactionThreadReport?.reportID,
            transactionThreadOldest?.reportActionID,
        ],
    );

    useEffect(() => {
        if (!isLoadingOlderChats.current) {
            return;
        }

        const isOldestReportActionLoaded = isReportActionLoaded(currentReportOldest?.reportActionID);

        if (!isTransactionThreadReport && isOldestReportActionLoaded) {
            isLoadingOlderChats.current = false;
            return;
        }

        const isOldestTransactionThreadReportActionLoaded = isReportActionLoaded(transactionThreadOldest?.reportActionID);
        if (isOldestReportActionLoaded && isOldestTransactionThreadReportActionLoaded) {
            isLoadingOlderChats.current = false;
        }
    }, [currentReportOldest?.reportActionID, isReportActionLoaded, isTransactionThreadReport, reportActions, transactionThreadOldest?.reportActionID, transactionThreadReport]);

    const loadNewerChats = useCallback(
        (force = false) => {
            if (
                !force &&
                (!isFocused ||
                    !newestReportAction ||
                    !hasNewerActions ||
                    isOffline ||
                    isLoadingNewerChats.current ||
                    // If there was an error only try again once on initial mount. We should also still load
                    // more in case we have cached messages.
                    newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ) {
                return;
            }

            isLoadingNewerChats.current = true;

            if (isTransactionThreadReport) {
                getNewerActions(reportID, currentReportNewest?.reportActionID);
                getNewerActions(transactionThreadReport.reportID, transactionThreadNewest?.reportActionID);
            } else if (newestReportAction) {
                getNewerActions(reportID, newestReportAction.reportActionID);
            }
        },
        [
            isFocused,
            newestReportAction,
            hasNewerActions,
            isOffline,
            isTransactionThreadReport,
            reportID,
            currentReportNewest?.reportActionID,
            transactionThreadReport?.reportID,
            transactionThreadNewest?.reportActionID,
        ],
    );

    useEffect(() => {
        if (!isLoadingNewerChats.current) {
            return;
        }

        if (!isTransactionThreadReport) {
            const isNewestReportActionLoaded = isReportActionLoaded(currentReportNewest?.reportActionID);
            isLoadingNewerChats.current = false;
            const isNewestTransactionThreadReportActionLoaded = isReportActionLoaded(transactionThreadNewest?.reportActionID);

            if (isNewestReportActionLoaded && isNewestTransactionThreadReportActionLoaded) {
                isLoadingNewerChats.current = false;
            }

            return;
        }

        const isNewestReportActionLoaded = isReportActionLoaded(newestReportAction?.reportActionID);

        if (isNewestReportActionLoaded) {
            isLoadingNewerChats.current = false;
        }
    }, [
        currentReportNewest?.reportActionID,
        isReportActionLoaded,
        isTransactionThreadReport,
        newestReportAction?.reportActionID,
        reportActions,
        transactionThreadNewest?.reportActionID,
        transactionThreadReport,
    ]);

    return {
        loadOlderChats,
        loadNewerChats,
    };
}

export default useLoadReportActions;
