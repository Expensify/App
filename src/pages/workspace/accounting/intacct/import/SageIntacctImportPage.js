"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function getDisplayTypeTranslationKey(displayType) {
    switch (displayType) {
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT: {
            return 'workspace.intacct.employeeDefault';
        }
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG: {
            return 'workspace.accounting.importTypes.TAG';
        }
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD: {
            return 'workspace.accounting.importTypes.REPORT_FIELD';
        }
        default: {
            return 'workspace.accounting.notImported';
        }
    }
}
var checkForUserDimensionWithError = function (config) { var _a, _b; return (_b = (_a = config === null || config === void 0 ? void 0 : config.mappings) === null || _a === void 0 ? void 0 : _a.dimensions) === null || _b === void 0 ? void 0 : _b.some(function (dimension) { var _a; return !!((_a = config === null || config === void 0 ? void 0 : config.errorFields) === null || _a === void 0 ? void 0 : _a["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimension.dimension)]); }); };
var checkForUserDimensionWithPendingAction = function (config) { var _a, _b; return (_b = (_a = config === null || config === void 0 ? void 0 : config.mappings) === null || _a === void 0 ? void 0 : _a.dimensions) === null || _b === void 0 ? void 0 : _b.some(function (dimension) { var _a; return !!((_a = config === null || config === void 0 ? void 0 : config.pendingFields) === null || _a === void 0 ? void 0 : _a["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimension.dimension)]); }); };
function SageIntacctImportPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var sageIntacctConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) === null || _c === void 0 ? void 0 : _c.config;
    var sageIntacctData = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.data;
    var mappingItems = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS).map(function (mapping) {
            var _a;
            var menuItemTitleKey = getDisplayTypeTranslationKey((_a = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _a === void 0 ? void 0 : _a[mapping]);
            return {
                description: expensify_common_1.Str.recapitalize(translate('workspace.intacct.mappingTitle', { mappingName: mapping })),
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping)); },
                title: menuItemTitleKey ? translate(menuItemTitleKey) : undefined,
                subscribedSettings: [mapping],
            };
        });
    }, [policyID, sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings, translate]);
    var isExpenseType = (sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.export.reimbursable) === CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT;
    return (<ConnectionLayout_1.default displayName={SageIntacctImportPage.displayName} headerTitle="workspace.accounting.import" headerSubtitle={(0, PolicyUtils_1.getCurrentSageIntacctEntityName)(policy, translate('workspace.common.topLevel'))} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}>
            <ToggleSettingsOptionRow_1.default title={translate(isExpenseType ? 'workspace.intacct.expenseTypes' : 'workspace.accounting.accounts')} subtitle={translate(isExpenseType ? 'workspace.intacct.expenseTypesDescription' : 'workspace.intacct.accountTypesDescription')} switchAccessibilityLabel={translate(isExpenseType ? 'workspace.intacct.expenseTypesDescription' : 'workspace.intacct.accountTypesDescription')} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.mv3, styles.mh5]} isActive onToggle={function () { }} disabled/>
            <ToggleSettingsOptionRow_1.default title={translate('common.billable')} switchAccessibilityLabel={translate('common.billable')} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.mv3, styles.mh5]} isActive={(_g = (_f = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _f === void 0 ? void 0 : _f.syncItems) !== null && _g !== void 0 ? _g : false} onToggle={function () { var _a; return (0, SageIntacct_1.updateSageIntacctBillable)(policyID, !((_a = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _a === void 0 ? void 0 : _a.syncItems)); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_ITEMS], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(sageIntacctConfig !== null && sageIntacctConfig !== void 0 ? sageIntacctConfig : {}, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_ITEMS)} onCloseError={function () { return (0, SageIntacct_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_ITEMS); }}/>

            {mappingItems.map(function (section) { return (<OfflineWithFeedback_1.default key={section.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(section.subscribedSettings, sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} shouldShowRightIcon onPress={section.action} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(section.subscribedSettings, sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}

            {!!(sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs) && ((_h = sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs) === null || _h === void 0 ? void 0 : _h.length) > 0 && (<OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={((_j = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _j === void 0 ? void 0 : _j.syncTax) ? ((_k = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _k === void 0 ? void 0 : _k.taxSolutionID) || ((_l = sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs) === null || _l === void 0 ? void 0 : _l.at(0)) : translate('workspace.accounting.notImported')} description={translate('common.tax')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.errorFields)
                ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                : undefined}/>
                </OfflineWithFeedback_1.default>)}

            <OfflineWithFeedback_1.default pendingAction={checkForUserDimensionWithPendingAction(sageIntacctConfig) ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}>
                <MenuItemWithTopDescription_1.default title={((_m = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _m === void 0 ? void 0 : _m.dimensions) && ((_p = (_o = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _o === void 0 ? void 0 : _o.dimensions) === null || _p === void 0 ? void 0 : _p.length) > 0
            ? translate('workspace.intacct.userDimensionsAdded', { count: (_r = (_q = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.mappings) === null || _q === void 0 ? void 0 : _q.dimensions) === null || _r === void 0 ? void 0 : _r.length })
            : undefined} description={translate('workspace.intacct.userDefinedDimensions')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID)); }} brickRoadIndicator={checkForUserDimensionWithError(sageIntacctConfig) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
            </OfflineWithFeedback_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctImportPage.displayName = 'SageIntacctImportPage';
exports.default = (0, withPolicy_1.default)(SageIntacctImportPage);
