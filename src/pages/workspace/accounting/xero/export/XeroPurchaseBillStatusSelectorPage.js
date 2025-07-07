"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var isEmpty_1 = require("lodash/isEmpty");
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
function XeroPurchaseBillStatusSelectorPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.xero) !== null && _c !== void 0 ? _c : {}).config;
    var invoiceStatus = (_e = (_d = config === null || config === void 0 ? void 0 : config.export) === null || _d === void 0 ? void 0 : _d.billStatus) === null || _e === void 0 ? void 0 : _e.purchase;
    var route = (0, native_1.useRoute)();
    var backTo = (_f = route.params) === null || _f === void 0 ? void 0 : _f.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var data = Object.values(CONST_1.default.XERO_CONFIG.INVOICE_STATUS).map(function (status) { return ({
        value: status,
        text: translate("workspace.xero.invoiceStatus.values.".concat(status)),
        keyForList: status,
        isSelected: invoiceStatus === status,
    }); });
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.invoiceStatus.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var selectPurchaseBillStatus = (0, react_1.useCallback)(function (row) {
        var _a, _b, _c;
        if ((0, isEmpty_1.default)((_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.billStatus)) {
            return;
        }
        if (row.value !== invoiceStatus && policyID) {
            (0, Xero_1.updateXeroExportBillStatus)(policyID, __assign(__assign({}, (_b = config === null || config === void 0 ? void 0 : config.export) === null || _b === void 0 ? void 0 : _b.billStatus), { purchase: row.value }), (_c = config === null || config === void 0 ? void 0 : config.export) === null || _c === void 0 ? void 0 : _c.billStatus);
        }
        goBack();
    }, [(_g = config === null || config === void 0 ? void 0 : config.export) === null || _g === void 0 ? void 0 : _g.billStatus, invoiceStatus, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={XeroPurchaseBillStatusSelectorPage.displayName} title="workspace.xero.invoiceStatus.label" headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectPurchaseBillStatus(selection); }} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.BILL_STATUS], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.XERO_CONFIG.BILL_STATUS)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearXeroErrorField)(policyID, CONST_1.default.XERO_CONFIG.BILL_STATUS); }}/>);
}
XeroPurchaseBillStatusSelectorPage.displayName = 'XeroPurchaseBillStatusSelectorPage';
exports.default = (0, withPolicyConnections_1.default)(XeroPurchaseBillStatusSelectorPage);
