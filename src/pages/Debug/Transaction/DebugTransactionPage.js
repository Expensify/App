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
var Debug_1 = require("@libs/actions/Debug");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var DebugTabNavigator_1 = require("@libs/Navigation/DebugTabNavigator");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var TagsOptionsListUtils = require("@libs/TagsOptionsListUtils");
var DebugDetails_1 = require("@pages/Debug/DebugDetails");
var DebugJSON_1 = require("@pages/Debug/DebugJSON");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var DebugTransactionViolations_1 = require("./DebugTransactionViolations");
function DebugTransactionPage(_a) {
    var transactionID = _a.route.params.transactionID;
    var translate = (0, useLocalize_1.default)().translate;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID))[0];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID))[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID))[0];
    var policyTagLists = (0, react_1.useMemo)(function () { return PolicyUtils.getTagLists(policyTags); }, [policyTags]);
    var styles = (0, useThemeStyles_1.default)();
    var DebugDetailsTab = (0, react_1.useCallback)(function () { return (<DebugDetails_1.default formType={CONST_1.default.DEBUG.FORMS.TRANSACTION} data={transaction} policyID={report === null || report === void 0 ? void 0 : report.policyID} policyHasEnabledTags={TagsOptionsListUtils.hasEnabledTags(policyTagLists)} onSave={function (data) {
            Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), data);
        }} onDelete={function () {
            Navigation_1.default.goBack();
            // We need to wait for navigation animations to finish before deleting a transaction,
            // otherwise the user will see a not found page briefly.
            react_native_1.InteractionManager.runAfterInteractions(function () {
                Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), null);
            });
        }} validate={DebugUtils_1.default.validateTransactionDraftProperty}>
                <react_native_1.View style={[styles.mh5, styles.mb5]}>
                    <Button_1.default text={translate('debug.viewReport')} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT.getRoute("".concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)));
        }}/>
                </react_native_1.View>
            </DebugDetails_1.default>); }, [policyTagLists, report === null || report === void 0 ? void 0 : report.policyID, styles.mb5, styles.mh5, transaction, transactionID, translate]);
    var DebugJSONTab = (0, react_1.useCallback)(function () { return <DebugJSON_1.default data={transaction !== null && transaction !== void 0 ? transaction : {}}/>; }, [transaction]);
    var DebugTransactionViolationsTab = (0, react_1.useCallback)(function () { return <DebugTransactionViolations_1.default transactionID={transactionID}/>; }, [transactionID]);
    var routes = (0, react_1.useMemo)(function () { return [
        { name: CONST_1.default.DEBUG.DETAILS, component: DebugDetailsTab },
        { name: CONST_1.default.DEBUG.JSON, component: DebugJSONTab },
        { name: CONST_1.default.DEBUG.TRANSACTION_VIOLATIONS, component: DebugTransactionViolationsTab },
    ]; }, [DebugDetailsTab, DebugJSONTab, DebugTransactionViolationsTab]);
    if (!transaction) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()} testID={DebugTransactionPage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.transaction'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <DebugTabNavigator_1.default id={CONST_1.default.TAB.DEBUG_TAB_ID} routes={routes}/>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugTransactionPage.displayName = 'DebugTransactionPage';
exports.default = DebugTransactionPage;
