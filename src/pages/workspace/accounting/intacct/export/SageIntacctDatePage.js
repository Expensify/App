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
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctDatePage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) !== null && _c !== void 0 ? _c : {}).config;
    var _j = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.config) !== null && _f !== void 0 ? _f : {}, exportConfig = _j.export, pendingFields = _j.pendingFields;
    var data = Object.values(CONST_1.default.SAGE_INTACCT_EXPORT_DATE).map(function (dateType) { return ({
        value: dateType,
        text: translate("workspace.sageIntacct.exportDate.values.".concat(dateType, ".label")),
        alternateText: translate("workspace.sageIntacct.exportDate.values.".concat(dateType, ".description")),
        keyForList: dateType,
        isSelected: (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exportDate) === dateType,
    }); });
    var route = (0, native_1.useRoute)();
    var backTo = (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.sageIntacct.exportDate.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var selectExportDate = (0, react_1.useCallback)(function (row) {
        if (row.value !== (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exportDate) && policyID) {
            (0, SageIntacct_1.updateSageIntacctExportDate)(policyID, row.value, exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exportDate);
        }
        goBack();
    }, [exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exportDate, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={SageIntacctDatePage.displayName} title="workspace.sageIntacct.exportDate.label" headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExportDate(selection); }} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE], pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE); }}/>);
}
SageIntacctDatePage.displayName = 'SageIntacctDatePage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctDatePage);
