"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteInvoiceItemSelectPage(_a) {
    var _b, _c;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var netsuiteInvoiceItemOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getNetSuiteInvoiceItemOptions)(policy !== null && policy !== void 0 ? policy : undefined, config === null || config === void 0 ? void 0 : config.invoiceItem); }, [config === null || config === void 0 ? void 0 : config.invoiceItem, policy]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = netsuiteInvoiceItemOptions === null || netsuiteInvoiceItemOptions === void 0 ? void 0 : netsuiteInvoiceItemOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [netsuiteInvoiceItemOptions]);
    var updateInvoiceItem = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if ((config === null || config === void 0 ? void 0 : config.invoiceItem) !== value && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteInvoiceItem)(policyID, value, config === null || config === void 0 ? void 0 : config.invoiceItem);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID));
    }, [policyID, config === null || config === void 0 ? void 0 : config.invoiceItem]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noItemsFound')} subtitle={translate('workspace.netsuite.noItemsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteInvoiceItemSelectPage.displayName} sections={netsuiteInvoiceItemOptions.length ? [{ data: netsuiteInvoiceItemOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateInvoiceItem} initiallyFocusedOptionKey={initiallyFocusedOptionKey} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID)); }} title="workspace.netsuite.invoiceItem.label" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={(config === null || config === void 0 ? void 0 : config.invoiceItemPreference) !== CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM); }}/>);
}
NetSuiteInvoiceItemSelectPage.displayName = 'NetSuiteInvoiceItemSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteInvoiceItemSelectPage);
