"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var RenderHTML_1 = require("@components/RenderHTML");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteImportMappingPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy, importField = _a.route.params.importField;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var netsuiteConfig = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var importMappings = (_f = netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.syncOptions) === null || _f === void 0 ? void 0 : _f.mapping;
    var importValue = (_g = importMappings === null || importMappings === void 0 ? void 0 : importMappings[importField]) !== null && _g !== void 0 ? _g : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    var listFooterContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.ph5, styles.mt3, styles.mb4]}>
                <Text_1.default>{translate("workspace.netsuite.import.importTypes.".concat(importValue, ".footerContent"), { importField: importField })}</Text_1.default>
            </react_native_1.View>); }, [importField, importValue, styles.mb4, styles.mt3, styles.ph5, translate]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.ph5, styles.pb5]}>
                <react_native_1.View style={[styles.flexRow]}>
                    <RenderHTML_1.default html={"<comment>".concat(Parser_1.default.replace(translate("workspace.netsuite.import.importFields.".concat(importField, ".subtitle"))), "</comment>")}/>
                </react_native_1.View>
            </react_native_1.View>); }, [styles.ph5, styles.pb5, styles.flexRow, translate, importField]);
    var inputOptions = [CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];
    var inputSectionData = inputOptions.map(function (inputOption) { return ({
        text: translate("workspace.netsuite.import.importTypes.".concat(inputOption, ".label")),
        keyForList: inputOption,
        isSelected: importValue === inputOption,
        value: inputOption,
        alternateText: translate("workspace.netsuite.import.importTypes.".concat(inputOption, ".description")),
    }); });
    var titleKey = "workspace.netsuite.import.importFields.".concat(importField, ".title");
    var updateImportMapping = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (value !== importValue) {
            (0, NetSuiteCommands_1.updateNetSuiteImportMapping)(policyID, importField, value, importValue);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID));
    }, [importField, importValue, policyID]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteImportMappingPage.displayName} sections={[{ data: inputSectionData }]} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} onSelectRow={function (selection) { return updateImportMapping(selection); }} initiallyFocusedOptionKey={(_h = inputSectionData.find(function (inputOption) { return inputOption.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} headerContent={listHeaderComponent} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)); }} title={titleKey} listFooterContent={listFooterContent} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([importField], netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(netsuiteConfig !== null && netsuiteConfig !== void 0 ? netsuiteConfig : {}, importField)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearNetSuiteErrorField(policyID, importField); }}/>);
}
NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportMappingPage);
