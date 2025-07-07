"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteInvoiceItemPreferenceSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite.options.config;
    var route = (0, native_1.useRoute)();
    var items = ((_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options.data) !== null && _e !== void 0 ? _e : {}).items;
    var selectedItem = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedInvoiceItemWithDefaultSelect)(items, config === null || config === void 0 ? void 0 : config.invoiceItem); }, [items, config === null || config === void 0 ? void 0 : config.invoiceItem]);
    var selectedValue = (_f = Object.values(CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE).find(function (value) { return value === (config === null || config === void 0 ? void 0 : config.invoiceItemPreference); })) !== null && _f !== void 0 ? _f : CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE;
    var data = Object.values(CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE).map(function (postingPreference) { return ({
        value: postingPreference,
        text: translate("workspace.netsuite.invoiceItem.values.".concat(postingPreference, ".label")),
        keyForList: postingPreference,
        isSelected: selectedValue === postingPreference,
    }); });
    var goBack = (0, react_1.useCallback)(function () {
        var _a;
        Navigation_1.default.goBack((_a = route.params.backTo) !== null && _a !== void 0 ? _a : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)));
    }, [route.params.backTo, policyID]);
    var selectInvoicePreference = (0, react_1.useCallback)(function (row) {
        if (row.value !== (config === null || config === void 0 ? void 0 : config.invoiceItemPreference) && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteInvoiceItemPreference)(policyID, row.value, config === null || config === void 0 ? void 0 : config.invoiceItemPreference);
        }
        if (row.value === CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
            goBack();
        }
    }, [config === null || config === void 0 ? void 0 : config.invoiceItemPreference, policyID, goBack]);
    return (<ConnectionLayout_1.default headerTitle="workspace.netsuite.invoiceItem.label" title={"workspace.netsuite.invoiceItem.values.".concat((_g = config === null || config === void 0 ? void 0 : config.invoiceItemPreference) !== null && _g !== void 0 ? _g : CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE, ".description")} titleStyle={[styles.ph5, styles.pb5]} onBackButtonPress={goBack} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteInvoiceItemPreferenceSelectPage.displayName} policyID={policyID} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldUseScrollView={false}>
            <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE); }} style={[styles.flexGrow1, styles.flexShrink1]} contentContainerStyle={[styles.flexGrow1, styles.flexShrink1]}>
                <SelectionList_1.default onSelectRow={function (selection) { return selectInvoicePreference(selection); }} sections={[{ data: data }]} ListItem={RadioListItem_1.default} showScrollIndicator shouldUpdateFocusedIndex initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} containerStyle={[styles.flexReset, styles.flexGrow1, styles.flexShrink1, styles.pb0]}/>
            </OfflineWithFeedback_1.default>
            {(config === null || config === void 0 ? void 0 : config.invoiceItemPreference) === CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT && (<react_native_1.View style={[styles.flexGrow1, styles.flexShrink1]}>
                    <OfflineWithFeedback_1.default key={translate('workspace.netsuite.invoiceItem.label')} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM], config === null || config === void 0 ? void 0 : config.pendingFields)}>
                        <MenuItemWithTopDescription_1.default description={translate('workspace.netsuite.invoiceItem.label')} title={selectedItem ? selectedItem.name : undefined} interactive shouldShowRightIcon onPress={function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.getRoute(policyID));
            }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM], config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                    </OfflineWithFeedback_1.default>
                </react_native_1.View>)}
        </ConnectionLayout_1.default>);
}
NetSuiteInvoiceItemPreferenceSelectPage.displayName = 'NetSuiteInvoiceItemPreferenceSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteInvoiceItemPreferenceSelectPage);
