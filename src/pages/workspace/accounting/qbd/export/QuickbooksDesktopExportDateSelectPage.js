"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopExportDateSelectPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var exportDate = (_d = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _d === void 0 ? void 0 : _d.exportDate;
    var route = (0, native_1.useRoute)();
    var backTo = route.params.backTo;
    var data = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.QUICKBOOKS_EXPORT_DATE).map(function (dateType) { return ({
            value: dateType,
            text: translate("workspace.qbd.exportDate.values.".concat(dateType, ".label")),
            alternateText: translate("workspace.qbd.exportDate.values.".concat(dateType, ".description")),
            keyForList: dateType,
            isSelected: exportDate === dateType,
        }); });
    }, [exportDate, translate]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID));
    }, [policyID, backTo]);
    var selectExportDate = (0, react_1.useCallback)(function (row) {
        if (!policyID) {
            return;
        }
        if (row.value !== exportDate) {
            (0, QuickbooksDesktop_1.updateQuickbooksDesktopExportDate)(policyID, row.value, exportDate);
        }
        goBack();
    }, [policyID, exportDate, goBack]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopExportDateSelectPage.displayName} sections={[{ data: data }]} listItem={RadioListItem_1.default} headerContent={<Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.qbd.exportDate.description')}</Text_1.default>} onBackButtonPress={goBack} onSelectRow={selectExportDate} initiallyFocusedOptionKey={(_e = data.find(function (mode) { return mode.isSelected; })) === null || _e === void 0 ? void 0 : _e.keyForList} title="workspace.qbd.exportDate.label" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () {
            if (!policyID) {
                return;
            }
            (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE);
        }} shouldSingleExecuteRowSelect/>);
}
QuickbooksDesktopExportDateSelectPage.displayName = 'QuickbooksDesktopExportDateSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopExportDateSelectPage);
