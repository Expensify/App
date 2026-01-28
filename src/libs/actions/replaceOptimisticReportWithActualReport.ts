import {DeviceEventEmitter, InteractionManager} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isMoneyRequestReport, isOneTransactionReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';
import {openReport, saveReportDraftComment} from './Report';

/**
 * replaceOptimisticReportWithActualReport
 *
 * This module handles a specific edge case in the Expensify app's offline-first architecture.
 *
 * THE PROBLEM:
 * When a user creates a new DM or group chat, we optimistically create a report with a temporary
 * reportID so they can start using it immediately (offline-first UX). However, when the API request
 * completes, the server might respond that a report already exists for that set of participants
 * (e.g., if the user previously had a DM with that person). In this case, the API returns a
 * `preexistingReportID` indicating which report should be used instead of the optimistic one.
 *
 * THE SOLUTION:
 * This module listens to the REPORT collection in Onyx. When a report comes in with a
 * `preexistingReportID` field set, it means we need to:
 * 1. Delete the optimistically created report (the one with the temporary ID)
 * 2. Redirect the user to the preexisting report (if they're currently viewing the optimistic one)
 * 3. Transfer any draft comment from the optimistic report to the preexisting report
 * 4. Clean up associated data like parent report actions for money request reports
 *
 */

let allReportDraftComments: Record<string, string | undefined> = {};
// Draft comments are cached only for transferring to the preexisting report; no UI subscribes, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDraftComments = value ?? {}),
});

let allReports: OnyxCollection<Report>;

const allReportActions: OnyxCollection<ReportActions> = {};
// Report actions are cached only to resolve parent actions for IOU cleanup; no UI subscribes, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        allReportActions[reportID] = actions;
    },
});

function replaceOptimisticReportWithActualReport(report: Report, draftReportComment: string | undefined) {
    const {reportID, preexistingReportID, parentReportID, parentReportActionID} = report;

    if (!reportID || !preexistingReportID) {
        return;
    }

    // Handle cleanup of stale optimistic IOU report and its report preview separately
    if (isMoneyRequestReport(report) && parentReportActionID) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
            [parentReportActionID]: null,
        });
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
        // Or we optimistically created a transaction thread chat report for an IOU report action that already has an associated child chat report.
        // Or we optimistically created a thread report under a comment that already has an associated child chat report.
        // In this case, the API will let us know by returning a preexistingReportID.
        // We should clear out the optimistically created report and re-route the user to the preexisting report.
        const existingReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`];
        const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
        let callback = () => {
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, null);

            if (!parentReportActionID) {
                // Clear the optimistic DM/group-DM
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, {
                    ...report,
                    reportID: preexistingReportID,
                    preexistingReportID: null,
                    // Replacing the existing report's participants to avoid duplicates
                    participants: existingReport?.participants ?? report.participants,
                });
            } else {
                // Clear the optimistic thread report
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, {
                    ...report,
                    reportID: preexistingReportID,
                    preexistingReportID: null,
                });
                // Update the parent report action to point to the preexisting thread report
                const parentReportAction = parentReportID ? allReportActions?.[parentReportID]?.[parentReportActionID] : null;
                if (parentReportAction) {
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                        [parentReportActionID]: {childReportID: preexistingReportID},
                    });
                }
            }
        };

        const isParentOneTransactionReport = isOneTransactionReport(parentReport);

        // If the parent report is a one transaction report, we want to copy the draft comment to the one transaction report instead of the preexisting thread report
        const reportToCopyDraftTo = !!parentReportID && isParentOneTransactionReport ? parentReportID : preexistingReportID;

        if (!navigationRef.isReady()) {
            callback();
            return;
        }

        // Use Navigation.getActiveRoute() instead of navigationRef.getCurrentRoute()?.path because
        // getCurrentRoute().path can be undefined during first navigation.
        // We still need getCurrentRoute() for params and screen name as getActiveRoute() only returns the path string.
        const activeRoute = Navigation.getActiveRoute();
        const currentRouteInfo = navigationRef.getCurrentRoute();
        const backTo = (currentRouteInfo?.params as {backTo?: Route})?.backTo;
        const screenName = currentRouteInfo?.name;

        const isOptimisticReportFocused = activeRoute.includes(`/r/${reportID}`);

        // Fix specific case: https://github.com/Expensify/App/pull/77657#issuecomment-3678696730.
        // When user is editing a money request report (/e/:reportID route) and has
        // an optimistic report in the background that should be replaced with preexisting report
        const isOptimisticReportInBackground = screenName === SCREENS.RIGHT_MODAL.EXPENSE_REPORT && backTo && backTo.includes(`/r/${reportID}`);

        // Only re-route them if they are still looking at the optimistically created report
        if (isOptimisticReportFocused || isOptimisticReportInBackground) {
            const currCallback = callback;
            callback = () => {
                if (isOptimisticReportFocused) {
                    if (!parentReportActionID || !isParentOneTransactionReport) {
                        // We are either in a DM/group-DM that do not have a parent report,
                        // a thread under any comment,
                        // or transaction thread report under an IOU report action that its parent IOU report is not a one expense report,
                        // we need to navigate to the preexisting report chat
                        // because we will clear the optimistically created report in the currCallback
                        Navigation.setParams({reportID: preexistingReportID.toString()});
                    } else {
                        // We are in a transaction thread report under an IOU report action where the parent IOU report is a one transaction report
                        // We need to navigate to the one expense report screen instead of the preexisting report chat
                        // because we will clear the optimistically created transaction thread report in the currCallback
                        // and the one transaction should be accessed via the one expense report screen and not the preexisting report chat
                        Navigation.setParams({reportID: parentReportID});
                    }
                } else if (isOptimisticReportInBackground) {
                    // Navigate to the correct backTo route with the preexisting report ID
                    Navigation.navigate(backTo.replace(`/r/${reportID}`, `/r/${preexistingReportID}`) as Route);
                }
                currCallback();
            };

            // The report screen will listen to this event and transfer the draft comment to the existing report
            // This will allow the newest draft comment to be transferred to the existing report
            DeviceEventEmitter.emit(`switchToPreExistingReport_${reportID}`, {
                preexistingReportID,
                reportToCopyDraftTo,
                callback,
            });

            return;
        }

        if (
            parentReportID &&
            isParentOneTransactionReport &&
            (activeRoute.includes(ROUTES.REPORT_WITH_ID.getRoute(parentReportID)) || activeRoute.includes(ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID})))
        ) {
            if (draftReportComment) {
                // Transfer draft to parent report before clearing optimistic report
                saveReportDraftComment(parentReportID, draftReportComment, () => {
                    callback();

                    // We are already on the parent one expense report, so just call the API to fetch report data
                    openReport(parentReportID);
                });
            } else {
                callback();

                // We are already on the parent one expense report, so just call the API to fetch report data
                openReport(parentReportID);
            }
            return;
        }

        // In case the user is not on the report screen, we will transfer the report draft comment directly to the existing report
        // after that clear the optimistically created report
        if (!draftReportComment) {
            callback();
            return;
        }

        saveReportDraftComment(reportToCopyDraftTo, draftReportComment, callback);
    });
}

// Reports are observed only to detect preexistingReportID and run replacement; no UI subscribes, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value: OnyxCollection<Report>) => {
        allReports = value;

        if (!value) {
            return;
        }

        for (const report of Object.values(value)) {
            if (!report) {
                continue;
            }

            replaceOptimisticReportWithActualReport(report, allReportDraftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`]);
        }
    },
});

export {replaceOptimisticReportWithActualReport};

export default {};
