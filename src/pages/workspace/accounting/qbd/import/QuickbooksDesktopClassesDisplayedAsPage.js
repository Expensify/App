"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopClassesDisplayedAsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qbdConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop) === null || _d === void 0 ? void 0 : _d.config;
    var data = [
        {
            value: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            text: translate('workspace.common.tags'),
            alternateText: translate('workspace.qbd.tagsDisplayedAsDescription'),
            keyForList: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            isSelected: ((_e = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _e === void 0 ? void 0 : _e.classes) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
        },
        {
            value: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            text: translate('workspace.common.reportFields'),
            alternateText: translate('workspace.qbd.reportFieldsDisplayedAsDescription'),
            keyForList: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            isSelected: ((_f = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _f === void 0 ? void 0 : _f.classes) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
        },
    ];
    var selectDisplayedAs = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        if (row.value !== ((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _a === void 0 ? void 0 : _a.classes)) {
            QuickbooksDesktop.updateQuickbooksDesktopSyncClasses(policyID, row.value, (_b = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _b === void 0 ? void 0 : _b.classes);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID));
    }, [(_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _g === void 0 ? void 0 : _g.classes, policyID]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopClassesDisplayedAsPage.displayName} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID)); }} onSelectRow={selectDisplayedAs} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} title="workspace.common.displayedAs" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES); }} shouldSingleExecuteRowSelect/>);
}
QuickbooksDesktopClassesDisplayedAsPage.displayName = 'QuickbooksDesktopClassesDisplayedAsPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopClassesDisplayedAsPage);
