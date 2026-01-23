import {DeviceEventEmitter, InteractionManager} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {saveReportDraftComment} from '@libs/actions/Report';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isMoneyRequest, isMoneyRequestReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';

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
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDraftComments = value ?? {}),
});

let allReports: OnyxCollection<Report>;

const allReportActions: OnyxCollection<ReportActions> = {};
Onyx.connect({
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
    if ((isMoneyRequestReport(report) || isMoneyRequest(report)) && parentReportID && parentReportActionID) {
        const parentReportAction = allReportActions?.[parentReportID]?.[parentReportActionID];
        if (parentReportAction?.childReportID === reportID) {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentReportActionID]: null,
            });
        }
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
        // In this case, the API will let us know by returning a preexistingReportID.
        // We should clear out the optimistically created report and re-route the user to the preexisting report.
        let callback = () => {
            const existingReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`];

            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${preexistingReportID}`, {
                ...report,
                reportID: preexistingReportID,
                preexistingReportID: null,
                // Replacing the existing report's participants to avoid duplicates
                participants: existingReport?.participants ?? report.participants,
            });
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, null);
        };

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
                currCallback();
                if (isOptimisticReportFocused) {
                    Navigation.setParams({reportID: preexistingReportID.toString()});
                } else if (isOptimisticReportInBackground) {
                    // Navigate to the correct backTo route with the preexisting report ID
                    Navigation.navigate(backTo.replace(`/r/${reportID}`, `/r/${preexistingReportID}`) as Route);
                }
            };

            // The report screen will listen to this event and transfer the draft comment to the existing report
            // This will allow the newest draft comment to be transferred to the existing report
            DeviceEventEmitter.emit(`switchToPreExistingReport_${reportID}`, {
                preexistingReportID,
                callback,
            });

            return;
        }

        // In case the user is not on the report screen, we will transfer the report draft comment directly to the existing report
        // after that clear the optimistically created report
        if (!draftReportComment) {
            callback();
            return;
        }

        saveReportDraftComment(preexistingReportID, draftReportComment, callback);
    });
}

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
