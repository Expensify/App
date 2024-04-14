import Onyx from 'react-native-onyx';
import * as OnyxUpdates from '@libs/actions/OnyxUpdates';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {extractPolicyIDFromPath} from '@libs/PolicyUtils';
import {doesReportBelongToWorkspace, getReport} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PushNotification from './index';

let lastVisitedPath: string | undefined;
Onyx.connect({
    key: ONYXKEYS.LAST_VISITED_PATH,
    callback: (value) => {
        if (!value) {
            return;
        }
        lastVisitedPath = value;
    },
});

/**
 * Setup reportComment push notification callbacks.
 */
export default function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID, onyxData, lastUpdateID, previousUpdateID}) => {
        if (!ActiveClientManager.isClientTheLeader()) {
            Log.info('[PushNotification] received report comment notification, but ignoring it since this is not the active client');
            return;
        }
        Log.info(`[PushNotification] received report comment notification in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});

        if (onyxData && lastUpdateID && previousUpdateID) {
            Log.info('[PushNotification] reliable onyx update received', false, {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});

            const updates: OnyxUpdatesFromServer = {
                type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
                lastUpdateID,
                previousUpdateID,
                updates: [
                    {
                        eventType: 'eventType',
                        data: onyxData,
                    },
                ],
            };
            OnyxUpdates.applyOnyxUpdatesReliably(updates);
        } else {
            Log.hmmm("[PushNotification] Didn't apply onyx updates because some data is missing", {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});
        }
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID}) => {
        if (!reportID) {
            Log.warn('[PushNotification] This push notification has no reportID');
        }

        const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);
        const report = getReport(reportID.toString());
        const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];

        const reportBelongsToWorkspace = policyID && !isEmptyObject(report) && doesReportBelongToWorkspace(report, policyEmployeeAccountIDs, policyID);

        Log.info('[PushNotification] onSelected() - called', false, {reportID, reportActionID});
        Navigation.isNavigationReady()
            .then(Navigation.waitForProtectedRoutes)
            .then(() => {
                // The attachment modal remains open when navigating to the report so we need to close it
                Modal.close(() => {
                    try {
                        // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
                        if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                            Navigation.goBack();
                        }

                        Log.info('[PushNotification] onSelected() - Navigation is ready. Navigating...', false, {reportID, reportActionID});
                        if (!reportBelongsToWorkspace) {
                            Navigation.navigateWithSwitchPolicyID({route: ROUTES.HOME});
                        }
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(String(reportID)));
                    } catch (error) {
                        let errorMessage = String(error);
                        if (error instanceof Error) {
                            errorMessage = error.message;
                        }

                        Log.alert('[PushNotification] onSelected() - failed', {reportID, reportActionID, error: errorMessage});
                    }
                });
            });
    });
}
