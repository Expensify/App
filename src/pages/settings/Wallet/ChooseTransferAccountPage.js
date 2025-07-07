"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var BankIcons_1 = require("@components/Icon/BankIcons");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var BankAccounts = require("@userActions/BankAccounts");
var PaymentMethods = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function ChooseTransferAccountPage() {
    var _a;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TRANSFER), walletTransfer = _b[0], walletTransferResult = _b[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param event Click event object
     * @param accountType of the selected account type
     * @param account of the selected account data
     */
    var selectAccountAndNavigateBack = function (accountType, account) {
        var _a, _b, _c;
        PaymentMethods.saveWalletTransferAccountTypeAndID(accountType !== null && accountType !== void 0 ? accountType : '', (_c = (accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? (_a = account === null || account === void 0 ? void 0 : account.bankAccountID) === null || _a === void 0 ? void 0 : _a.toString() : (_b = account === null || account === void 0 ? void 0 : account.fundID) === null || _b === void 0 ? void 0 : _b.toString())) !== null && _c !== void 0 ? _c : '');
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET_TRANSFER_BALANCE);
    };
    var navigateToAddPaymentMethodPage = function () {
        if ((walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.filterPaymentMethodType) === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        BankAccounts.openPersonalBankAccountSetupView();
    };
    var bankAccountsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var selectedAccountID = walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.selectedAccountID;
    var data = (0, react_1.useMemo)(function () {
        var options = Object.values(bankAccountsList !== null && bankAccountsList !== void 0 ? bankAccountsList : {}).map(function (bankAccount) {
            var _a, _b, _c, _d, _e, _f, _g;
            var bankName = ((_c = (_b = (_a = bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.bankName) !== null && _c !== void 0 ? _c : '');
            var bankAccountNumber = (_e = (_d = bankAccount.accountData) === null || _d === void 0 ? void 0 : _d.accountNumber) !== null && _e !== void 0 ? _e : '';
            var bankAccountID = (_g = (_f = bankAccount.accountData) === null || _f === void 0 ? void 0 : _f.bankAccountID) !== null && _g !== void 0 ? _g : bankAccount.methodID;
            var _h = (0, BankIcons_1.default)({ bankName: bankName, styles: styles }), icon = _h.icon, iconSize = _h.iconSize, iconStyles = _h.iconStyles;
            return {
                value: bankAccountID,
                text: bankAccount.title,
                leftElement: icon ? (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon_1.default src={icon} width={iconSize} height={iconSize} additionalStyles={iconStyles}/>
                    </react_native_1.View>) : null,
                alternateText: "".concat(translate('workspace.expensifyCard.accountEndingIn'), " ").concat((0, BankAccountUtils_1.getLastFourDigits)(bankAccountNumber)),
                keyForList: bankAccountID === null || bankAccountID === void 0 ? void 0 : bankAccountID.toString(),
                isSelected: (bankAccountID === null || bankAccountID === void 0 ? void 0 : bankAccountID.toString()) === selectedAccountID,
                bankAccount: bankAccount,
            };
        });
        return options;
    }, [bankAccountsList, selectedAccountID, styles, translate]);
    if ((0, isLoadingOnyxValue_1.default)(walletTransferResult)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default testID={ChooseTransferAccountPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('chooseTransferAccountPage.chooseAccount')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET_TRANSFER_BALANCE); }}/>

            <SelectionList_1.default sections={[{ data: data }]} ListItem={RadioListItem_1.default} onSelectRow={function (value) {
            var _a, _b;
            var accountType = (_a = value === null || value === void 0 ? void 0 : value.bankAccount) === null || _a === void 0 ? void 0 : _a.accountType;
            var accountData = (_b = value === null || value === void 0 ? void 0 : value.bankAccount) === null || _b === void 0 ? void 0 : _b.accountData;
            selectAccountAndNavigateBack(accountType, accountData);
        }} shouldSingleExecuteRowSelect shouldUpdateFocusedIndex initiallyFocusedOptionKey={(_a = walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.selectedAccountID) === null || _a === void 0 ? void 0 : _a.toString()} listFooterContent={<MenuItem_1.default onPress={navigateToAddPaymentMethodPage} title={(walletTransfer === null || walletTransfer === void 0 ? void 0 : walletTransfer.filterPaymentMethodType) === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                ? translate('paymentMethodList.addNewBankAccount')
                : translate('paymentMethodList.addNewDebitCard')} icon={Expensicons.Plus}/>}/>
        </ScreenWrapper_1.default>);
}
ChooseTransferAccountPage.displayName = 'ChooseTransferAccountPage';
exports.default = ChooseTransferAccountPage;
