import Onyx from 'react-native-onyx';
import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportActionPushNotificationData} from '@libs/Notification/PushNotification/NotificationType';
import {extractPolicyIDFromPath} from '@libs/PolicyUtils';
import Visibility from '@libs/Visibility';
import {updateLastVisitedPath} from '@userActions/App';
import * as Modal from '@userActions/Modal';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
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

let isSingleNewDotEntry: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY,
    callback: (value) => {
        if (!value) {
            return;
        }
        isSingleNewDotEntry = value;
    },
});

function getLastUpdateIDAppliedToClient(): Promise<number> {
    return new Promise((resolve) => {
        Onyx.connect({
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: (value) => resolve(value ?? CONST.DEFAULT_NUMBER_ID),
        });
    });
}

function applyOnyxData({reportID, reportActionID, onyxData, lastUpdateID, previousUpdateID, hasPendingOnyxUpdates = false}: ReportActionPushNotificationData): Promise<void> {
    Log.info(`[PushNotification] Applying onyx data in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});

    if (!ActiveClientManager.isClientTheLeader()) {
        Log.info('[PushNotification] received report comment notification, but ignoring it since this is not the active client');
        return Promise.resolve();
    }

    const logMissingOnyxDataInfo = (isDataMissing: boolean): boolean => {
        if (isDataMissing) {
            Log.hmmm("[PushNotification] didn't apply onyx updates because some data is missing", {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});
            return false;
        }

        Log.info('[PushNotification] reliable onyx update received', false, {lastUpdateID, previousUpdateID, onyxDataCount: onyxData?.length ?? 0});
        return true;
    };

    let updates: OnyxUpdatesFromServer;
    if (hasPendingOnyxUpdates) {
        const isDataMissing = !lastUpdateID;
        logMissingOnyxDataInfo(isDataMissing);
        if (isDataMissing) {
            return Promise.resolve();
        }

        updates = {
            type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID,
            shouldFetchPendingUpdates: true,
            updates: [],
        };
    } else {
        const isDataMissing = !lastUpdateID || !onyxData || !previousUpdateID;
        logMissingOnyxDataInfo(isDataMissing);
        if (isDataMissing) {
            return Promise.resolve();
        }

        updates = {
            type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID,
            previousUpdateID,
            updates: [
                {
                    eventType: '', // This is only needed for Pusher events
                    data: onyxData,
                },
            ],
        };
    }

    /**
     * When this callback runs in the background on Android (via Headless JS), no other Onyx.connect callbacks will run. This means that
     * lastUpdateIDAppliedToClient will NOT be populated in other libs. To workaround this, we manually read the value here
     * and pass it as a param
     */
    return getLastUpdateIDAppliedToClient().then((lastUpdateIDAppliedToClient) => applyOnyxUpdatesReliably(updates, {shouldRunSync: true, clientLastUpdateID: lastUpdateIDAppliedToClient}));
}

function navigateToReport({reportID, reportActionID}: ReportActionPushNotificationData): Promise<void> {
    Log.info('[PushNotification] Navigating to report', false, {reportID, reportActionID});

    const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);

    Navigation.waitForProtectedRoutes().then(() => {
        // The attachment modal remains open when navigating to the report so we need to close it
        Modal.close(() => {
            try {
                // When transitioning to the new experience via the singleNewDotEntry flow, the navigation
                // is handled elsewhere. So we cancel here to prevent double navigation.
                if (isSingleNewDotEntry) {
                    Log.info('[PushNotification] Not navigating because this is a singleNewDotEntry flow', false, {reportID, reportActionID});
                    return;
                }

                // Get rid of the transition screen, if it is on the top of the stack
                if (CONFIG.IS_HYBRID_APP && Navigation.getActiveRoute().includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
                    Navigation.goBack();
                }
                // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
                if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                    Navigation.goBack();
                }

                Log.info('[PushNotification] onSelected() - Navigation is ready. Navigating...', false, {reportID, reportActionID});
                Navigation.navigateToReportWithPolicyCheck({reportID: String(reportID), policyIDToCheck: policyID});
                updateLastVisitedPath(ROUTES.REPORT_WITH_ID.getRoute(String(reportID)));
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

            PushNotification.onReceived(PushNotification.TYPE.REPORT_ACTION, applyOnyxData);
            PushNotification.onSelected(PushNotification.TYPE.REPORT_ACTION, navigateToReport);
        } else {
            PushNotification.deregister();
            PushNotification.clearNotifications();
        }
    },
});
