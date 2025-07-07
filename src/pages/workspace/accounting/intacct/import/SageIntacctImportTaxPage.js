"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctImportTaxPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var sageIntacctConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) === null || _c === void 0 ? void 0 : _c.config;
    var sageIntacctData = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.data;
    var isImportTaxEnabled = (_g = (_f = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _f === void 0 ? void 0 : _f.syncTax) !== null && _g !== void 0 ? _g : false;
    var _o = (0, useAccordionAnimation_1.default)(isImportTaxEnabled), isAccordionExpanded = _o.isAccordionExpanded, shouldAnimateAccordionSection = _o.shouldAnimateAccordionSection;
    return (<ConnectionLayout_1.default displayName={SageIntacctImportTaxPage.displayName} headerTitleAlreadyTranslated={translate('common.tax')} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)); }}>
            <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5]}>
                <Text_1.default style={[styles.textNormal]}>{translate('workspace.intacct.importTaxDescription')}</Text_1.default>
            </Text_1.default>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.intacct.importTaxDescription')} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.mv3, styles.mh5]} isActive={(_j = (_h = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _h === void 0 ? void 0 : _h.syncTax) !== null && _j !== void 0 ? _j : false} onToggle={function () { var _a; return (0, SageIntacct_1.updateSageIntacctSyncTaxConfiguration)(policyID, !((_a = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _a === void 0 ? void 0 : _a.syncTax)); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(sageIntacctConfig !== null && sageIntacctConfig !== void 0 ? sageIntacctConfig : {}, CONST_1.default.SAGE_INTACCT_CONFIG.TAX)} onCloseError={function () { return (0, SageIntacct_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.TAX); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={(_l = (_k = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _k === void 0 ? void 0 : _k.taxSolutionID) !== null && _l !== void 0 ? _l : (_m = sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs) === null || _m === void 0 ? void 0 : _m.at(0)} description={translate('workspace.sageIntacct.taxSolution')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctImportTaxPage.displayName = 'SageIntacctImportTaxPage';
exports.default = SageIntacctImportTaxPage;
