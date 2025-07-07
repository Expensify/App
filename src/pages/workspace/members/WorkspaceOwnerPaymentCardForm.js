"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PaymentCardForm_1 = require("@components/AddPaymentCard/PaymentCardForm");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
function WorkspaceOwnerPaymentCardForm(_a) {
    var _b;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(false), shouldShowPaymentCardForm = _c[0], setShouldShowPaymentCardForm = _c[1];
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var checkIfCanBeRendered = (0, react_1.useCallback)(function () {
        var _a, _b;
        var changeOwnerErrors = Object.keys((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.changeOwner) !== null && _b !== void 0 ? _b : {});
        if (changeOwnerErrors.at(0) !== CONST_1.default.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD) {
            setShouldShowPaymentCardForm(false);
        }
        setShouldShowPaymentCardForm(true);
    }, [(_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.changeOwner]);
    (0, react_1.useEffect)(function () {
        (0, PaymentMethods_1.clearPaymentCardFormErrorAndSubmit)();
        checkIfCanBeRendered();
        return function () {
            (0, PaymentMethods_1.clearPaymentCardFormErrorAndSubmit)();
        };
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    (0, react_1.useEffect)(function () {
        checkIfCanBeRendered();
    }, [checkIfCanBeRendered]);
    var addPaymentCard = (0, react_1.useCallback)(function (values) {
        var cardData = {
            cardNumber: (0, CardUtils_1.getMCardNumberString)(values.cardNumber),
            cardMonth: (0, CardUtils_1.getMonthFromExpirationDateString)(values.expirationDate),
            cardYear: (0, CardUtils_1.getYearFromExpirationDateString)(values.expirationDate),
            cardCVV: values.securityCode,
            addressName: values.nameOnCard,
            addressZip: values.addressZipCode,
            currency: values.currency,
        };
        (0, Policy_1.addBillingCardAndRequestPolicyOwnerChange)(policyID, cardData);
    }, [policyID]);
    return (<PaymentCardForm_1.default shouldShowPaymentCardForm={shouldShowPaymentCardForm} addPaymentCard={addPaymentCard} showCurrencyField submitButtonText={translate('workspace.changeOwner.addPaymentCardButtonText')} headerContent={<Text_1.default style={[styles.textHeadline, styles.mt3, styles.mb2, styles.ph5]}>{translate('workspace.changeOwner.addPaymentCardTitle')}</Text_1.default>} footerContent={<>
                    <Text_1.default style={[styles.textMicroSupporting, styles.mt5]}>
                        {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart1')}{' '}
                        <TextLink_1.default style={[styles.textMicroSupporting, styles.link]} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>
                            {translate('workspace.changeOwner.addPaymentCardTerms')}
                        </TextLink_1.default>{' '}
                        {translate('workspace.changeOwner.addPaymentCardAnd')}{' '}
                        <TextLink_1.default style={[styles.textMicroSupporting, styles.link]} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>
                            {translate('workspace.changeOwner.addPaymentCardPrivacy')}
                        </TextLink_1.default>{' '}
                        {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart2')}
                    </Text_1.default>
                    <Section_1.default icon={Illustrations.ShieldYellow} cardLayout={Section_1.CARD_LAYOUT.ICON_ON_LEFT} title={translate('requestorStep.isMyDataSafe')} containerStyles={[styles.mh0, styles.mt5]}>
                        <react_native_1.View style={[styles.mt4, styles.ph2, styles.pb2]}>
                            <Text_1.default style={[styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon_1.default src={Expensicons.Checkmark} additionalStyles={[styles.mr3]} fill={theme.iconSuccessFill}/>
                                {translate('workspace.changeOwner.addPaymentCardPciCompliant')}
                            </Text_1.default>
                            <Text_1.default style={[styles.mt3, styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon_1.default src={Expensicons.Checkmark} additionalStyles={[styles.mr3]} fill={theme.iconSuccessFill}/>
                                {translate('workspace.changeOwner.addPaymentCardBankLevelEncrypt')}
                            </Text_1.default>
                            <Text_1.default style={[styles.mt3, styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon_1.default src={Expensicons.Checkmark} additionalStyles={[styles.mr3]} fill={theme.iconSuccessFill}/>
                                {translate('workspace.changeOwner.addPaymentCardRedundant')}
                            </Text_1.default>
                        </react_native_1.View>
                        <Text_1.default style={[styles.mt3, styles.textSupportingNormal]}>
                            {translate('workspace.changeOwner.addPaymentCardLearnMore')}{' '}
                            <TextLink_1.default style={[styles.textSupportingNormal, styles.link]} href={CONST_1.default.PERSONAL_DATA_PROTECTION_INFO_URL}>
                                {translate('workspace.changeOwner.addPaymentCardSecurity')}
                            </TextLink_1.default>
                            .
                        </Text_1.default>
                    </Section_1.default>
                </>}/>);
}
WorkspaceOwnerPaymentCardForm.displayName = 'WorkspaceOwnerPaymentCardForm';
exports.default = WorkspaceOwnerPaymentCardForm;
