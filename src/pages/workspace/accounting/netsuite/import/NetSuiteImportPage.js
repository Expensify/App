"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var utils_1 = require("@pages/workspace/accounting/netsuite/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteImportPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.config;
    var subsidiaryList = ((_h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.data) !== null && _h !== void 0 ? _h : {}).subsidiaryList;
    var selectedSubsidiary = (0, react_1.useMemo)(function () { return (subsidiaryList !== null && subsidiaryList !== void 0 ? subsidiaryList : []).find(function (subsidiary) { return subsidiary.internalID === (config === null || config === void 0 ? void 0 : config.subsidiaryID); }); }, [subsidiaryList, config === null || config === void 0 ? void 0 : config.subsidiaryID]);
    return (<ConnectionLayout_1.default displayName={NetSuiteImportPage.displayName} headerTitle="workspace.accounting.import" headerSubtitle={(_j = config === null || config === void 0 ? void 0 : config.subsidiary) !== null && _j !== void 0 ? _j : ''} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE}>
            <ToggleSettingsOptionRow_1.default wrapperStyle={[styles.mv3, styles.ph5]} title={translate('workspace.netsuite.import.expenseCategories')} subtitle={translate('workspace.netsuite.import.expenseCategoriesDescription')} shouldPlaceSubtitleBelowSwitch isActive disabled switchAccessibilityLabel={translate('workspace.netsuite.import.expenseCategories')} onToggle={function () { }}/>
            {CONST_1.default.NETSUITE_CONFIG.IMPORT_FIELDS.map(function (importField) {
            var _a, _b, _c;
            return (<OfflineWithFeedback_1.default key={importField} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([importField], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                    <MenuItemWithTopDescription_1.default description={translate("workspace.netsuite.import.importFields.".concat(importField, ".title"))} title={translate("workspace.accounting.importTypes.".concat((_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _a === void 0 ? void 0 : _a.mapping) === null || _b === void 0 ? void 0 : _b[importField]) !== null && _c !== void 0 ? _c : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT))} shouldShowRightIcon onPress={function () {
                    if (!policyID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING.getRoute(policyID, importField));
                }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([importField], config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>);
        })}
            <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
        ], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                <MenuItemWithTopDescription_1.default description={translate("workspace.netsuite.import.customersOrJobs.title")} title={(0, PolicyUtils_1.getCustomersOrJobsLabelNetSuite)(policy, translate)} shouldShowRightIcon numberOfLinesTitle={2} onPress={function () {
            if (!policyID) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID));
        }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
            CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS,
        ], config === null || config === void 0 ? void 0 : config.errorFields)
            ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
            : undefined}/>
            </OfflineWithFeedback_1.default>
            {(0, PolicyUtils_1.canUseTaxNetSuite)(isBetaEnabled(CONST_1.default.BETAS.NETSUITE_USA_TAX), selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country) && (<ToggleSettingsOptionRow_1.default wrapperStyle={[styles.mv3, styles.ph5]} title={translate('common.tax')} subtitle={translate('workspace.netsuite.import.importTaxDescription')} shouldPlaceSubtitleBelowSwitch isActive={(_l = (_k = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _k === void 0 ? void 0 : _k.syncTax) !== null && _l !== void 0 ? _l : false} switchAccessibilityLabel={translate('common.tax')} onToggle={function (isEnabled) {
                if (!policyID) {
                    return;
                }
                (0, NetSuiteCommands_1.updateNetSuiteSyncTaxConfiguration)(policyID, isEnabled);
            }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX)} onCloseError={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX); }}/>)}
            {Object.values(CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS).map(function (importField) {
            var settings = (0, utils_1.getImportCustomFieldsSettings)(importField, config);
            return (<OfflineWithFeedback_1.default key={importField} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(settings, config === null || config === void 0 ? void 0 : config.pendingFields)} shouldDisableStrikeThrough>
                        <MenuItemWithTopDescription_1.default title={(0, PolicyUtils_1.getNetSuiteImportCustomFieldLabel)(policy, importField, translate)} description={translate("workspace.netsuite.import.importCustomFields.".concat(importField, ".title"))} shouldShowRightIcon onPress={function () {
                    if (!policyID) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importField));
                }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(settings, config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                    </OfflineWithFeedback_1.default>);
        })}
        </ConnectionLayout_1.default>);
}
NetSuiteImportPage.displayName = 'NetSuiteImportPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportPage);
