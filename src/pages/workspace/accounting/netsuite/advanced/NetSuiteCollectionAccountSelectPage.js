"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
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
function NetSuiteCollectionAccountSelectPage(_a) {
    var _b, _c;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var netsuiteCollectionAccountOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getNetSuiteCollectionAccountOptions)(policy !== null && policy !== void 0 ? policy : undefined, config === null || config === void 0 ? void 0 : config.collectionAccount); }, [config === null || config === void 0 ? void 0 : config.collectionAccount, policy]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = netsuiteCollectionAccountOptions === null || netsuiteCollectionAccountOptions === void 0 ? void 0 : netsuiteCollectionAccountOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [netsuiteCollectionAccountOptions]);
    var updateCollectionAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if ((config === null || config === void 0 ? void 0 : config.collectionAccount) !== value && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteCollectionAccount)(policyID, value, config === null || config === void 0 ? void 0 : config.collectionAccount);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    }, [policyID, config === null || config === void 0 ? void 0 : config.collectionAccount]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noAccountsFound')} subtitle={translate('workspace.netsuite.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.collectionsAccountDescription')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteCollectionAccountSelectPage.displayName} headerContent={headerContent} sections={netsuiteCollectionAccountOptions.length ? [{ data: netsuiteCollectionAccountOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateCollectionAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)); }} title="workspace.netsuite.advancedConfig.collectionsAccount" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={(config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) === CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT); }}/>);
}
NetSuiteCollectionAccountSelectPage.displayName = 'NetSuiteCollectionAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteCollectionAccountSelectPage);
