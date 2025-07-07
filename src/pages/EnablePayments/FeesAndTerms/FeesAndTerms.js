"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubStep_1 = require("@hooks/useSubStep");
var Navigation_1 = require("@navigation/Navigation");
var BankAccounts = require("@userActions/BankAccounts");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var FeesStep_1 = require("./substeps/FeesStep");
var TermsStep_1 = require("./substeps/TermsStep");
var termsAndFeesSubsteps = [FeesStep_1.default, TermsStep_1.default];
function FeesAndTerms() {
    var translate = (0, useLocalize_1.default)().translate;
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS)[0];
    var submit = function () {
        var _a;
        BankAccounts.acceptWalletTerms({
            hasAcceptedTerms: true,
            reportID: (_a = walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.chatReportID) !== null && _a !== void 0 ? _a : '',
        });
        BankAccounts.clearPersonalBankAccount();
        Wallet.resetWalletAdditionalDetailsDraft();
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET);
    };
    var _a = (0, useSubStep_1.default)({ bodyContent: termsAndFeesSubsteps, startFrom: 0, onFinished: submit }), SubStep = _a.componentToRender, isEditing = _a.isEditing, screenIndex = _a.screenIndex, nextScreen = _a.nextScreen, prevScreen = _a.prevScreen, moveTo = _a.moveTo;
    var handleBackButtonPress = function () {
        if (screenIndex === 0) {
            Wallet.updateCurrentStep(CONST_1.default.WALLET.STEP.ONFIDO);
            return;
        }
        prevScreen();
    };
    return (<InteractiveStepWrapper_1.default wrapperID={FeesAndTerms.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('termsStep.headerTitleRefactor')} handleBackButtonPress={handleBackButtonPress} startStepIndex={3} stepNames={CONST_1.default.WALLET.STEP_NAMES}>
            <SubStep isEditing={isEditing} onNext={nextScreen} onMove={moveTo}/>
        </InteractiveStepWrapper_1.default>);
}
FeesAndTerms.displayName = 'TermsAndFees';
exports.default = FeesAndTerms;
