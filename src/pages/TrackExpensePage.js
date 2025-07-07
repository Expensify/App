"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var ReportHeaderSkeletonView_1 = require("@components/ReportHeaderSkeletonView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var interceptAnonymousUser_1 = require("@libs/interceptAnonymousUser");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var App = require("@userActions/App");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their self DM and and start a Track Expense
 *     - Else re-route to the login page
 */
function TrackExpensePage() {
    var styles = (0, useThemeStyles_1.default)();
    var isUnmounted = (0, react_1.useRef)(false);
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_HAS_SEEN_TRACK_TRAINING), hasSeenTrackTraining = _a[0], hasSeenTrackTrainingResult = _a[1];
    var isLoadingHasSeenTrackTraining = (0, isLoadingOnyxValue_1.default)(hasSeenTrackTrainingResult);
    (0, native_1.useFocusEffect)(function () {
        (0, interceptAnonymousUser_1.default)(function () {
            App.confirmReadyToOpenApp();
            Navigation_1.default.isNavigationReady().then(function () {
                if (isUnmounted.current || isLoadingHasSeenTrackTraining) {
                    return;
                }
                Navigation_1.default.goBack();
                IOU.startMoneyRequest(CONST_1.default.IOU.TYPE.TRACK, 
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                ReportUtils.findSelfDMReportID() || ReportUtils.generateReportID());
                if (!hasSeenTrackTraining && !isOffline) {
                    setTimeout(function () {
                        Navigation_1.default.navigate(ROUTES_1.default.TRACK_TRAINING_MODAL);
                    }, CONST_1.default.ANIMATED_TRANSITION);
                }
            });
        });
    });
    (0, react_1.useEffect)(function () { return function () {
        isUnmounted.current = true;
    }; }, []);
    return (<ScreenWrapper_1.default testID={TrackExpensePage.displayName}>
            <react_native_1.View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView_1.default onBackButtonPress={Navigation_1.default.goBack}/>
            </react_native_1.View>
            <ReportActionsSkeletonView_1.default />
        </ScreenWrapper_1.default>);
}
TrackExpensePage.displayName = 'TrackExpensePage';
exports.default = TrackExpensePage;
