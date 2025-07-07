"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddPlaidBankAccount_1 = require("@components/AddPlaidBankAccount");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getPlaidOAuthReceivedRedirectURI_1 = require("@libs/getPlaidOAuthReceivedRedirectURI");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var Navigation_1 = require("@libs/Navigation/Navigation");
var BankAccounts_1 = require("@userActions/BankAccounts");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
function AddPersonalBankAccountPage() {
    var _a, _b, _c, _d;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)(''), selectedPlaidAccountId = _e[0], setSelectedPlaidAccountId = _e[1];
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: false })[0];
    var personalBankAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_BANK_ACCOUNT, { canBeMissing: true })[0];
    var plaidData = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_DATA, { canBeMissing: true })[0];
    var shouldShowSuccess = (_a = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.shouldShowSuccess) !== null && _a !== void 0 ? _a : false;
    var topmostFullScreenRoute = (_c = (_b = Navigation_1.navigationRef.current) === null || _b === void 0 ? void 0 : _b.getRootState()) === null || _c === void 0 ? void 0 : _c.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    var goBack = (0, react_1.useCallback)(function () {
        switch (topmostFullScreenRoute === null || topmostFullScreenRoute === void 0 ? void 0 : topmostFullScreenRoute.name) {
            case NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR:
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET);
                break;
            case NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR:
                Navigation_1.default.closeRHPFlow();
                break;
            default:
                Navigation_1.default.goBack();
                break;
        }
    }, [topmostFullScreenRoute === null || topmostFullScreenRoute === void 0 ? void 0 : topmostFullScreenRoute.name]);
    var submitBankAccountForm = (0, react_1.useCallback)(function () {
        var _a;
        var bankAccounts = (_a = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _a !== void 0 ? _a : [];
        var policyID = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.policyID;
        var source = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.source;
        var selectedPlaidBankAccount = bankAccounts.find(function (bankAccount) { return bankAccount.plaidAccountID === selectedPlaidAccountId; });
        if (selectedPlaidBankAccount) {
            (0, BankAccounts_1.addPersonalBankAccount)(selectedPlaidBankAccount, policyID, source);
        }
    }, [plaidData, selectedPlaidAccountId, personalBankAccount]);
    var exitFlow = (0, react_1.useCallback)(function (shouldContinue) {
        var _a;
        if (shouldContinue === void 0) { shouldContinue = false; }
        var exitReportID = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.exitReportID;
        var onSuccessFallbackRoute = (_a = personalBankAccount === null || personalBankAccount === void 0 ? void 0 : personalBankAccount.onSuccessFallbackRoute) !== null && _a !== void 0 ? _a : '';
        if (exitReportID) {
            Navigation_1.default.dismissModalWithReport({ reportID: exitReportID });
        }
        else if (shouldContinue && onSuccessFallbackRoute) {
            (0, PaymentMethods_1.continueSetup)(onSuccessFallbackRoute);
        }
        else {
            goBack();
        }
    }, [personalBankAccount, goBack]);
    (0, react_1.useEffect)(function () { return BankAccounts_1.clearPersonalBankAccount; }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={shouldShowSuccess} shouldEnablePickerAvoiding={false} shouldShowOfflineIndicator={false} testID={AddPersonalBankAccountPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!isUserValidated}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                    <HeaderWithBackButton_1.default title={translate('bankAccount.addBankAccount')} onBackButtonPress={shouldShowSuccess ? exitFlow : Navigation_1.default.goBack}/>
                    {shouldShowSuccess ? (<ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                            <ConfirmationPage_1.default heading={translate('addPersonalBankAccountPage.successTitle')} description={translate('addPersonalBankAccountPage.successMessage')} shouldShowButton buttonText={translate('common.continue')} onButtonPress={function () { return exitFlow(true); }} containerStyle={styles.h100}/>
                        </ScrollView_1.default>) : (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.PERSONAL_BANK_ACCOUNT_FORM} isSubmitButtonVisible={((_d = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _d !== void 0 ? _d : []).length > 0} submitButtonText={translate('common.saveAndContinue')} scrollContextEnabled onSubmit={submitBankAccountForm} validate={BankAccounts_1.validatePlaidSelection} style={[styles.mh5, styles.flex1]} shouldHideFixErrorsAlert>
                            <InputWrapper_1.default inputID={ReimbursementAccountForm_1.default.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID} InputComponent={AddPlaidBankAccount_1.default} onSelect={setSelectedPlaidAccountId} text={translate('walletPage.chooseAccountBody')} plaidData={plaidData} isDisplayedInWalletFlow onExitPlaid={Navigation_1.default.goBack} receivedRedirectURI={(0, getPlaidOAuthReceivedRedirectURI_1.default)()} selectedPlaidAccountID={selectedPlaidAccountId}/>
                        </FormProvider_1.default>)}
                </DelegateNoAccessWrapper_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';
exports.default = AddPersonalBankAccountPage;
