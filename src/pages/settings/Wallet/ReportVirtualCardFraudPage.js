"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var User_1 = require("@libs/actions/User");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function ReportVirtualCardFraudPage(_a) {
    var _b, _c;
    var _d = _a.route.params, _e = _d.cardID, cardID = _e === void 0 ? '' : _e, backTo = _d.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: false })[0];
    var formData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REPORT_VIRTUAL_CARD_FRAUD, { canBeMissing: true })[0];
    var validateCodeAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, { canBeMissing: true })[0];
    var primaryLogin = (_b = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _b !== void 0 ? _b : '';
    var virtualCard = cardList === null || cardList === void 0 ? void 0 : cardList[cardID];
    var latestIssuedVirtualCardID = (_c = Object.keys(cardList !== null && cardList !== void 0 ? cardList : {})) === null || _c === void 0 ? void 0 : _c.pop();
    var virtualCardError = (0, ErrorUtils_1.getLatestErrorMessage)(virtualCard);
    var validateError = (0, ErrorUtils_1.getLatestErrorMessageField)(virtualCard);
    var _f = (0, react_1.useState)(false), isValidateCodeActionModalVisible = _f[0], setIsValidateCodeActionModalVisible = _f[1];
    var prevIsLoading = (0, usePrevious_1.default)(formData === null || formData === void 0 ? void 0 : formData.isLoading);
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () {
        (0, Card_1.clearReportVirtualCardFraudForm)();
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!prevIsLoading || (formData === null || formData === void 0 ? void 0 : formData.isLoading)) {
            return;
        }
        if (!(0, EmptyObject_1.isEmptyObject)(virtualCard === null || virtualCard === void 0 ? void 0 : virtualCard.errors) || !(0, EmptyObject_1.isEmptyObject)((_a = validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.errorFields) === null || _a === void 0 ? void 0 : _a.reportVirtualCard)) {
            return;
        }
        if (latestIssuedVirtualCardID) {
            Navigation_1.default.removeScreenFromNavigationState(SCREENS_1.default.SETTINGS.WALLET.DOMAIN_CARD);
            Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_REPORT_FRAUD_CONFIRMATION.getRoute(latestIssuedVirtualCardID));
            setIsValidateCodeActionModalVisible(false);
        }
    }, [formData === null || formData === void 0 ? void 0 : formData.isLoading, latestIssuedVirtualCardID, prevIsLoading, virtualCard === null || virtualCard === void 0 ? void 0 : virtualCard.errors, validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.errorFields]);
    var handleValidateCodeEntered = (0, react_1.useCallback)(function (validateCode) {
        if (!virtualCard) {
            return;
        }
        (0, Card_1.reportVirtualExpensifyCardFraud)(virtualCard, validateCode);
    }, [virtualCard]);
    var handleSubmit = (0, react_1.useCallback)(function () {
        setIsValidateCodeActionModalVisible(true);
    }, [setIsValidateCodeActionModalVisible]);
    if ((0, EmptyObject_1.isEmptyObject)(virtualCard) && !(formData === null || formData === void 0 ? void 0 : formData.cardID)) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default testID={ReportVirtualCardFraudPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('reportFraudPage.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <react_native_1.View style={[styles.flex1, styles.justifyContentBetween]}>
                    <Text_1.default style={[styles.webViewStyles.baseFontStyle, styles.mh5]}>{translate('reportFraudPage.description')}</Text_1.default>
                    <FormAlertWithSubmitButton_1.default isAlertVisible={!!virtualCardError} onSubmit={handleSubmit} message={virtualCardError} buttonText={translate('reportFraudPage.deactivateCard')} containerStyles={[styles.m5]}/>
                    <ValidateCodeActionModal_1.default handleSubmitForm={handleValidateCodeEntered} sendValidateCode={User_1.requestValidateCodeAction} validateCodeActionErrorField="reportVirtualCard" validateError={validateError} clearError={function () {
            if (!(virtualCard === null || virtualCard === void 0 ? void 0 : virtualCard.cardID)) {
                return;
            }
            (0, Card_1.clearCardListErrors)(virtualCard.cardID);
        }} onClose={function () { return setIsValidateCodeActionModalVisible(false); }} isVisible={isValidateCodeActionModalVisible} title={translate('cardPage.validateCardTitle')} descriptionPrimary={translate('cardPage.enterMagicCode', { contactMethod: primaryLogin })} isLoading={formData === null || formData === void 0 ? void 0 : formData.isLoading}/>
                </react_native_1.View>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';
exports.default = ReportVirtualCardFraudPage;
