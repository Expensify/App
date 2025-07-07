"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function HaveReadAndAgreeLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('termsStep.haveReadAndAgree'))}
            <TextLink_1.default href={CONST_1.default.ELECTRONIC_DISCLOSURES_URL}>{"".concat(translate('termsStep.electronicDisclosures'), ".")}</TextLink_1.default>
        </Text_1.default>);
}
function AgreeToTheLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    var walletAgreementUrl = (userWallet === null || userWallet === void 0 ? void 0 : userWallet.walletProgramID) && (userWallet === null || userWallet === void 0 ? void 0 : userWallet.walletProgramID) === CONST_1.default.WALLET.BANCORP_WALLET_PROGRAM_ID
        ? CONST_1.default.OLD_DOT_PUBLIC_URLS.BANCORP_WALLET_AGREEMENT_URL
        : CONST_1.default.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL;
    return (<Text_1.default>
            {"".concat(translate('termsStep.agreeToThe'), " ")}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{"".concat(translate('common.privacy'), " ")}</TextLink_1.default>
            {"".concat(translate('common.and'), " ")}
            <TextLink_1.default href={walletAgreementUrl}>{"".concat(translate('termsStep.walletAgreement'), ".")}</TextLink_1.default>
        </Text_1.default>);
}
function TermsStep(_a) {
    var _b;
    var onNext = _a.onNext;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(false), hasAcceptedDisclosure = _c[0], setHasAcceptedDisclosure = _c[1];
    var _d = (0, react_1.useState)(false), hasAcceptedPrivacyPolicyAndWalletAgreement = _d[0], setHasAcceptedPrivacyPolicyAndWalletAgreement = _d[1];
    var _e = (0, react_1.useState)(false), error = _e[0], setError = _e[1];
    var translate = (0, useLocalize_1.default)().translate;
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS)[0];
    var errorMessage = error ? translate('common.error.acceptTerms') : ((_b = ErrorUtils.getLatestErrorMessage(walletTerms !== null && walletTerms !== void 0 ? walletTerms : {})) !== null && _b !== void 0 ? _b : '');
    var toggleDisclosure = function () {
        setHasAcceptedDisclosure(!hasAcceptedDisclosure);
    };
    var togglePrivacyPolicy = function () {
        setHasAcceptedPrivacyPolicyAndWalletAgreement(!hasAcceptedPrivacyPolicyAndWalletAgreement);
    };
    var submit = function () {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            setError(true);
            return;
        }
        setError(false);
        onNext();
    };
    /** clear error */
    (0, react_1.useEffect)(function () {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }
        setError(false);
    }, [hasAcceptedDisclosure, hasAcceptedPrivacyPolicyAndWalletAgreement]);
    return (<react_native_1.View style={[styles.flexGrow1, styles.ph5]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{translate('termsStep.checkTheBoxes')}</Text_1.default>
            <Text_1.default style={[styles.mt3, styles.mb3, styles.textSupporting]}>{translate('termsStep.agreeToTerms')}</Text_1.default>
            <react_native_1.View style={styles.flex1}>
                <CheckboxWithLabel_1.default accessibilityLabel={translate('termsStep.haveReadAndAgree')} style={[styles.mb4, styles.mt4]} onInputChange={toggleDisclosure} LabelComponent={HaveReadAndAgreeLabel}/>
                <CheckboxWithLabel_1.default accessibilityLabel={translate('termsStep.agreeToThe')} onInputChange={togglePrivacyPolicy} LabelComponent={AgreeToTheLabel}/>
            </react_native_1.View>
            <FormAlertWithSubmitButton_1.default buttonText={translate('termsStep.enablePayments')} onSubmit={submit} message={errorMessage} isAlertVisible={error || !!errorMessage} isLoading={!!(walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.isLoading)} containerStyles={[styles.mh0, styles.mv5]}/>
        </react_native_1.View>);
}
exports.default = TermsStep;
