"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var FixedFooter_1 = require("@components/FixedFooter");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FormScrollView_1 = require("@components/FormScrollView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var BankAccounts = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var DEFAULT_WALLET_ONFIDO_DATA = {
    applicantID: '',
    sdkToken: '',
    loading: false,
    errors: {},
    fixableErrors: [],
    hasAcceptedPrivacyPolicy: false,
};
function OnfidoPrivacy(_a) {
    var _b, _c;
    var _d = _a.walletOnfidoData, walletOnfidoData = _d === void 0 ? DEFAULT_WALLET_ONFIDO_DATA : _d;
    var translate = (0, useLocalize_1.default)().translate;
    var formRef = (0, react_1.useRef)(null);
    var styles = (0, useThemeStyles_1.default)();
    if (!walletOnfidoData) {
        return;
    }
    var _e = walletOnfidoData.isLoading, isLoading = _e === void 0 ? false : _e, hasAcceptedPrivacyPolicy = walletOnfidoData.hasAcceptedPrivacyPolicy;
    var openOnfidoFlow = function () {
        BankAccounts.openOnfidoFlow();
    };
    var onfidoError = (_b = ErrorUtils.getLatestErrorMessage(walletOnfidoData)) !== null && _b !== void 0 ? _b : '';
    var onfidoFixableErrors = (_c = walletOnfidoData === null || walletOnfidoData === void 0 ? void 0 : walletOnfidoData.fixableErrors) !== null && _c !== void 0 ? _c : [];
    if (Array.isArray(onfidoError)) {
        onfidoError[0] += !(0, EmptyObject_1.isEmptyObject)(onfidoFixableErrors) ? "\n".concat(onfidoFixableErrors.join('\n')) : '';
    }
    return (<react_native_1.View style={[styles.flex1, styles.justifyContentBetween]}>
            {!hasAcceptedPrivacyPolicy ? (<>
                    <FormScrollView_1.default ref={formRef}>
                        <react_native_1.View style={[styles.mh5, styles.justifyContentCenter]}>
                            <Text_1.default style={[styles.mb5]}>
                                {translate('onfidoStep.acceptTerms')}
                                <TextLink_1.default href={CONST_1.default.ONFIDO_FACIAL_SCAN_POLICY_URL}>{translate('onfidoStep.facialScan')}</TextLink_1.default>
                                {', '}
                                <TextLink_1.default href={CONST_1.default.ONFIDO_PRIVACY_POLICY_URL}>{translate('common.privacy')}</TextLink_1.default>
                                {" ".concat(translate('common.and'), " ")}
                                <TextLink_1.default href={CONST_1.default.ONFIDO_TERMS_OF_SERVICE_URL}>{translate('common.termsOfService')}</TextLink_1.default>.
                            </Text_1.default>
                        </react_native_1.View>
                    </FormScrollView_1.default>
                    <FixedFooter_1.default>
                        <FormAlertWithSubmitButton_1.default isAlertVisible={!!onfidoError} onSubmit={openOnfidoFlow} onFixTheErrorsLinkPressed={function () {
                var _a;
                (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ y: 0, animated: true });
            }} message={onfidoError} isLoading={isLoading} buttonText={onfidoError ? translate('onfidoStep.tryAgain') : translate('common.continue')} containerStyles={[styles.mh0, styles.mv0, styles.mb0]}/>
                    </FixedFooter_1.default>
                </>) : null}
            {hasAcceptedPrivacyPolicy && isLoading ? <FullscreenLoadingIndicator_1.default /> : null}
        </react_native_1.View>);
}
OnfidoPrivacy.displayName = 'OnfidoPrivacy';
exports.default = (0, react_native_onyx_1.withOnyx)({
    walletOnfidoData: {
        key: ONYXKEYS_1.default.WALLET_ONFIDO,
        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoPrivacy);
