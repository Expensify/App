"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var ReportHeaderSkeletonView_1 = require("@components/ReportHeaderSkeletonView");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var interceptAnonymousUser_1 = require("@libs/interceptAnonymousUser");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var App = require("@userActions/App");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, start Submit Expense
 *     - Else re-route to the login page
 */
function SubmitExpensePage() {
    var styles = (0, useThemeStyles_1.default)();
    var isUnmounted = (0, react_1.useRef)(false);
    (0, native_1.useFocusEffect)(function () {
        (0, interceptAnonymousUser_1.default)(function () {
            App.confirmReadyToOpenApp();
            Navigation_1.default.isNavigationReady().then(function () {
                if (isUnmounted.current) {
                    return;
                }
                Navigation_1.default.goBack();
                IOU.startMoneyRequest(CONST_1.default.IOU.TYPE.SUBMIT, ReportUtils.generateReportID());
            });
        });
    });
    (0, react_1.useEffect)(function () { return function () {
        isUnmounted.current = true;
    }; }, []);
    return (<ScreenWrapper_1.default testID={SubmitExpensePage.displayName}>
            <react_native_1.View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView_1.default onBackButtonPress={Navigation_1.default.goBack}/>
            </react_native_1.View>
            <ReportActionsSkeletonView_1.default />
        </ScreenWrapper_1.default>);
}
SubmitExpensePage.displayName = 'SubmitExpensePage';
exports.default = SubmitExpensePage;
