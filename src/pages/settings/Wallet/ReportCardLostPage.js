"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SingleOptionSelector_1 = require("@components/SingleOptionSelector");
var Text_1 = require("@components/Text");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormActions_1 = require("@libs/actions/FormActions");
var User_1 = require("@libs/actions/User");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var Card_1 = require("@userActions/Card");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var SuccessReportCardLost_1 = require("./SuccessReportCardLost");
var OPTIONS_KEYS = {
    DAMAGED: 'damaged',
    STOLEN: 'stolen',
};
/** Options for reason selector */
var OPTIONS = [
    {
        key: OPTIONS_KEYS.DAMAGED,
        label: 'reportCardLostOrDamaged.cardDamaged',
    },
    {
        key: OPTIONS_KEYS.STOLEN,
        label: 'reportCardLostOrDamaged.cardLostOrStolen',
    },
];
function ReportCardLostPage(_a) {
    var _b;
    var _c = _a.route.params.cardID, cardID = _c === void 0 ? '' : _c;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var formData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REPORT_PHYSICAL_CARD_FORM, { canBeMissing: true })[0];
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: true })[0];
    var _d = (0, react_1.useState)(), reason = _d[0], setReason = _d[1];
    var _e = (0, react_1.useState)(false), isReasonConfirmed = _e[0], setIsReasonConfirmed = _e[1];
    var _f = (0, react_1.useState)(false), shouldShowAddressError = _f[0], setShouldShowAddressError = _f[1];
    var _g = (0, react_1.useState)(false), shouldShowReasonError = _g[0], setShouldShowReasonError = _g[1];
    var _h = (0, react_1.useState)(''), newCardID = _h[0], setNewCardID = _h[1];
    var physicalCard = cardList === null || cardList === void 0 ? void 0 : cardList[cardID];
    var validateError = (0, ErrorUtils_1.getLatestErrorMessageField)(physicalCard);
    var _j = (0, react_1.useState)(false), isValidateCodeActionModalVisible = _j[0], setIsValidateCodeActionModalVisible = _j[1];
    var paddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var formattedAddress = (0, PersonalDetailsUtils_1.getFormattedAddress)(privatePersonalDetails !== null && privatePersonalDetails !== void 0 ? privatePersonalDetails : {});
    var primaryLogin = (_b = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _b !== void 0 ? _b : '';
    var previousCardList = (0, usePrevious_1.default)(cardList);
    (0, useBeforeRemove_1.default)(function () { return setIsValidateCodeActionModalVisible(false); });
    (0, react_1.useEffect)(function () {
        var newID = Object.keys(cardList !== null && cardList !== void 0 ? cardList : {}).find(function (cardKey) { var _a; return ((_a = cardList === null || cardList === void 0 ? void 0 : cardList[cardKey]) === null || _a === void 0 ? void 0 : _a.cardID) && !Object.keys(previousCardList !== null && previousCardList !== void 0 ? previousCardList : {}).includes(cardKey); });
        if (!newID || (physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.cardID)) {
            return;
        }
        setNewCardID(newID);
    }, [cardList, physicalCard, previousCardList]);
    (0, react_1.useEffect)(function () {
        (0, User_1.resetValidateActionCodeSent)();
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        if ((formData === null || formData === void 0 ? void 0 : formData.isLoading) && (0, EmptyObject_1.isEmptyObject)(physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.errors)) {
            return;
        }
        (0, FormActions_1.setErrors)(ONYXKEYS_1.default.FORMS.REPORT_PHYSICAL_CARD_FORM, (_a = physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.errors) !== null && _a !== void 0 ? _a : {});
    }, [formData === null || formData === void 0 ? void 0 : formData.isLoading, physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.errors]);
    var handleValidateCodeEntered = (0, react_1.useCallback)(function (validateCode) {
        if (!physicalCard) {
            return;
        }
        (0, Card_1.requestReplacementExpensifyCard)(physicalCard.cardID, reason === null || reason === void 0 ? void 0 : reason.key, validateCode);
    }, [physicalCard, reason === null || reason === void 0 ? void 0 : reason.key]);
    if ((0, EmptyObject_1.isEmptyObject)(physicalCard) && !newCardID && !(formData === null || formData === void 0 ? void 0 : formData.isLoading)) {
        return <NotFoundPage_1.default />;
    }
    var handleSubmitFirstStep = function () {
        if (!reason) {
            setShouldShowReasonError(true);
            return;
        }
        setIsReasonConfirmed(true);
        setShouldShowAddressError(false);
        setShouldShowReasonError(false);
    };
    var handleSubmitSecondStep = function () {
        if (!formattedAddress) {
            setShouldShowAddressError(true);
            return;
        }
        setIsValidateCodeActionModalVisible(true);
    };
    var handleOptionSelect = function (option) {
        setReason(option);
        setShouldShowReasonError(false);
    };
    var handleBackButtonPress = function () {
        if (isReasonConfirmed) {
            setIsReasonConfirmed(false);
            return;
        }
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    };
    var isDamaged = (reason === null || reason === void 0 ? void 0 : reason.key) === OPTIONS_KEYS.DAMAGED;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={ReportCardLostPage.displayName}>
            <HeaderWithBackButton_1.default title={newCardID ? translate('common.success') : translate('reportCardLostOrDamaged.screenTitle')} onBackButtonPress={handleBackButtonPress} shouldDisplayHelpButton={!newCardID}/>
            {!newCardID && (<react_native_1.View style={[styles.flex1, styles.justifyContentBetween, styles.pt3, !paddingBottom ? styles.pb5 : null]}>
                    {isReasonConfirmed ? (<>
                            <react_native_1.View>
                                <Text_1.default style={[styles.textHeadline, styles.mb3, styles.mh5]}>{translate('reportCardLostOrDamaged.confirmAddressTitle')}</Text_1.default>
                                <MenuItemWithTopDescription_1.default title={formattedAddress} description={translate('reportCardLostOrDamaged.address')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADDRESS); }} numberOfLinesTitle={2}/>
                                {isDamaged ? (<Text_1.default style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.cardDamagedInfo')}</Text_1.default>) : (<Text_1.default style={[styles.mt3, styles.mh5]}>{translate('reportCardLostOrDamaged.cardLostOrStolenInfo')}</Text_1.default>)}
                            </react_native_1.View>
                            <react_native_1.View style={[styles.mh5]}>
                                <FormAlertWithSubmitButton_1.default isAlertVisible={shouldShowAddressError} onSubmit={handleSubmitSecondStep} message={translate('reportCardLostOrDamaged.addressError')} isLoading={formData === null || formData === void 0 ? void 0 : formData.isLoading} buttonText={isDamaged ? translate('reportCardLostOrDamaged.shipNewCardButton') : translate('reportCardLostOrDamaged.deactivateCardButton')}/>
                            </react_native_1.View>
                            <ValidateCodeActionModal_1.default handleSubmitForm={handleValidateCodeEntered} sendValidateCode={User_1.requestValidateCodeAction} validateCodeActionErrorField="replaceLostCard" validateError={validateError} clearError={function () {
                    if (!(physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.cardID)) {
                        return;
                    }
                    (0, Card_1.clearCardListErrors)(physicalCard === null || physicalCard === void 0 ? void 0 : physicalCard.cardID);
                }} onClose={function () { return setIsValidateCodeActionModalVisible(false); }} isVisible={isValidateCodeActionModalVisible} title={translate('cardPage.validateCardTitle')} descriptionPrimary={translate('cardPage.enterMagicCode', { contactMethod: primaryLogin })}/>
                        </>) : (<>
                            <react_native_1.View style={[styles.mh5]}>
                                <Text_1.default style={[styles.textHeadline, styles.mr5]}>{translate('reportCardLostOrDamaged.reasonTitle')}</Text_1.default>
                                <SingleOptionSelector_1.default options={OPTIONS} selectedOptionKey={reason === null || reason === void 0 ? void 0 : reason.key} onSelectOption={handleOptionSelect}/>
                            </react_native_1.View>
                            <react_native_1.View style={[styles.mh5]}>
                                <FormAlertWithSubmitButton_1.default isAlertVisible={shouldShowReasonError} onSubmit={handleSubmitFirstStep} message={translate('reportCardLostOrDamaged.reasonError')} buttonText={translate('reportCardLostOrDamaged.nextButtonLabel')}/>
                            </react_native_1.View>
                        </>)}
                </react_native_1.View>)}
            {!!newCardID && <SuccessReportCardLost_1.default cardID={newCardID}/>}
        </ScreenWrapper_1.default>);
}
ReportCardLostPage.displayName = 'ReportCardLostPage';
exports.default = ReportCardLostPage;
