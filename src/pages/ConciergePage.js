"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var ReportHeaderSkeletonView_1 = require("@components/ReportHeaderSkeletonView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var App_1 = require("@libs/actions/App");
var Report_1 = require("@libs/actions/Report");
var Task_1 = require("@libs/actions/Task");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage() {
    var styles = (0, useThemeStyles_1.default)();
    var isUnmounted = (0, react_1.useRef)(false);
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { initialValue: true, canBeMissing: true })[0];
    var route = (0, native_1.useRoute)();
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: true })[0];
    var viewTourTaskReportID = introSelected === null || introSelected === void 0 ? void 0 : introSelected.viewTour;
    var viewTourTaskReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(viewTourTaskReportID), { canBeMissing: true })[0];
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (session && 'authToken' in session) {
            (0, App_1.confirmReadyToOpenApp)();
            Navigation_1.default.isNavigationReady().then(function () {
                var _a;
                if (isUnmounted.current || isLoadingReportData === undefined || !!isLoadingReportData) {
                    return;
                }
                // Mark the viewTourTask as complete if we are redirected to Concierge after finishing the Navattic tour
                var navattic = ((_a = route.params) !== null && _a !== void 0 ? _a : {}).navattic;
                if (navattic === CONST_1.default.NAVATTIC.COMPLETED) {
                    if (viewTourTaskReport) {
                        if (viewTourTaskReport.stateNum !== CONST_1.default.REPORT.STATE_NUM.APPROVED || viewTourTaskReport.statusNum !== CONST_1.default.REPORT.STATUS_NUM.APPROVED) {
                            (0, Task_1.completeTask)(viewTourTaskReport);
                        }
                    }
                }
                (0, Report_1.navigateToConciergeChat)(true, function () { return !isUnmounted.current; });
            });
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.HOME);
        }
    }, [session, isLoadingReportData, route.params, viewTourTaskReport]));
    (0, react_1.useEffect)(function () {
        isUnmounted.current = false;
        return function () {
            isUnmounted.current = true;
        };
    }, []);
    return (<ScreenWrapper_1.default testID={ConciergePage.displayName}>
            <react_native_1.View style={[styles.borderBottom, styles.appContentHeader]}>
                <ReportHeaderSkeletonView_1.default onBackButtonPress={Navigation_1.default.goBack}/>
            </react_native_1.View>
            <ReportActionsSkeletonView_1.default />
        </ScreenWrapper_1.default>);
}
ConciergePage.displayName = 'ConciergePage';
exports.default = ConciergePage;
