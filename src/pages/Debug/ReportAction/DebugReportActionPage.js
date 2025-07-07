"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var DebugTabNavigator_1 = require("@libs/Navigation/DebugTabNavigator");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var DebugDetails_1 = require("@pages/Debug/DebugDetails");
var DebugJSON_1 = require("@pages/Debug/DebugJSON");
var Debug_1 = require("@userActions/Debug");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var DebugReportActionPreview_1 = require("./DebugReportActionPreview");
function DebugReportActionPage(_a) {
    var _b = _a.route.params, reportID = _b.reportID, reportActionID = _b.reportActionID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), {
        canEvict: false,
        selector: function (reportActions) { return reportActions === null || reportActions === void 0 ? void 0 : reportActions[reportActionID]; },
    })[0];
    var transactionID = (0, ReportActionsUtils_1.getLinkedTransactionID)(reportAction);
    var DebugDetailsTab = (0, react_1.useCallback)(function () { return (<DebugDetails_1.default formType={CONST_1.default.DEBUG.FORMS.REPORT_ACTION} data={reportAction} onSave={function (data) {
            var _a;
            Debug_1.default.mergeDebugData("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), (_a = {}, _a[reportActionID] = data, _a));
        }} onDelete={function () {
            Navigation_1.default.goBack();
            // We need to wait for navigation animations to finish before deleting an action,
            // otherwise the user will see a not found page briefly.
            react_native_1.InteractionManager.runAfterInteractions(function () {
                var _a;
                Debug_1.default.mergeDebugData("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), (_a = {}, _a[reportActionID] = null, _a));
            });
        }} validate={DebugUtils_1.default.validateReportActionDraftProperty}>
                {!!transactionID && (<react_native_1.View style={[styles.mh5, styles.mb5]}>
                        <Button_1.default text={translate('debug.viewTransaction')} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.DEBUG_TRANSACTION.getRoute(transactionID));
            }}/>
                    </react_native_1.View>)}
            </DebugDetails_1.default>); }, [reportAction, reportActionID, reportID, styles.mb5, styles.mh5, transactionID, translate]);
    var DebugJSONTab = (0, react_1.useCallback)(function () { return <DebugJSON_1.default data={reportAction !== null && reportAction !== void 0 ? reportAction : {}}/>; }, [reportAction]);
    var DebugReportActionPreviewTab = (0, react_1.useCallback)(function () { return (<DebugReportActionPreview_1.default reportAction={reportAction} reportID={reportID}/>); }, [reportAction, reportID]);
    var routes = (0, react_1.useMemo)(function () { return [
        { name: CONST_1.default.DEBUG.DETAILS, component: DebugDetailsTab },
        { name: CONST_1.default.DEBUG.JSON, component: DebugJSONTab },
        { name: CONST_1.default.DEBUG.REPORT_ACTION_PREVIEW, component: DebugReportActionPreviewTab },
    ]; }, [DebugDetailsTab, DebugJSONTab, DebugReportActionPreviewTab]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={DebugReportActionPage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.reportAction'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <DebugTabNavigator_1.default id={CONST_1.default.TAB.DEBUG_TAB_ID} routes={routes}/>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugReportActionPage.displayName = 'DebugReportActionPage';
exports.default = DebugReportActionPage;
