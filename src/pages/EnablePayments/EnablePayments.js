"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AddBankAccount_1 = require("./AddBankAccount/AddBankAccount");
var FailedKYC_1 = require("./FailedKYC");
var FeesAndTerms_1 = require("./FeesAndTerms/FeesAndTerms");
var PersonalInfo_1 = require("./PersonalInfo/PersonalInfo");
var VerifyIdentity_1 = require("./VerifyIdentity/VerifyIdentity");
function EnablePaymentsPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var isActingAsDelegate = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { var _a; return !!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); } })[0];
    (0, react_1.useEffect)(function () {
        if (isOffline) {
            return;
        }
        if ((0, EmptyObject_1.isEmptyObject)(userWallet)) {
            Wallet.openEnablePaymentsPage();
        }
    }, [isOffline, userWallet]);
    if (isActingAsDelegate) {
        return (<ScreenWrapper_1.default testID={EnablePaymentsPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false}>
                <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}/>
            </ScreenWrapper_1.default>);
    }
    if ((0, EmptyObject_1.isEmptyObject)(userWallet)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    if ((userWallet === null || userWallet === void 0 ? void 0 : userWallet.errorCode) === CONST_1.default.WALLET.ERROR.KYC) {
        return (<ScreenWrapper_1.default testID={EnablePaymentsPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false}>
                <HeaderWithBackButton_1.default title={translate('personalInfoStep.personalInfo')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET); }}/>
                <FailedKYC_1.default />
            </ScreenWrapper_1.default>);
    }
    var currentStep = (0, EmptyObject_1.isEmptyObject)(bankAccountList) ? CONST_1.default.WALLET.STEP.ADD_BANK_ACCOUNT : (userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentStep) || CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS;
    switch (currentStep) {
        case CONST_1.default.WALLET.STEP.ADD_BANK_ACCOUNT:
            return <AddBankAccount_1.default />;
        case CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS:
        case CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
            return <PersonalInfo_1.default />;
        case CONST_1.default.WALLET.STEP.ONFIDO:
            return <VerifyIdentity_1.default />;
        case CONST_1.default.WALLET.STEP.TERMS:
            return <FeesAndTerms_1.default />;
        default:
            return null;
    }
}
EnablePaymentsPage.displayName = 'EnablePaymentsPage';
exports.default = EnablePaymentsPage;
