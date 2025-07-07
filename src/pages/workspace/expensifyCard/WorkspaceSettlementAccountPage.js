"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var BankIcons_1 = require("@components/Icon/BankIcons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
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
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceSettlementAccountPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var bankAccountsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0];
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(defaultFundID), { canBeMissing: true })[0];
    var isUsingContinuousReconciliation = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION).concat(defaultFundID), { canBeMissing: true })[0];
    var reconciliationConnection = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION).concat(defaultFundID), { canBeMissing: true })[0];
    var connectionName = reconciliationConnection !== null && reconciliationConnection !== void 0 ? reconciliationConnection : '';
    var connectionParam = (0, AccountingUtils_1.getRouteParamForConnection)(connectionName);
    var paymentBankAccountID = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID;
    var paymentBankAccountNumberFromCardSettings = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountNumber;
    var paymentBankAccountAddressName = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountAddressName;
    var paymentBankAccountNumber = (_g = (_f = (_e = (_d = bankAccountsList === null || bankAccountsList === void 0 ? void 0 : bankAccountsList[(_c = paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString()) !== null && _c !== void 0 ? _c : '']) === null || _d === void 0 ? void 0 : _d.accountData) === null || _e === void 0 ? void 0 : _e.accountNumber) !== null && _f !== void 0 ? _f : paymentBankAccountNumberFromCardSettings) !== null && _g !== void 0 ? _g : '';
    var eligibleBankAccounts = (0, CardUtils_1.getEligibleBankAccountsForCard)(bankAccountsList !== null && bankAccountsList !== void 0 ? bankAccountsList : {});
    var domainName = (_h = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.domainName) !== null && _h !== void 0 ? _h : (0, PolicyUtils_1.getDomainNameForPolicy)(policyID);
    var data = (0, react_1.useMemo)(function () {
        var options = eligibleBankAccounts.map(function (bankAccount) {
            var _a, _b, _c, _d, _e, _f;
            var bankName = ((_b = (_a = bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.addressName) !== null && _b !== void 0 ? _b : '');
            var bankAccountNumber = (_d = (_c = bankAccount.accountData) === null || _c === void 0 ? void 0 : _c.accountNumber) !== null && _d !== void 0 ? _d : '';
            var bankAccountID = (_f = (_e = bankAccount.accountData) === null || _e === void 0 ? void 0 : _e.bankAccountID) !== null && _f !== void 0 ? _f : bankAccount.methodID;
            var _g = (0, BankIcons_1.default)({ bankName: bankName, styles: styles }), icon = _g.icon, iconSize = _g.iconSize, iconStyles = _g.iconStyles;
            return {
                value: bankAccountID,
                text: bankAccount.title,
                leftElement: !!icon && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon_1.default src={icon} width={iconSize} height={iconSize} additionalStyles={iconStyles}/>
                    </react_native_1.View>),
                alternateText: "".concat(translate('workspace.expensifyCard.accountEndingIn'), " ").concat((0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber)),
                keyForList: bankAccountID === null || bankAccountID === void 0 ? void 0 : bankAccountID.toString(),
                isSelected: bankAccountID === paymentBankAccountID,
            };
        });
        if (options.length === 0) {
            var bankName = (paymentBankAccountAddressName !== null && paymentBankAccountAddressName !== void 0 ? paymentBankAccountAddressName : '');
            var bankAccountNumber = paymentBankAccountNumberFromCardSettings !== null && paymentBankAccountNumberFromCardSettings !== void 0 ? paymentBankAccountNumberFromCardSettings : '';
            var _a = (0, BankIcons_1.default)({ bankName: bankName, styles: styles }), icon = _a.icon, iconSize = _a.iconSize, iconStyles = _a.iconStyles;
            options.push({
                value: paymentBankAccountID,
                text: paymentBankAccountAddressName,
                leftElement: (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon_1.default src={icon} width={iconSize} height={iconSize} additionalStyles={iconStyles}/>
                    </react_native_1.View>),
                alternateText: "".concat(translate('workspace.expensifyCard.accountEndingIn'), " ").concat((0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber)),
                keyForList: paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString(),
                isSelected: true,
            });
        }
        return options;
    }, [eligibleBankAccounts, paymentBankAccountAddressName, paymentBankAccountID, paymentBankAccountNumberFromCardSettings, styles, translate]);
    var updateSettlementAccount = function (value) {
        (0, Card_1.updateSettlementAccount)(domainName, defaultFundID, policyID, value, paymentBankAccountID);
        Navigation_1.default.goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceSettlementAccountPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.expensifyCard.settlementAccount')} onBackButtonPress={function () {
            var _a;
            if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) {
                Navigation_1.default.goBack(route.params.backTo);
                return;
            }
            Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID));
        }}/>
                <SelectionList_1.default addBottomSafeAreaPadding sections={[{ data: data }]} ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return updateSettlementAccount(value !== null && value !== void 0 ? value : 0);
    }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={paymentBankAccountID === null || paymentBankAccountID === void 0 ? void 0 : paymentBankAccountID.toString()} listHeaderContent={<>
                            <Text_1.default style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text_1.default>
                            {!!isUsingContinuousReconciliation && (<Text_1.default style={[styles.mh5, styles.mb6]}>
                                    <Text_1.default>{translate('workspace.expensifyCard.settlementAccountInfoPt1')}</Text_1.default>{' '}
                                    <TextLink_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connectionParam)); }}>
                                        {translate('workspace.expensifyCard.reconciliationAccount')}
                                    </TextLink_1.default>{' '}
                                    <Text_1.default>{"(".concat(CONST_1.default.MASKED_PAN_PREFIX).concat((0, BankAccountUtils_1.getLastFourDigits)(paymentBankAccountNumber), ") ")}</Text_1.default>
                                    <Text_1.default>{translate('workspace.expensifyCard.settlementAccountInfoPt2')}</Text_1.default>
                                </Text_1.default>)}
                        </>}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceSettlementAccountPage.displayName = 'WorkspaceSettlementAccountPage';
exports.default = WorkspaceSettlementAccountPage;
