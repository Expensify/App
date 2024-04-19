import Onyx from 'react-native-onyx';
import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
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

function getLastUpdateIDAppliedToClient(): Promise<number> {
    return new Promise((resolve) => {
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => resolve(value ?? 0),
        });
    });
}

/**
 * Setup reportComment push notification callbacks.
 */
export default function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID, onyxData, lastUpdateID, previousUpdateID}) => {
        Log.info(`[PushNotification] received report comment notification in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});

        if (!ActiveClientManager.isClientTheLeader()) {
            Log.info('[PushNotification] received report comment notification, but ignoring it since this is not the active client');
            return Promise.resolve();
        }

        if (!onyxData || !lastUpdateID || !previousUpdateID) {
            Log.hmmm("[PushNotification] didn't apply onyx updates because some data is missing", {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});
            return Promise.resolve();
        }

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

        /**
         * When this callback runs in the background on Android (via Headless JS), no other Onyx.connect callbacks will run. This means that
         * lastUpdateIDAppliedToClient will NOT be populated in other libs. To workaround this, we manually read the value here
         * and pass it as a param
         */
        return getLastUpdateIDAppliedToClient().then((lastUpdateIDAppliedToClient) => applyOnyxUpdatesReliably(updates, true, lastUpdateIDAppliedToClient));
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

        return Promise.resolve();
    });
}
