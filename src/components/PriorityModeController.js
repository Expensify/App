"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PriorityModeController;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var User_1 = require("@libs/actions/User");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Log_1 = require("@libs/Log");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var FocusModeNotification_1 = require("./FocusModeNotification");
/**
 * This component is used to automatically switch a user into #focus mode when they exceed a certain number of reports.
 * We do this primarily for performance reasons. Similar to the "Welcome action" we must wait for a number of things to
 * happen when the user signs in or refreshes the page:
 *
 *  - NVP that tracks whether they have already been switched over. We only do this once.
 *  - Priority mode NVP (that dictates the ordering/filtering logic of the LHN)
 *  - Reports to load (in ReconnectApp or OpenApp). As we check the count of the reports to determine whether the
 *    user is eligible to be automatically switched.
 *
 */
function PriorityModeController() {
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.accountID; }, canBeMissing: true })[0];
    var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { canBeMissing: true })[0];
    var isInFocusMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { selector: function (priorityMode) { return priorityMode === CONST_1.default.PRIORITY_MODE.GSD; }, canBeMissing: true })[0];
    var hasTriedFocusMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE, { canBeMissing: true })[0];
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true })[0];
    var currentRouteName = useCurrentRouteName();
    var _a = (0, react_1.useState)(false), shouldShowModal = _a[0], setShouldShowModal = _a[1];
    var closeModal = (0, react_1.useCallback)(function () { return setShouldShowModal(false); }, []);
    var validReportCount = (0, react_1.useMemo)(function () {
        var count = 0;
        Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).forEach(function (report) {
            if (!(0, ReportUtils_1.isValidReport)(report) || !(0, ReportUtils_1.isReportParticipant)(accountID !== null && accountID !== void 0 ? accountID : CONST_1.default.DEFAULT_NUMBER_ID, report)) {
                return;
            }
            count++;
        });
        return count;
    }, [accountID, allReports]);
    // We set this when we have finally auto-switched the user of #focus mode to prevent duplication.
    var hasSwitched = (0, react_1.useRef)(false);
    // Listen for state changes and trigger the #focus mode when appropriate
    (0, react_1.useEffect)(function () {
        // Wait for Onyx state to fully load
        if (isLoadingReportData !== false || isInFocusMode === undefined || hasTriedFocusMode === undefined || !accountID) {
            return;
        }
        if (hasSwitched.current || isInFocusMode || hasTriedFocusMode) {
            return;
        }
        if (validReportCount < CONST_1.default.REPORT.MAX_COUNT_BEFORE_FOCUS_UPDATE) {
            Log_1.default.info('[PriorityModeController] Not switching user to focus mode as they do not have enough reports', false, { validReportCount: validReportCount });
            return;
        }
        // We wait for the user to navigate back to the home screen before triggering this switch
        var isNarrowLayout = (0, getIsNarrowLayout_1.default)();
        if ((isNarrowLayout && currentRouteName !== SCREENS_1.default.HOME) || (!isNarrowLayout && currentRouteName !== SCREENS_1.default.REPORT)) {
            Log_1.default.info("[PriorityModeController] Not switching user to focus mode as they aren't on the home screen", false, { validReportCount: validReportCount, currentRouteName: currentRouteName });
            return;
        }
        Log_1.default.info('[PriorityModeController] Switching user to focus mode', false, { validReportCount: validReportCount, hasTriedFocusMode: hasTriedFocusMode, isInFocusMode: isInFocusMode, currentRouteName: currentRouteName });
        (0, User_1.updateChatPriorityMode)(CONST_1.default.PRIORITY_MODE.GSD, true);
        setShouldShowModal(true);
        hasSwitched.current = true;
    }, [accountID, currentRouteName, hasTriedFocusMode, isInFocusMode, isLoadingReportData, validReportCount]);
    return shouldShowModal ? <FocusModeNotification_1.default onClose={closeModal}/> : null;
}
/**
 * A funky but reliable way to subscribe to screen changes.
 */
function useCurrentRouteName() {
    var navigation = (0, native_1.useNavigation)();
    var _a = (0, react_1.useState)(''), currentRouteName = _a[0], setCurrentRouteName = _a[1];
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('state', function () {
            var _a;
            setCurrentRouteName((_a = navigationRef_1.default.getCurrentRoute()) === null || _a === void 0 ? void 0 : _a.name);
        });
        return function () { return unsubscribe(); };
    }, [navigation]);
    return currentRouteName;
}
