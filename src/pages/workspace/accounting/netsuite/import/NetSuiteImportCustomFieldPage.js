"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FixedFooter_1 = require("@components/FixedFooter");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var WorkspaceEmptyStateSection_1 = require("@components/WorkspaceEmptyStateSection");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function HelpLinkComponent(_a) {
    var importCustomField = _a.importCustomField, styles = _a.styles, translate = _a.translate, alignmentStyle = _a.alignmentStyle;
    return (<Text_1.default style={[styles.mb3, styles.flex1, alignmentStyle]}>
            <TextLink_1.default href={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".helpLink"))} style={[styles.link, alignmentStyle]}>
                {translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".helpLinkText"))}
            </TextLink_1.default>
            {translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".helpText"))}
        </Text_1.default>);
}
function NetSuiteImportCustomFieldPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy, importCustomField = _a.route.params.importCustomField;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var config = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var data = (_g = (_f = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _f === void 0 ? void 0 : _f[importCustomField]) !== null && _g !== void 0 ? _g : [];
    var listEmptyComponent = (0, react_1.useMemo)(function () { return (<WorkspaceEmptyStateSection_1.default shouldStyleAsCard={false} title={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".emptyTitle"))} icon={Illustrations.FolderWithPapers} subtitleComponent={<HelpLinkComponent importCustomField={importCustomField} styles={styles} translate={translate} alignmentStyle={styles.textAlignCenter}/>} containerStyle={[styles.flex1, styles.justifyContentCenter]}/>); }, [importCustomField, styles, translate]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.ph5, styles.flexRow]}>
                <HelpLinkComponent importCustomField={importCustomField} styles={styles} translate={translate} alignmentStyle={styles.textAlignLeft}/>
            </react_native_1.View>); }, [styles, importCustomField, translate]);
    return (<ConnectionLayout_1.default displayName={NetSuiteImportCustomFieldPage.displayName} headerTitle={"workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".title")} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)); }}>
            {data.length === 0 ? listEmptyComponent : listHeaderComponent}
            {data.map(function (record, index) { return (<OfflineWithFeedback_1.default 
        // eslint-disable-next-line react/no-array-index-key
        key={"".concat(record.internalID, "-").concat(index)} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(["".concat(importCustomField, "_").concat(index)], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                    <MenuItemWithTopDescription_1.default description={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".recordTitle"))} shouldShowRightIcon title={'listName' in record ? record.listName : record.segmentName} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, index)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(["".concat(importCustomField, "_").concat(index)], config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}

            <FixedFooter_1.default style={[styles.mtAuto, styles.pt3]}>
                <Button_1.default success large isDisabled={!!((_h = config === null || config === void 0 ? void 0 : config.pendingFields) === null || _h === void 0 ? void 0 : _h[importCustomField])} onPress={function () {
            if (importCustomField === CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS) {
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.getRoute(policyID));
            }
            else {
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute(policyID));
            }
        }} text={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".addText"))}/>
            </FixedFooter_1.default>
        </ConnectionLayout_1.default>);
}
NetSuiteImportCustomFieldPage.displayName = 'NetSuiteImportCustomFieldPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportCustomFieldPage);
