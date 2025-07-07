"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var Debug_1 = require("@libs/actions/Debug");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var DebugTabNavigator_1 = require("@libs/Navigation/DebugTabNavigator");
var Navigation_1 = require("@libs/Navigation/Navigation");
var DebugDetails_1 = require("@pages/Debug/DebugDetails");
var DebugJSON_1 = require("@pages/Debug/DebugJSON");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DebugTransactionViolationPage(_a) {
    var _b = _a.route.params, transactionID = _b.transactionID, index = _b.index;
    var translate = (0, useLocalize_1.default)().translate;
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var transactionViolation = (0, react_1.useMemo)(function () { return transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations[Number(index)]; }, [index, transactionViolations]);
    var styles = (0, useThemeStyles_1.default)();
    var saveChanges = (0, react_1.useCallback)(function (data) {
        var updatedTransactionViolations = __spreadArray([], (transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : []), true);
        updatedTransactionViolations.splice(Number(index), 1, data);
        Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), updatedTransactionViolations);
    }, [index, transactionID, transactionViolations]);
    var deleteTransactionViolation = (0, react_1.useCallback)(function () {
        var updatedTransactionViolations = __spreadArray([], (transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : []), true);
        updatedTransactionViolations.splice(Number(index), 1);
        Navigation_1.default.goBack();
        // We need to wait for navigation animations to finish before deleting a violation,
        // otherwise the user will see a not found page briefly.
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), updatedTransactionViolations);
        });
    }, [index, transactionID, transactionViolations]);
    var DebugDetailsTab = (0, react_1.useCallback)(function () { return (<DebugDetails_1.default formType={CONST_1.default.DEBUG.FORMS.TRANSACTION_VIOLATION} data={transactionViolation} onSave={saveChanges} onDelete={deleteTransactionViolation} validate={DebugUtils_1.default.validateTransactionViolationDraftProperty}/>); }, [deleteTransactionViolation, saveChanges, transactionViolation]);
    var DebugJSONTab = (0, react_1.useCallback)(function () { return <DebugJSON_1.default data={transactionViolation !== null && transactionViolation !== void 0 ? transactionViolation : {}}/>; }, [transactionViolation]);
    var routes = (0, react_1.useMemo)(function () { return [
        { name: CONST_1.default.DEBUG.DETAILS, component: DebugDetailsTab },
        { name: CONST_1.default.DEBUG.JSON, component: DebugJSONTab },
    ]; }, [DebugDetailsTab, DebugJSONTab]);
    if (!transactionViolation) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={DebugTransactionViolationPage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.transactionViolation'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <DebugTabNavigator_1.default id={CONST_1.default.TAB.DEBUG_TAB_ID} routes={routes}/>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugTransactionViolationPage.displayName = 'DebugTransactionViolationPage';
exports.default = DebugTransactionViolationPage;
