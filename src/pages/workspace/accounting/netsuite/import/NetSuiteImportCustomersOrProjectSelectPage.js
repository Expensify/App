"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteImportCustomersOrProjectSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var netsuiteConfig = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var importMappings = (_f = netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.syncOptions) === null || _f === void 0 ? void 0 : _f.mapping;
    var importCustomer = (_g = importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers) !== null && _g !== void 0 ? _g : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var importJobs = (_h = importMappings === null || importMappings === void 0 ? void 0 : importMappings.jobs) !== null && _h !== void 0 ? _h : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var importedValue = (importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;
    var inputOptions = [CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];
    var inputSectionData = inputOptions.map(function (inputOption) { return ({
        text: translate("workspace.netsuite.import.importTypes.".concat(inputOption, ".label")),
        keyForList: inputOption,
        isSelected: importedValue === inputOption,
        value: inputOption,
        alternateText: translate("workspace.netsuite.import.importTypes.".concat(inputOption, ".description")),
    }); });
    var updateImportMapping = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (value !== importedValue) {
            (0, NetSuiteCommands_1.updateNetSuiteCustomersJobsMapping)(policyID, {
                customersMapping: importCustomer !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? value : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
                jobsMapping: importJobs !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? value : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
            }, {
                customersMapping: importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers,
                jobsMapping: importMappings === null || importMappings === void 0 ? void 0 : importMappings.jobs,
            });
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID));
    }, [importCustomer, importJobs, importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers, importMappings === null || importMappings === void 0 ? void 0 : importMappings.jobs, importedValue, policyID]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteImportCustomersOrProjectSelectPage.displayName} sections={[{ data: inputSectionData }]} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onSelectRow={function (selection) { return updateImportMapping(selection); }} initiallyFocusedOptionKey={(_j = inputSectionData.find(function (inputOption) { return inputOption.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID)); }} title="workspace.common.displayedAs" errors={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS], netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.errorFields)
            ? ErrorUtils.getLatestErrorField(netsuiteConfig !== null && netsuiteConfig !== void 0 ? netsuiteConfig : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS)
            : ErrorUtils.getLatestErrorField(netsuiteConfig !== null && netsuiteConfig !== void 0 ? netsuiteConfig : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS)} errorRowStyles={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS], netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.pendingFields)} onClose={function () {
            Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS);
            Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS);
        }}/>);
}
NetSuiteImportCustomersOrProjectSelectPage.displayName = 'NetSuiteImportCustomersOrProjectSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportCustomersOrProjectSelectPage);
