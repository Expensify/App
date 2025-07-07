"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Xero_1 = require("@userActions/connections/Xero");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroPurchaseBillDateSelectPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.xero) !== null && _c !== void 0 ? _c : {}).config;
    var data = Object.values(CONST_1.default.XERO_EXPORT_DATE).map(function (dateType) {
        var _a;
        return ({
            value: dateType,
            text: translate("workspace.xero.exportDate.values.".concat(dateType, ".label")),
            alternateText: translate("workspace.xero.exportDate.values.".concat(dateType, ".description")),
            keyForList: dateType,
            isSelected: ((_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.billDate) === dateType,
        });
    });
    var route = (0, native_1.useRoute)();
    var backTo = (_d = route.params) === null || _d === void 0 ? void 0 : _d.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportDate.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var selectExportDate = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        if (row.value !== ((_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.billDate) && policyID) {
            (0, Xero_1.updateXeroExportBillDate)(policyID, row.value, (_b = config === null || config === void 0 ? void 0 : config.export) === null || _b === void 0 ? void 0 : _b.billDate);
        }
        goBack();
    }, [(_e = config === null || config === void 0 ? void 0 : config.export) === null || _e === void 0 ? void 0 : _e.billDate, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={XeroPurchaseBillDateSelectPage.displayName} title="workspace.xero.exportDate.label" headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExportDate(selection); }} initiallyFocusedOptionKey={(_f = data.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.BILL_DATE], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.XERO_CONFIG.BILL_DATE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearXeroErrorField)(policyID, CONST_1.default.XERO_CONFIG.BILL_DATE); }}/>);
}
XeroPurchaseBillDateSelectPage.displayName = 'XeroPurchaseBillDateSelectPage';
exports.default = (0, withPolicyConnections_1.default)(XeroPurchaseBillDateSelectPage);
