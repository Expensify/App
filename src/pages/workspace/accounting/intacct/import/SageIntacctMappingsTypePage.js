"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctMappingsTypePage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var mappingName = route.params.mapping;
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var config = ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) !== null && _d !== void 0 ? _d : {}).config;
    var _e = config !== null && config !== void 0 ? config : {}, mappings = _e.mappings, pendingFields = _e.pendingFields, exportConfig = _e.export;
    var selectionOptions = (0, react_1.useMemo)(function () {
        var mappingOptions = [];
        if (![CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS, CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS].includes(mappingName) &&
            (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable) !== CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL) {
            mappingOptions.push({
                value: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
                text: translate('workspace.intacct.employeeDefault'),
                alternateText: translate('workspace.common.appliedOnExport'),
                keyForList: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
                isSelected: (mappings === null || mappings === void 0 ? void 0 : mappings[mappingName]) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
            });
        }
        mappingOptions.push.apply(mappingOptions, [
            {
                value: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
                text: translate('workspace.common.tags'),
                alternateText: translate('workspace.common.lineItemLevel'),
                keyForList: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
                isSelected: (mappings === null || mappings === void 0 ? void 0 : mappings[mappingName]) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG,
            },
            {
                value: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
                text: translate('workspace.common.reportFields'),
                alternateText: translate('workspace.common.reportLevel'),
                keyForList: CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
                isSelected: (mappings === null || mappings === void 0 ? void 0 : mappings[mappingName]) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
            },
        ]);
        return mappingOptions;
    }, [exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable, mappingName, mappings, translate]);
    var updateMapping = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        (0, SageIntacct_1.updateSageIntacctMappingValue)(policyID, mappingName, value, mappings === null || mappings === void 0 ? void 0 : mappings[mappingName]);
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mappingName));
    }, [mappingName, policyID, mappings]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctMappingsTypePage.displayName} sections={[{ data: selectionOptions }]} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onSelectRow={updateMapping} initiallyFocusedOptionKey={mappings === null || mappings === void 0 ? void 0 : mappings[mappingName]} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mappingName)); }} title="workspace.common.displayedAs" pendingAction={(0, PolicyUtils_1.settingsPendingAction)([mappingName], pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, mappingName)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearSageIntacctErrorField(policyID, mappingName); }}/>);
}
SageIntacctMappingsTypePage.displayName = 'SageIntacctMappingsTypePage';
exports.default = SageIntacctMappingsTypePage;
