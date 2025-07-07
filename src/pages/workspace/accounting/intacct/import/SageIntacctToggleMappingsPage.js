"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function getDisplayTypeTranslationKeys(displayType) {
    switch (displayType) {
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT: {
            return { titleKey: 'workspace.intacct.employeeDefault', descriptionKey: 'workspace.intacct.employeeDefaultDescription' };
        }
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG: {
            return { titleKey: 'workspace.common.tags', descriptionKey: 'workspace.intacct.displayedAsTagDescription' };
        }
        case CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD: {
            return { titleKey: 'workspace.common.reportFields', descriptionKey: 'workspace.intacct.displayedAsReportFieldDescription' };
        }
        default: {
            return undefined;
        }
    }
}
function SageIntacctToggleMappingsPage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var mappingName = route.params.mapping;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var config = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config;
    var isImportMappingEnable = ((_e = config === null || config === void 0 ? void 0 : config.mappings) === null || _e === void 0 ? void 0 : _e[mappingName]) !== CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.NONE;
    var isAccordionExpanded = (0, react_native_reanimated_1.useSharedValue)(isImportMappingEnable);
    var shouldAnimateAccordionSection = (0, react_native_reanimated_1.useSharedValue)(false);
    // We are storing translation keys in the local state for animation purposes.
    // Otherwise, the values change to undefined immediately after clicking, before the closing animation finishes,
    // resulting in a janky animation effect.
    var _f = (0, react_1.useState)(undefined), translationKeys = _f[0], setTranslationKey = _f[1];
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isImportMappingEnable) {
            return;
        }
        setTranslationKey(getDisplayTypeTranslationKeys((_a = config === null || config === void 0 ? void 0 : config.mappings) === null || _a === void 0 ? void 0 : _a[mappingName]));
    }, [isImportMappingEnable, config === null || config === void 0 ? void 0 : config.mappings, mappingName]);
    return (<ConnectionLayout_1.default displayName={SageIntacctToggleMappingsPage.displayName} headerTitleAlreadyTranslated={expensify_common_1.Str.recapitalize(translate('workspace.intacct.mappingTitle', { mappingName: mappingName }))} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)); }}>
            <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5]}>
                <Text_1.default style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleFirstPart')}</Text_1.default>
                <Text_1.default style={[styles.textStrong]}>{translate('workspace.intacct.mappingTitle', { mappingName: mappingName })}</Text_1.default>
                <Text_1.default style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleSecondPart')}</Text_1.default>
            </Text_1.default>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={"".concat(translate('workspace.accounting.import'), " ").concat(translate('workspace.intacct.mappingTitle', { mappingName: mappingName }))} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.mv3, styles.mh5]} isActive={isImportMappingEnable} onToggle={function (enabled) {
            var _a;
            var mappingValue = enabled ? CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG : CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.NONE;
            (0, SageIntacct_1.updateSageIntacctMappingValue)(policyID, mappingName, mappingValue, (_a = config === null || config === void 0 ? void 0 : config.mappings) === null || _a === void 0 ? void 0 : _a[mappingName]);
            isAccordionExpanded.set(enabled);
            shouldAnimateAccordionSection.set(true);
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([mappingName], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, mappingName)} onCloseError={function () { return (0, SageIntacct_1.clearSageIntacctErrorField)(policyID, mappingName); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([mappingName], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={(translationKeys === null || translationKeys === void 0 ? void 0 : translationKeys.titleKey) ? translate(translationKeys === null || translationKeys === void 0 ? void 0 : translationKeys.titleKey) : undefined} description={translate('workspace.common.displayedAs')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.getRoute(policyID, mappingName)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([mappingName], config === null || config === void 0 ? void 0 : config.errorFields) ? 'error' : undefined} hintText={(translationKeys === null || translationKeys === void 0 ? void 0 : translationKeys.descriptionKey) ? translate(translationKeys === null || translationKeys === void 0 ? void 0 : translationKeys.descriptionKey) : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctToggleMappingsPage.displayName = 'SageIntacctToggleMappingsPage';
exports.default = SageIntacctToggleMappingsPage;
