"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BigNumberPad_1 = require("@components/BigNumberPad");
var Button_1 = require("@components/Button");
var IllustratedHeaderPageLayout_1 = require("@components/IllustratedHeaderPageLayout");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MagicCodeInput_1 = require("@components/MagicCodeInput");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CardSettings = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var LAST_FOUR_DIGITS_LENGTH = 4;
var MAGIC_INPUT_MIN_HEIGHT = 86;
function ActivatePhysicalCardPage(_a) {
    var _b = _a.route.params.cardID, cardID = _b === void 0 ? '' : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isExtraSmallScreenHeight = (0, useResponsiveLayout_1.default)().isExtraSmallScreenHeight;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST)[0], cardList = _c === void 0 ? {} : _c;
    var _d = (0, react_1.useState)(''), formError = _d[0], setFormError = _d[1];
    var _e = (0, react_1.useState)(''), lastFourDigits = _e[0], setLastFourDigits = _e[1];
    var _f = (0, react_1.useState)(''), lastPressedDigit = _f[0], setLastPressedDigit = _f[1];
    var _g = (0, react_1.useState)(false), canShowError = _g[0], setCanShowError = _g[1];
    var inactiveCard = cardList === null || cardList === void 0 ? void 0 : cardList[cardID];
    var cardError = ErrorUtils.getLatestErrorMessage(inactiveCard !== null && inactiveCard !== void 0 ? inactiveCard : {});
    var activateCardCodeInputRef = (0, react_1.useRef)(null);
    /**
     * If state of the card is CONST.EXPENSIFY_CARD.STATE.OPEN, navigate to card details screen.
     */
    (0, react_1.useEffect)(function () {
        if ((inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.state) !== CONST_1.default.EXPENSIFY_CARD.STATE.OPEN || (inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.isLoading)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    }, [cardID, cardList, inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.isLoading, inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.state]);
    (0, react_1.useEffect)(function () {
        if (!(inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID)) {
            return;
        }
        CardSettings.clearCardListErrors(inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID);
        return function () {
            if (!(inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID)) {
                return;
            }
            CardSettings.clearCardListErrors(inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID);
        };
    }, [inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID]);
    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     *
     * NOTE: If the same digit is pressed twice in a row, append it to the end of the string
     * so that useEffect inside MagicCodeInput will be triggered by artificial change of the value.
     */
    var updateLastPressedDigit = (0, react_1.useCallback)(function (key) { return setLastPressedDigit(lastPressedDigit === key ? lastPressedDigit + key : key); }, [lastPressedDigit]);
    /**
     * Handle card activation code input
     */
    var onCodeInput = function (text) {
        setFormError('');
        if (cardError && (inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID)) {
            CardSettings.clearCardListErrors(inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID);
        }
        setLastFourDigits(text);
    };
    var submitAndNavigateToNextPage = (0, react_1.useCallback)(function () {
        var _a;
        setCanShowError(true);
        (_a = activateCardCodeInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        if (lastFourDigits.replace(CONST_1.default.MAGIC_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.thatDidNotMatch'));
            return;
        }
        if ((inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID) === undefined) {
            return;
        }
        CardSettings.activatePhysicalExpensifyCard(lastFourDigits, inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID);
    }, [lastFourDigits, inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.cardID, translate]);
    if ((0, EmptyObject_1.isEmptyObject)(inactiveCard)) {
        return <NotFoundPage_1.default />;
    }
    return (<IllustratedHeaderPageLayout_1.default title={translate('activateCardPage.activateCard')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID)); }} backgroundColor={theme.PAGE_THEMES[SCREENS_1.default.SETTINGS.PREFERENCES.ROOT].backgroundColor} illustration={LottieAnimations_1.default.Magician} scrollViewContainerStyles={[styles.mnh100]} childrenContainerStyles={[styles.flex1]} testID={ActivatePhysicalCardPage.displayName}>
            <Text_1.default style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text_1.default>
            <react_native_1.View style={[styles.mh5, { minHeight: MAGIC_INPUT_MIN_HEIGHT }]}>
                <MagicCodeInput_1.default isDisableKeyboard autoComplete="off" maxLength={LAST_FOUR_DIGITS_LENGTH} name="activateCardCode" value={lastFourDigits} lastPressedDigit={lastPressedDigit} onChangeText={onCodeInput} onFulfill={submitAndNavigateToNextPage} errorText={canShowError ? formError || cardError : ''} ref={activateCardCodeInputRef}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pv0]}>
                {DeviceCapabilities.canUseTouchScreen() && <BigNumberPad_1.default numberPressed={updateLastPressedDigit}/>}
            </react_native_1.View>
            <Button_1.default success isDisabled={isOffline} isLoading={inactiveCard === null || inactiveCard === void 0 ? void 0 : inactiveCard.isLoading} medium={isExtraSmallScreenHeight} large={!isExtraSmallScreenHeight} style={[styles.w100, styles.p5, styles.mtAuto]} onPress={submitAndNavigateToNextPage} pressOnEnter text={translate('activateCardPage.activatePhysicalCard')}/>
        </IllustratedHeaderPageLayout_1.default>);
}
ActivatePhysicalCardPage.displayName = 'ActivatePhysicalCardPage';
exports.default = ActivatePhysicalCardPage;
