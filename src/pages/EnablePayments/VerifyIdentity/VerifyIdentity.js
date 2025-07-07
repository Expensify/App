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
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var FixedFooter_1 = require("@components/FixedFooter");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var InteractiveStepSubHeader_1 = require("@components/InteractiveStepSubHeader");
var Onfido_1 = require("@components/Onfido");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var Growl_1 = require("@libs/Growl");
var BankAccounts = require("@userActions/BankAccounts");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ONFIDO_ERROR_DISPLAY_DURATION = 10000;
function VerifyIdentity() {
    var _a, _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var walletOnfidoData = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ONFIDO, { initWithStoredValues: false })[0];
    var openOnfidoFlow = function () {
        BankAccounts.openOnfidoFlow();
    };
    var handleOnfidoSuccess = (0, react_1.useCallback)(function (onfidoData) {
        BankAccounts.verifyIdentity({
            onfidoData: JSON.stringify(__assign(__assign({}, onfidoData), { applicantID: walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.applicantID })),
        });
        BankAccounts.updateAddPersonalBankAccountDraft({ isOnfidoSetupComplete: true });
    }, [walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.applicantID]);
    var onfidoError = (_a = ErrorUtils.getLatestErrorMessage(walletOnfidoData)) !== null && _a !== void 0 ? _a : '';
    var handleOnfidoError = function () {
        Growl_1.default.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
    };
    var goBack = function () {
        Wallet.updateCurrentStep(CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS);
    };
    return (<ScreenWrapper_1.default testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton_1.default title={translate('onfidoStep.verifyIdentity')} onBackButtonPress={goBack}/>
            <react_native_1.View style={[styles.ph5, styles.mt3, { height: CONST_1.default.BANK_ACCOUNT.STEPS_HEADER_HEIGHT }]}>
                <InteractiveStepSubHeader_1.default startStepIndex={2} stepNames={CONST_1.default.WALLET.STEP_NAMES}/>
            </react_native_1.View>
            <FullPageOfflineBlockingView_1.default>
                <ScrollView_1.default contentContainerStyle={styles.flex1}>
                    {(walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.hasAcceptedPrivacyPolicy) ? (<Onfido_1.default sdkToken={(_b = walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.sdkToken) !== null && _b !== void 0 ? _b : ''} onUserExit={goBack} onError={handleOnfidoError} onSuccess={handleOnfidoSuccess}/>) : (<>
                            <react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.m5, styles.ph5]}>
                                <Icon_1.default src={Illustrations.ToddBehindCloud} width={100} height={100}/>
                                <Text_1.default style={[styles.textHeadline, styles.mb2]}>{translate('onfidoStep.letsVerifyIdentity')}</Text_1.default>
                                <Text_1.default style={[styles.textAlignCenter, styles.textSupporting]}>{translate('onfidoStep.butFirst')}</Text_1.default>
                            </react_native_1.View>
                            <FixedFooter_1.default>
                                <FormAlertWithSubmitButton_1.default isAlertVisible={!!onfidoError} onSubmit={openOnfidoFlow} message={onfidoError} isLoading={walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.isLoading} buttonText={onfidoError ? translate('onfidoStep.tryAgain') : translate('common.continue')} containerStyles={[styles.mh0, styles.mv0, styles.mb0]}/>
                            </FixedFooter_1.default>
                        </>)}
                </ScrollView_1.default>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
VerifyIdentity.displayName = 'VerifyIdentity';
exports.default = VerifyIdentity;
