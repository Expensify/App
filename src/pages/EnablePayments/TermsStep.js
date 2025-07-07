"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var BankAccounts = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LongTermsForm_1 = require("./TermsPage/LongTermsForm");
var ShortTermsForm_1 = require("./TermsPage/ShortTermsForm");
function HaveReadAndAgreeLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('termsStep.haveReadAndAgree'))}
            <TextLink_1.default href={CONST_1.default.ELECTRONIC_DISCLOSURES_URL}>{"".concat(translate('termsStep.electronicDisclosures'), ".")}</TextLink_1.default>
        </Text_1.default>);
}
function AgreeToTheLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('termsStep.agreeToThe'), " ")}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>{"".concat(translate('common.privacy'), " ")}</TextLink_1.default>
            {"".concat(translate('common.and'), " ")}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.WALLET_AGREEMENT_URL}>{"".concat(translate('termsStep.walletAgreement'), ".")}</TextLink_1.default>
        </Text_1.default>);
}
function TermsStep(props) {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), hasAcceptedDisclosure = _b[0], setHasAcceptedDisclosure = _b[1];
    var _c = (0, react_1.useState)(false), hasAcceptedPrivacyPolicyAndWalletAgreement = _c[0], setHasAcceptedPrivacyPolicyAndWalletAgreement = _c[1];
    var _d = (0, react_1.useState)(false), error = _d[0], setError = _d[1];
    var translate = (0, useLocalize_1.default)().translate;
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS)[0];
    var errorMessage = error ? translate('common.error.acceptTerms') : ((_a = ErrorUtils.getLatestErrorMessage(walletTerms !== null && walletTerms !== void 0 ? walletTerms : {})) !== null && _a !== void 0 ? _a : '');
    var toggleDisclosure = function () {
        setHasAcceptedDisclosure(!hasAcceptedDisclosure);
    };
    var togglePrivacyPolicy = function () {
        setHasAcceptedPrivacyPolicyAndWalletAgreement(!hasAcceptedPrivacyPolicyAndWalletAgreement);
    };
    /** clear error */
    (0, react_1.useEffect)(function () {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }
        setError(false);
    }, [hasAcceptedDisclosure, hasAcceptedPrivacyPolicyAndWalletAgreement]);
    return (<>
            <HeaderWithBackButton_1.default title={translate('termsStep.headerTitle')}/>

            <ScrollView_1.default style={styles.flex1} contentContainerStyle={styles.ph5}>
                <ShortTermsForm_1.default userWallet={props.userWallet}/>
                <LongTermsForm_1.default />
                <CheckboxWithLabel_1.default accessibilityLabel={translate('termsStep.haveReadAndAgree')} style={[styles.mb4, styles.mt4]} onInputChange={toggleDisclosure} LabelComponent={HaveReadAndAgreeLabel}/>
                <CheckboxWithLabel_1.default accessibilityLabel={translate('termsStep.agreeToThe')} onInputChange={togglePrivacyPolicy} LabelComponent={AgreeToTheLabel}/>
                <FormAlertWithSubmitButton_1.default buttonText={translate('termsStep.enablePayments')} onSubmit={function () {
            var _a;
            if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
                setError(true);
                return;
            }
            setError(false);
            BankAccounts.acceptWalletTerms({
                hasAcceptedTerms: hasAcceptedDisclosure && hasAcceptedPrivacyPolicyAndWalletAgreement,
                reportID: (_a = walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.chatReportID) !== null && _a !== void 0 ? _a : '-1',
            });
        }} message={errorMessage} isAlertVisible={error || !!errorMessage} isLoading={!!(walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.isLoading)} containerStyles={[styles.mh0, styles.mv4]}/>
            </ScrollView_1.default>
        </>);
}
TermsStep.displayName = 'TermsPage';
exports.default = TermsStep;
