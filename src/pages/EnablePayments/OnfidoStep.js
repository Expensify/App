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
var react_native_onyx_1 = require("react-native-onyx");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Onfido_1 = require("@components/Onfido");
var useLocalize_1 = require("@hooks/useLocalize");
var Growl_1 = require("@libs/Growl");
var Navigation_1 = require("@libs/Navigation/Navigation");
var BankAccounts = require("@userActions/BankAccounts");
var Wallet = require("@userActions/Wallet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnfidoPrivacy_1 = require("./OnfidoPrivacy");
var DEFAULT_WALLET_ONFIDO_DATA = {
    loading: false,
    hasAcceptedPrivacyPolicy: false,
};
function OnfidoStep(_a) {
    var _b;
    var _c = _a.walletOnfidoData, walletOnfidoData = _c === void 0 ? DEFAULT_WALLET_ONFIDO_DATA : _c;
    var translate = (0, useLocalize_1.default)().translate;
    var shouldShowOnfido = (walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.hasAcceptedPrivacyPolicy) && !walletOnfidoData.isLoading && !walletOnfidoData.errors && walletOnfidoData.sdkToken;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack();
    }, []);
    var goToPreviousStep = (0, react_1.useCallback)(function () {
        Wallet.updateCurrentStep(CONST_1.default.WALLET.STEP.ADDITIONAL_DETAILS);
    }, []);
    var reportError = (0, react_1.useCallback)(function () {
        Growl_1.default.error(translate('onfidoStep.genericError'), 10000);
    }, [translate]);
    var verifyIdentity = (0, react_1.useCallback)(function (data) {
        BankAccounts.verifyIdentity({
            onfidoData: JSON.stringify(__assign(__assign({}, data), { applicantID: walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.applicantID })),
        });
    }, [walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.applicantID]);
    return (<>
            <HeaderWithBackButton_1.default title={translate('onfidoStep.verifyIdentity')} onBackButtonPress={goToPreviousStep}/>
            <FullPageOfflineBlockingView_1.default>
                {shouldShowOnfido ? (<Onfido_1.default sdkToken={(_b = walletOnfidoData.sdkToken) !== null && _b !== void 0 ? _b : ''} onUserExit={goBack} onError={reportError} onSuccess={verifyIdentity}/>) : (<OnfidoPrivacy_1.default />)}
            </FullPageOfflineBlockingView_1.default>
        </>);
}
OnfidoStep.displayName = 'OnfidoStep';
exports.default = (0, react_native_onyx_1.withOnyx)({
    walletOnfidoData: {
        key: ONYXKEYS_1.default.WALLET_ONFIDO,
        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
