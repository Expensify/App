"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useExpensifyCardFeeds_1 = require("@hooks/useExpensifyCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccountingUtils_1 = require("@libs/AccountingUtils");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function CardReconciliationPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policy = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var allCardSettings = (0, useExpensifyCardFeeds_1.default)(policyID);
    var fullySetUpCardSetting = (0, react_1.useMemo)(function () {
        var entries = Object.entries(allCardSettings !== null && allCardSettings !== void 0 ? allCardSettings : {});
        var initialValue = {
            key: '',
            cardSetting: {
                monthlySettlementDate: new Date(),
                isMonthlySettlementAllowed: false,
                paymentBankAccountID: CONST_1.default.DEFAULT_NUMBER_ID,
            },
        };
        return entries.reduce(function (acc, _a) {
            var key = _a[0], cardSetting = _a[1];
            if (cardSetting && (0, CardUtils_1.isExpensifyCardFullySetUp)(policy, cardSetting)) {
                return {
                    key: key,
                    cardSetting: cardSetting,
                };
            }
            return acc;
        }, initialValue);
    }, [allCardSettings, policy]);
    var domainID = fullySetUpCardSetting.key.split('_').at(-1);
    var effectiveDomainID = Number(domainID !== null && domainID !== void 0 ? domainID : workspaceAccountID);
    var isContinuousReconciliationOn = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION).concat(effectiveDomainID), { canBeMissing: true })[0];
    var currentConnectionName = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION).concat(effectiveDomainID), { canBeMissing: true })[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0];
    var paymentBankAccountID = (_d = (_c = fullySetUpCardSetting.cardSetting) === null || _c === void 0 ? void 0 : _c.paymentBankAccountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID;
    var bankAccountTitle = (_f = (_e = bankAccountList === null || bankAccountList === void 0 ? void 0 : bankAccountList[paymentBankAccountID]) === null || _e === void 0 ? void 0 : _e.title) !== null && _f !== void 0 ? _f : '';
    var connection = route.params.connection;
    var connectionName = (0, AccountingUtils_1.getConnectionNameFromRouteParam)(connection);
    var autoSync = !!((_k = (_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g[connectionName]) === null || _h === void 0 ? void 0 : _h.config) === null || _j === void 0 ? void 0 : _j.autoSync) === null || _k === void 0 ? void 0 : _k.enabled);
    var shouldShow = !!((_l = fullySetUpCardSetting.cardSetting) === null || _l === void 0 ? void 0 : _l.paymentBankAccountID);
    var handleToggleContinuousReconciliation = function (value) {
        (0, Card_1.toggleContinuousReconciliation)(effectiveDomainID, value, connectionName, currentConnectionName);
        if (value) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection));
        }
    };
    var navigateToAdvancedSettings = (0, react_1.useCallback)(function () {
        switch (connection) {
            case CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBO:
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID, Navigation_1.default.getActiveRoute()));
                break;
            case CONST_1.default.POLICY.CONNECTIONS.ROUTE.XERO:
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
                break;
            case CONST_1.default.POLICY.CONNECTIONS.ROUTE.NETSUITE:
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.getRoute(policyID, Navigation_1.default.getActiveRoute()));
                break;
            case CONST_1.default.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT:
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
                break;
            default:
                break;
        }
    }, [connection, policyID]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} shouldBeBlocked={!shouldShow}>
            <ScreenWrapper_1.default shouldEnableMaxHeight testID={CardReconciliationPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.accounting.cardReconciliation')}/>
                <ScrollView_1.default contentContainerStyle={styles.pb5} addBottomSafeAreaPadding>
                    <ToggleSettingsOptionRow_1.default key={translate('workspace.accounting.continuousReconciliation')} title={translate('workspace.accounting.continuousReconciliation')} subtitle={translate('workspace.accounting.saveHoursOnReconciliation')} shouldPlaceSubtitleBelowSwitch switchAccessibilityLabel={translate('workspace.accounting.continuousReconciliation')} disabled={!autoSync} isActive={!!isContinuousReconciliationOn} onToggle={handleToggleContinuousReconciliation} wrapperStyle={styles.ph5}/>
                    {!autoSync && (<Text_1.default style={[styles.mutedNormalTextLabel, styles.ph5, styles.mt2]}>
                            {translate('workspace.accounting.enableContinuousReconciliation')}
                            <TextLink_1.default style={styles.fontSizeLabel} onPress={navigateToAdvancedSettings}>
                                {translate('workspace.accounting.autoSync').toLowerCase()}
                            </TextLink_1.default>{' '}
                            {translate('common.conjunctionFor')} {CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}
                        </Text_1.default>)}
                    {!!paymentBankAccountID && !!isContinuousReconciliationOn && (<MenuItemWithTopDescription_1.default style={styles.mt5} title={bankAccountTitle} description={translate('workspace.accounting.reconciliationAccount')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection)); }}/>)}
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CardReconciliationPage.displayName = 'CardReconciliationPage';
exports.default = (0, withPolicyConnections_1.default)(CardReconciliationPage);
