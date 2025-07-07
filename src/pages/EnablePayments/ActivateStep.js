"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var LottieAnimations_1 = require("@components/LottieAnimations");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ActivateStep(_a) {
    var userWallet = _a.userWallet;
    var translate = (0, useLocalize_1.default)().translate;
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS)[0];
    var isActivatedWallet = (userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName) && [CONST_1.default.WALLET.TIER_NAME.GOLD, CONST_1.default.WALLET.TIER_NAME.PLATINUM].some(function (name) { return name === userWallet.tierName; });
    var animation = isActivatedWallet ? LottieAnimations_1.default.Fireworks : LottieAnimations_1.default.ReviewingBankInfo;
    var continueButtonText = '';
    if (walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.chatReportID) {
        continueButtonText = translate('activateStep.continueToPayment');
    }
    else if ((walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.source) === CONST_1.default.KYC_WALL_SOURCE.ENABLE_WALLET) {
        continueButtonText = translate('common.continue');
    }
    else {
        continueButtonText = translate('activateStep.continueToTransfer');
    }
    return (<>
            <HeaderWithBackButton_1.default title={translate('activateStep.headerTitle')}/>
            <ConfirmationPage_1.default illustration={animation} heading={translate("activateStep.".concat(isActivatedWallet ? 'activated' : 'checkBackLater', "Title"))} description={translate("activateStep.".concat(isActivatedWallet ? 'activated' : 'checkBackLater', "Message"))} shouldShowButton={isActivatedWallet} buttonText={continueButtonText} onButtonPress={function () { return (0, PaymentMethods_1.continueSetup)(); }}/>
        </>);
}
ActivateStep.displayName = 'ActivateStep';
exports.default = ActivateStep;
