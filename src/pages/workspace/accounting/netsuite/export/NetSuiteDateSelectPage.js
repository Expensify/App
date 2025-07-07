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
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteDateSelectPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var route = (0, native_1.useRoute)();
    var backTo = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var config = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options.config;
    var selectedValue = (_e = Object.values(CONST_1.default.NETSUITE_EXPORT_DATE).find(function (value) { return value === (config === null || config === void 0 ? void 0 : config.exportDate); })) !== null && _e !== void 0 ? _e : CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE;
    var data = Object.values(CONST_1.default.NETSUITE_EXPORT_DATE).map(function (dateType) { return ({
        value: dateType,
        text: translate("workspace.netsuite.exportDate.values.".concat(dateType, ".label")),
        alternateText: translate("workspace.netsuite.exportDate.values.".concat(dateType, ".description")),
        keyForList: dateType,
        isSelected: selectedValue === dateType,
    }); });
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.exportDate.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)));
    }, [backTo, policyID]);
    var selectExportDate = (0, react_1.useCallback)(function (row) {
        if (row.value !== (config === null || config === void 0 ? void 0 : config.exportDate) && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteExportDate)(policyID, row.value, config === null || config === void 0 ? void 0 : config.exportDate);
        }
        goBack();
    }, [config === null || config === void 0 ? void 0 : config.exportDate, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={NetSuiteDateSelectPage.displayName} title="workspace.netsuite.exportDate.label" headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExportDate(selection); }} initiallyFocusedOptionKey={(_f = data.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE); }}/>);
}
NetSuiteDateSelectPage.displayName = 'NetSuiteDateSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteDateSelectPage);
