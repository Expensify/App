"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksClassesDisplayedAsPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var data = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            text: translate('workspace.common.tags'),
            keyForList: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
        },
        {
            value: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            text: translate('workspace.common.reportFields'),
            keyForList: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
        },
    ]; }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses, translate]);
    var selectDisplayedAs = (0, react_1.useCallback)(function (row) {
        if (row.value !== (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses)) {
            if (row.value === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD && !(0, PolicyUtils_1.isControlPolicy)(policy)) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.REPORT_FIELDS_FEATURE.qbo.classes, ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID)));
                return;
            }
            QuickbooksOnline.updateQuickbooksOnlineSyncClasses(policyID, row.value, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID));
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses, policyID, policy]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksClassesDisplayedAsPage.displayName} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID)); }} onSelectRow={selectDisplayedAs} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_e = data.find(function (item) { return item.isSelected; })) === null || _e === void 0 ? void 0 : _e.keyForList} title="workspace.common.displayedAs" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES); }}/>);
}
QuickbooksClassesDisplayedAsPage.displayName = 'QuickbooksClassesDisplayedAsPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksClassesDisplayedAsPage);
