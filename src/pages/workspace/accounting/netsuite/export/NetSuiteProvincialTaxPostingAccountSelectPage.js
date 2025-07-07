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
function NetSuiteProvincialTaxPostingAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var subsidiaryList = ((_g = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.netsuite) === null || _e === void 0 ? void 0 : _e.options) === null || _f === void 0 ? void 0 : _f.data) !== null && _g !== void 0 ? _g : {}).subsidiaryList;
    var selectedSubsidiary = (0, react_1.useMemo)(function () { return (subsidiaryList !== null && subsidiaryList !== void 0 ? subsidiaryList : []).find(function (subsidiary) { return subsidiary.internalID === (config === null || config === void 0 ? void 0 : config.subsidiaryID); }); }, [subsidiaryList, config === null || config === void 0 ? void 0 : config.subsidiaryID]);
    var netsuiteTaxAccountOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getNetSuiteTaxAccountOptions)(policy !== null && policy !== void 0 ? policy : undefined, selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country, config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount); }, [config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount, policy, selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = netsuiteTaxAccountOptions === null || netsuiteTaxAccountOptions === void 0 ? void 0 : netsuiteTaxAccountOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [netsuiteTaxAccountOptions]);
    var updateTaxAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if ((config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount) !== value && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteProvincialTaxPostingAccount)(policyID, value, config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID));
    }, [policyID, config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noAccountsFound')} subtitle={translate('workspace.netsuite.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteProvincialTaxPostingAccountSelectPage.displayName} sections={netsuiteTaxAccountOptions.length ? [{ data: netsuiteTaxAccountOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateTaxAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)); }} title="workspace.netsuite.journalEntriesProvTaxPostingAccount" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={!!(config === null || config === void 0 ? void 0 : config.suiteTaxEnabled) || !(config === null || config === void 0 ? void 0 : config.syncOptions.syncTax) || !(0, PolicyUtils_1.canUseProvincialTaxNetSuite)(selectedSubsidiary === null || selectedSubsidiary === void 0 ? void 0 : selectedSubsidiary.country)} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT); }}/>);
}
NetSuiteProvincialTaxPostingAccountSelectPage.displayName = 'NetSuiteProvincialTaxPostingAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteProvincialTaxPostingAccountSelectPage);
