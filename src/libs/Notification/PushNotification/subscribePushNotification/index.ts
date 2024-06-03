import Airship from '@ua/react-native-airship';
import Onyx from 'react-native-onyx';
import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import * as DeferredOnyxUpdates from '@libs/actions/OnyxUpdateManager/utils/DeferredOnyxUpdates';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import getPushNotificationData from '@libs/Notification/PushNotification/getPushNotificationData';
import type {ReportActionPushNotificationData} from '@libs/Notification/PushNotification/NotificationType';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {extractPolicyIDFromPath} from '@libs/PolicyUtils';
import {doesReportBelongToWorkspace, getReport} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PushNotification from '..';

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

function buildOnyxUpdatesFromServer({onyxData, lastUpdateID, previousUpdateID}: {onyxData: OnyxServerUpdate[]; lastUpdateID: number; previousUpdateID: number}) {
    return {
        type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
        lastUpdateID,
        previousUpdateID,
        updates: [
            {
                eventType: 'eventType',
                data: onyxData,
            },
        ],
    } as OnyxUpdatesFromServer;
}

function getLastUpdateIDAppliedToClient(): Promise<number> {
    return new Promise((resolve) => {
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => resolve(value ?? 0),
        });
    });
}

function applyOnyxData({reportID, reportActionID, onyxData, lastUpdateID, previousUpdateID}: ReportActionPushNotificationData): Promise<void> {
    Log.info(`[PushNotification] Applying onyx data in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});

    if (!ActiveClientManager.isClientTheLeader()) {
        Log.info('[PushNotification] received report comment notification, but ignoring it since this is not the active client');
        return Promise.resolve();
    }

    if (!onyxData || !lastUpdateID || !previousUpdateID) {
        Log.hmmm("[PushNotification] didn't apply onyx updates because some data is missing", {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});
        return Promise.resolve();
    }

    Log.info('[PushNotification] reliable onyx update received', false, {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});

    const updates = buildOnyxUpdatesFromServer({onyxData, lastUpdateID, previousUpdateID});

    /**
     * When this callback runs in the background on Android (via Headless JS), no other Onyx.connect callbacks will run. This means that
     * lastUpdateIDAppliedToClient will NOT be populated in other libs. To workaround this, we manually read the value here
     * and pass it as a param
     */
    return getLastUpdateIDAppliedToClient().then((lastUpdateIDAppliedToClient) => applyOnyxUpdatesReliably(updates, true, lastUpdateIDAppliedToClient));
}

function navigateToReport({reportID, reportActionID}: ReportActionPushNotificationData): Promise<void> {
    Log.info('[PushNotification] Adding push notification updates to deferred updates queue', false, {reportID, reportActionID});

    // Onyx data from push notifications might not have been applied when they were received in the background
    // due to OS limitations. So we'll also attempt to apply them here so they can display immediately. Reliable
    // updates will prevent any old updates from being duplicated and any gaps in them will be handled
    Airship.push
        .getActiveNotifications()
        .then((notifications) => {
            const onyxUpdates = notifications.reduce<DeferredUpdatesDictionary>((updates, notification) => {
                const pushNotificationData = getPushNotificationData(notification);
                const lastUpdateID = pushNotificationData.lastUpdateID;
                const previousUpdateID = pushNotificationData.previousUpdateID;

                if (pushNotificationData.onyxData == null || lastUpdateID == null || previousUpdateID == null) {
                    return updates;
                }

                const newUpdates = buildOnyxUpdatesFromServer({onyxData: pushNotificationData.onyxData, lastUpdateID, previousUpdateID});

                // eslint-disable-next-line no-param-reassign
                updates[lastUpdateID] = newUpdates;
                return updates;
            }, {});

            DeferredOnyxUpdates.enqueueAndProcess(onyxUpdates);

            Log.info('[PushNotification] Navigating to report', false, {reportID, reportActionID});
        })
        .then(Navigation.isNavigationReady)
        .then(Navigation.waitForProtectedRoutes)
        .then(() => {
            const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);
            const report = getReport(reportID.toString());
            const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];
            const reportBelongsToWorkspace = policyID && !isEmptyObject(report) && doesReportBelongToWorkspace(report, policyEmployeeAccountIDs, policyID);

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
}

/**
 * Manage push notification subscriptions on sign-in/sign-out.
 *
 * On Android, AuthScreens unmounts when the app is closed with the back button so we manage the
 * push subscription when the session changes here.
 */
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    callback: (notificationID) => {
        if (notificationID) {
            PushNotification.register(notificationID);
            PushNotification.init();

            // Subscribe handlers for different push notification types
            PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, applyOnyxData);
            PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, navigateToReport);

            PushNotification.onReceived(PushNotification.TYPE.MONEY_REQUEST, applyOnyxData);
            PushNotification.onSelected(PushNotification.TYPE.MONEY_REQUEST, navigateToReport);
        } else {
            PushNotification.deregister();
            PushNotification.clearNotifications();
        }
    },
});
