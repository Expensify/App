"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var applyOnyxUpdatesReliably_1 = require("@libs/actions/applyOnyxUpdatesReliably");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Visibility_1 = require("@libs/Visibility");
var App_1 = require("@userActions/App");
var Modal = require("@userActions/Modal");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var _1 = require(".");
/**
 * Manage push notification subscriptions on sign-in/sign-out.
 */
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    callback: function (notificationID) {
        if (notificationID) {
            _1.default.register(notificationID);
            _1.default.init();
            // Subscribe handlers for different push notification types
            _1.default.onReceived(_1.default.TYPE.REPORT_COMMENT, applyOnyxData);
            _1.default.onSelected(_1.default.TYPE.REPORT_COMMENT, navigateToReport);
            _1.default.onReceived(_1.default.TYPE.REPORT_ACTION, applyOnyxData);
            _1.default.onSelected(_1.default.TYPE.REPORT_ACTION, navigateToReport);
            _1.default.onReceived(_1.default.TYPE.TRANSACTION, applyOnyxData);
            _1.default.onSelected(_1.default.TYPE.TRANSACTION, navigateToReport);
        }
        else {
            _1.default.deregister();
            _1.default.clearNotifications();
        }
    },
});
var isSingleNewDotEntry;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.IS_SINGLE_NEW_DOT_ENTRY,
    callback: function (value) {
        if (!value) {
            return;
        }
        isSingleNewDotEntry = value;
    },
});
function applyOnyxData(_a) {
    var reportID = _a.reportID, onyxData = _a.onyxData, lastUpdateID = _a.lastUpdateID, previousUpdateID = _a.previousUpdateID, _b = _a.hasPendingOnyxUpdates, hasPendingOnyxUpdates = _b === void 0 ? false : _b;
    Log_1.default.info("[PushNotification] Applying onyx data in the ".concat(Visibility_1.default.isVisible() ? 'foreground' : 'background'), false, { reportID: reportID });
    var logMissingOnyxDataInfo = function (isDataMissing) {
        var _a, _b;
        if (isDataMissing) {
            Log_1.default.hmmm("[PushNotification] didn't apply onyx updates because some data is missing", { lastUpdateID: lastUpdateID, previousUpdateID: previousUpdateID, onyxDataCount: (_a = onyxData === null || onyxData === void 0 ? void 0 : onyxData.length) !== null && _a !== void 0 ? _a : 0 });
            return false;
        }
        Log_1.default.info('[PushNotification] reliable onyx update received', false, { lastUpdateID: lastUpdateID, previousUpdateID: previousUpdateID, onyxDataCount: (_b = onyxData === null || onyxData === void 0 ? void 0 : onyxData.length) !== null && _b !== void 0 ? _b : 0 });
        return true;
    };
    var updates;
    if (hasPendingOnyxUpdates) {
        var isDataMissing = !lastUpdateID;
        logMissingOnyxDataInfo(isDataMissing);
        if (isDataMissing) {
            return Promise.resolve();
        }
        updates = {
            type: CONST_1.default.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID: lastUpdateID,
            shouldFetchPendingUpdates: true,
            updates: [],
        };
    }
    else {
        var isDataMissing = !lastUpdateID || !onyxData || !previousUpdateID;
        logMissingOnyxDataInfo(isDataMissing);
        if (isDataMissing) {
            return Promise.resolve();
        }
        updates = {
            type: CONST_1.default.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID: lastUpdateID,
            previousUpdateID: previousUpdateID,
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
    return getLastUpdateIDAppliedToClient().then(function (lastUpdateIDAppliedToClient) { return (0, applyOnyxUpdatesReliably_1.default)(updates, { shouldRunSync: true, clientLastUpdateID: lastUpdateIDAppliedToClient }); });
}
function navigateToReport(_a) {
    var reportID = _a.reportID;
    Log_1.default.info('[PushNotification] Navigating to report', false, { reportID: reportID });
    Navigation_1.default.waitForProtectedRoutes().then(function () {
        // The attachment modal remains open when navigating to the report so we need to close it
        Modal.close(function () {
            try {
                // When transitioning to the new experience via the singleNewDotEntry flow, the navigation
                // is handled elsewhere. So we cancel here to prevent double navigation.
                if (isSingleNewDotEntry) {
                    Log_1.default.info('[PushNotification] Not navigating because this is a singleNewDotEntry flow', false, { reportID: reportID });
                    return;
                }
                // Get rid of the transition screen, if it is on the top of the stack
                if (CONFIG_1.default.IS_HYBRID_APP && Navigation_1.default.getActiveRoute().includes(ROUTES_1.default.TRANSITION_BETWEEN_APPS)) {
                    Navigation_1.default.goBack();
                }
                // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
                if (Navigation_1.default.getActiveRoute().slice(1, 2) === ROUTES_1.default.REPORT && !Navigation_1.default.isActiveRoute("r/".concat(reportID))) {
                    Navigation_1.default.goBack();
                }
                Log_1.default.info('[PushNotification] onSelected() - Navigation is ready. Navigating...', false, { reportID: reportID });
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(String(reportID), undefined, undefined, undefined, undefined, Navigation_1.default.getActiveRoute()));
                (0, App_1.updateLastVisitedPath)(ROUTES_1.default.REPORT_WITH_ID.getRoute(String(reportID)));
            }
            catch (error) {
                var errorMessage = String(error);
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                Log_1.default.alert('[PushNotification] onSelected() - failed', { reportID: reportID, error: errorMessage });
            }
        });
    });
    return Promise.resolve();
}
function getLastUpdateIDAppliedToClient() {
    return new Promise(function (resolve) {
        react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: function (value) { return resolve(value !== null && value !== void 0 ? value : CONST_1.default.DEFAULT_NUMBER_ID); },
        });
    });
}
