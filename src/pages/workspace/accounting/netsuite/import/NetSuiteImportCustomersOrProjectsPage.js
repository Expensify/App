"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var RenderHTML_1 = require("@components/RenderHTML");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteImportCustomersOrProjectsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var policy = _a.policy;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var config = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var importMappings = (_f = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _f === void 0 ? void 0 : _f.mapping;
    var importCustomer = (_g = importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers) !== null && _g !== void 0 ? _g : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var importJobs = (_h = importMappings === null || importMappings === void 0 ? void 0 : importMappings.jobs) !== null && _h !== void 0 ? _h : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var importedValue = (importMappings === null || importMappings === void 0 ? void 0 : importMappings.customers) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;
    var _t = (0, useAccordionAnimation_1.default)(importedValue !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT), isAccordionExpanded = _t.isAccordionExpanded, shouldAnimateAccordionSection = _t.shouldAnimateAccordionSection;
    var updateMapping = (0, react_1.useCallback)(function (importField, isEnabled) {
        var _a, _b, _c;
        var newValue;
        if (!isEnabled) {
            // if the import is off, then we send default as the value for mapping
            newValue = CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
        }
        else {
            // when we enable any field, and if the other one already has a value set, we should set that,
            var otherFieldValue = importField === CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS ? importCustomer : importJobs;
            if (otherFieldValue === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
                // fallback to Tag
                newValue = CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG;
            }
            else {
                newValue = otherFieldValue;
            }
        }
        if (newValue) {
            (0, NetSuiteCommands_1.updateNetSuiteImportMapping)(policyID, importField, newValue, (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _a === void 0 ? void 0 : _a.mapping) === null || _b === void 0 ? void 0 : _b[importField]) !== null && _c !== void 0 ? _c : null);
        }
    }, [(_j = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _j === void 0 ? void 0 : _j.mapping, policyID, importCustomer, importJobs]);
    return (<ConnectionLayout_1.default displayName={NetSuiteImportCustomersOrProjectsPage.displayName} headerTitle="workspace.netsuite.import.customersOrJobs.title" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)); }}>
            <react_native_1.View style={[styles.ph5, styles.flexRow, styles.pb5]}>
                <RenderHTML_1.default html={"<comment>".concat(Parser_1.default.replace(translate("workspace.netsuite.import.customersOrJobs.subtitle")), "</comment>")}/>
            </react_native_1.View>

            <ToggleSettingsOptionRow_1.default wrapperStyle={[styles.mv3, styles.ph5]} title={translate('workspace.netsuite.import.customersOrJobs.importCustomers')} isActive={((_m = (_l = (_k = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _k === void 0 ? void 0 : _k.mapping) === null || _l === void 0 ? void 0 : _l.customers) !== null && _m !== void 0 ? _m : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT} switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importCustomers')} onToggle={function (isEnabled) {
            updateMapping(CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, isEnabled);
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS)} onCloseError={function () { return Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS); }}/>
            <ToggleSettingsOptionRow_1.default wrapperStyle={[styles.mv3, styles.ph5]} title={translate('workspace.netsuite.import.customersOrJobs.importJobs')} isActive={((_q = (_p = (_o = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _o === void 0 ? void 0 : _o.mapping) === null || _p === void 0 ? void 0 : _p.jobs) !== null && _q !== void 0 ? _q : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT} switchAccessibilityLabel={translate('workspace.netsuite.import.customersOrJobs.importJobs')} onToggle={function (isEnabled) {
            updateMapping(CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS, isEnabled);
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS)} onCloseError={function () { return Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <ToggleSettingsOptionRow_1.default wrapperStyle={[styles.mv3, styles.ph5]} title={translate('workspace.netsuite.import.crossSubsidiaryCustomers')} isActive={(_s = (_r = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _r === void 0 ? void 0 : _r.crossSubsidiaryCustomers) !== null && _s !== void 0 ? _s : false} switchAccessibilityLabel={translate('workspace.netsuite.import.crossSubsidiaryCustomers')} onToggle={function (isEnabled) {
            (0, NetSuiteCommands_1.updateNetSuiteCrossSubsidiaryCustomersConfiguration)(policyID, isEnabled);
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)} onCloseError={function () { return Policy.clearNetSuiteErrorField(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS); }}/>

                <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                    <MenuItemWithTopDescription_1.default description={translate('workspace.common.displayedAs')} title={translate("workspace.netsuite.import.importTypes.".concat(importedValue, ".label"))} shouldShowRightIcon onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT.getRoute(policyID));
        }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS], config === null || config === void 0 ? void 0 : config.errorFields)
            ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
            : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
NetSuiteImportCustomersOrProjectsPage.displayName = 'NetSuiteImportCustomersOrProjectsPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportCustomersOrProjectsPage);
