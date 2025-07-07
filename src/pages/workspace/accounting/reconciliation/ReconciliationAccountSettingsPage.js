"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccountingUtils_1 = require("@libs/AccountingUtils");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ReconciliationAccountSettingsPage(_a) {
    var _b;
    var route = _a.route;
    var _c = route.params, policyID = _c.policyID, connection = _c.connection;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var connectionName = (0, AccountingUtils_1.getConnectionNameFromRouteParam)(connection);
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(defaultFundID))[0];
    var paymentBankAccountID = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID;
    var selectedBankAccount = (0, react_1.useMemo)(function () { var _a; return bankAccountList === null || bankAccountList === void 0 ? void 0 : bankAccountList[(_a = paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString()) !== null && _a !== void 0 ? _a : '']; }, [paymentBankAccountID, bankAccountList]);
    var bankAccountNumber = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = selectedBankAccount === null || selectedBankAccount === void 0 ? void 0 : selectedBankAccount.accountData) === null || _a === void 0 ? void 0 : _a.accountNumber) !== null && _b !== void 0 ? _b : ''; }, [selectedBankAccount]);
    var settlementAccountEnding = (0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber);
    var domainName = (_b = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.domainName) !== null && _b !== void 0 ? _b : (0, PolicyUtils_1.getDomainNameForPolicy)(policyID);
    var sections = (0, react_1.useMemo)(function () {
        if (!bankAccountList || (0, EmptyObject_1.isEmptyObject)(bankAccountList)) {
            return [];
        }
        var eligibleBankAccounts = (0, CardUtils_1.getEligibleBankAccountsForCard)(bankAccountList);
        var data = eligibleBankAccounts.map(function (bankAccount) {
            var _a, _b, _c, _d;
            return ({
                text: bankAccount.title,
                value: (_a = bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.bankAccountID,
                keyForList: (_c = (_b = bankAccount.accountData) === null || _b === void 0 ? void 0 : _b.bankAccountID) === null || _c === void 0 ? void 0 : _c.toString(),
                isSelected: ((_d = bankAccount.accountData) === null || _d === void 0 ? void 0 : _d.bankAccountID) === paymentBankAccountID,
            });
        });
        return [{ data: data }];
    }, [bankAccountList, paymentBankAccountID]);
    var selectBankAccount = function (newBankAccountID) {
        (0, Card_1.updateSettlementAccount)(domainName, defaultFundID, policyID, newBankAccountID, paymentBankAccountID);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection));
    };
    return (<ConnectionLayout_1.default displayName={ReconciliationAccountSettingsPage.displayName} headerTitle="workspace.accounting.reconciliationAccount" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1, styles.pb2]} connectionName={connectionName} shouldUseScrollView={false} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection)); }}>
            <Text_1.default style={[styles.textNormal, styles.mb5, styles.ph5]}>{translate('workspace.accounting.chooseReconciliationAccount.chooseBankAccount')}</Text_1.default>
            <Text_1.default style={[styles.textNormal, styles.mb6, styles.ph5]}>
                {translate('workspace.accounting.chooseReconciliationAccount.accountMatches')}
                <TextLink_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID, Navigation_1.default.getActiveRoute())); }}>
                    {translate('workspace.accounting.chooseReconciliationAccount.settlementAccount')}
                </TextLink_1.default>
                {translate('workspace.accounting.chooseReconciliationAccount.reconciliationWorks', { lastFourPAN: settlementAccountEnding })}
            </Text_1.default>

            <SelectionList_1.default sections={sections} onSelectRow={function (_a) {
        var value = _a.value;
        return selectBankAccount(value);
    }} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString()}/>
        </ConnectionLayout_1.default>);
}
ReconciliationAccountSettingsPage.displayName = 'ReconciliationAccountSettingsPage';
exports.default = ReconciliationAccountSettingsPage;
