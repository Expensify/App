"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var CurrentWalletBalance_1 = require("@components/CurrentWalletBalance");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var TRANSFER_TIER_NAMES = [CONST_1.default.WALLET.TIER_NAME.GOLD, CONST_1.default.WALLET.TIER_NAME.PLATINUM];
function TransferBalancePage() {
    var _a, _b, _c;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), numberFormat = _d.numberFormat, translate = _d.translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var paddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    var walletTransfer = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TRANSFER)[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST)[0];
    var paymentCardList = fundList !== null && fundList !== void 0 ? fundList : {};
    var paymentTypes = [
        {
            key: CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.INSTANT,
            title: translate('transferAmountPage.instant'),
            description: translate('transferAmountPage.instantSummary', {
                rate: numberFormat(CONST_1.default.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.RATE),
                minAmount: (0, CurrencyUtils_1.convertToDisplayString)(CONST_1.default.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.MINIMUM_FEE),
            }),
            icon: Expensicons.Bolt,
            type: CONST_1.default.PAYMENT_METHODS.DEBIT_CARD,
        },
        {
            key: CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.ACH,
            title: translate('transferAmountPage.ach'),
            description: translate('transferAmountPage.achSummary'),
            icon: Expensicons.Bank,
            type: CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        },
    ];
    /**
     * Get the selected/default payment method account for wallet transfer
     */
    function getSelectedPaymentMethodAccount() {
        var paymentMethods = (0, PaymentUtils_1.formatPaymentMethods)(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}, paymentCardList, styles);
        var defaultAccount = paymentMethods.find(function (method) { return method.isDefault; });
        var selectedAccount = paymentMethods.find(function (method) { var _a, _b; return method.accountType === (walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.selectedAccountType) && ((_a = method.methodID) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.selectedAccountID) === null || _b === void 0 ? void 0 : _b.toString()); });
        return selectedAccount !== null && selectedAccount !== void 0 ? selectedAccount : defaultAccount;
    }
    function navigateToChooseTransferAccount(filterPaymentMethodType) {
        var _a;
        (0, PaymentMethods_1.saveWalletTransferMethodType)(filterPaymentMethodType);
        // If we only have a single option for the given paymentMethodType do not force the user to make a selection
        var combinedPaymentMethods = (0, PaymentUtils_1.formatPaymentMethods)(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}, paymentCardList, styles);
        var filteredMethods = combinedPaymentMethods.filter(function (paymentMethod) { return paymentMethod.accountType === filterPaymentMethodType; });
        if (filteredMethods.length === 1) {
            var account = filteredMethods.at(0);
            (0, PaymentMethods_1.saveWalletTransferAccountTypeAndID)(filterPaymentMethodType, (_a = account === null || account === void 0 ? void 0 : account.methodID) === null || _a === void 0 ? void 0 : _a.toString());
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT);
    }
    (0, react_1.useEffect)(function () {
        var _a;
        // Reset to the default account when the page is opened
        (0, PaymentMethods_1.resetWalletTransferData)();
        var selectedAccount = getSelectedPaymentMethodAccount();
        if (!selectedAccount) {
            return;
        }
        (0, PaymentMethods_1.saveWalletTransferAccountTypeAndID)(selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.accountType, (_a = selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.methodID) === null || _a === void 0 ? void 0 : _a.toString());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we only want this effect to run on initial render
    }, []);
    if ((walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.shouldShowSuccess) && !(walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.loading)) {
        return (<ScreenWrapper_1.default testID={TransferBalancePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('common.transferBalance')} onBackButtonPress={PaymentMethods_1.dismissSuccessfulTransferBalancePage}/>
                <ConfirmationPage_1.default heading={translate('transferAmountPage.transferSuccess')} description={walletTransfer.paymentMethodType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                ? translate('transferAmountPage.transferDetailBankAccount')
                : translate('transferAmountPage.transferDetailDebitCard')} shouldShowButton buttonText={translate('common.done')} onButtonPress={PaymentMethods_1.dismissSuccessfulTransferBalancePage} containerStyle={styles.flex1}/>
            </ScreenWrapper_1.default>);
    }
    var selectedAccount = getSelectedPaymentMethodAccount();
    var selectedPaymentType = selectedAccount && selectedAccount.accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.ACH : CONST_1.default.WALLET.TRANSFER_METHOD_TYPE.INSTANT;
    var calculatedFee = (0, PaymentUtils_1.calculateWalletTransferBalanceFee)((_a = userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) !== null && _a !== void 0 ? _a : 0, selectedPaymentType);
    var transferAmount = (_b = userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) !== null && _b !== void 0 ? _b : 0 - calculatedFee;
    var isTransferable = transferAmount > 0;
    var isButtonDisabled = !isTransferable || !selectedAccount;
    var errorMessage = (0, ErrorUtils_1.getLatestErrorMessage)(walletTransfer);
    var shouldShowTransferView = (0, PaymentUtils_1.hasExpensifyPaymentMethod)(paymentCardList, bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}) && TRANSFER_TIER_NAMES.includes((_c = userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName) !== null && _c !== void 0 ? _c : '');
    return (<ScreenWrapper_1.default testID={TransferBalancePage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!shouldShowTransferView} titleKey="notFound.pageNotFound" subtitleKey="transferAmountPage.notHereSubTitle" linkKey="transferAmountPage.goToWallet" onLinkPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET); }}>
                <HeaderWithBackButton_1.default title={translate('common.transferBalance')} shouldShowBackButton/>
                <react_native_1.View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                    <CurrentWalletBalance_1.default balanceStyles={[styles.transferBalanceBalance]}/>
                </react_native_1.View>
                <ScrollView_1.default style={styles.flexGrow0} contentContainerStyle={styles.pv5}>
                    <react_native_1.View style={styles.ph5}>
                        {paymentTypes.map(function (paymentType) { return (<MenuItem_1.default key={paymentType.key} title={paymentType.title} description={paymentType.description} iconWidth={variables_1.default.iconSizeXLarge} iconHeight={variables_1.default.iconSizeXLarge} icon={paymentType.icon} success={selectedPaymentType === paymentType.key} wrapperStyle={__assign(__assign(__assign(__assign({}, styles.mt3), styles.pv4), styles.transferBalancePayment), (selectedPaymentType === paymentType.key && styles.transferBalanceSelectedPayment))} onPress={function () { return navigateToChooseTransferAccount(paymentType.type); }}/>); })}
                    </react_native_1.View>
                    <Text_1.default style={[styles.pt8, styles.ph5, styles.pb1, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.whichAccount')}</Text_1.default>
                    {!!selectedAccount && (<MenuItem_1.default title={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.title} description={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.description} shouldShowRightIcon iconStyles={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.iconStyles} iconWidth={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.iconSize} iconHeight={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.iconSize} icon={selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.icon} onPress={function () { var _a; return navigateToChooseTransferAccount((_a = selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.accountType) !== null && _a !== void 0 ? _a : CONST_1.default.PAYMENT_METHODS.DEBIT_CARD); }} displayInDefaultIconColor/>)}
                    <react_native_1.View style={styles.ph5}>
                        <Text_1.default style={[styles.mt5, styles.mb3, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.fee')}</Text_1.default>
                        <Text_1.default style={[styles.justifyContentStart]}>{(0, CurrencyUtils_1.convertToDisplayString)(calculatedFee)}</Text_1.default>
                    </react_native_1.View>
                </ScrollView_1.default>
                <react_native_1.View>
                    <FormAlertWithSubmitButton_1.default buttonText={translate('transferAmountPage.transfer', {
            amount: isTransferable ? (0, CurrencyUtils_1.convertToDisplayString)(transferAmount) : '',
        })} isLoading={walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.loading} onSubmit={function () { return selectedAccount && (0, PaymentMethods_1.transferWalletBalance)(selectedAccount); }} isDisabled={isButtonDisabled || isOffline} message={errorMessage} isAlertVisible={!(0, EmptyObject_1.isEmptyObject)(errorMessage)} containerStyles={[styles.ph5, !paddingBottom ? styles.pb5 : null]}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TransferBalancePage.displayName = 'TransferBalancePage';
exports.default = TransferBalancePage;
