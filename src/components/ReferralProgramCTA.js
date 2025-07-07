"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useDismissedReferralBanners_1 = require("@hooks/useDismissedReferralBanners");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Navigation_1 = require("@src/libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
var utils_1 = require("./Button/utils");
var Icon_1 = require("./Icon");
var Expensicons_1 = require("./Icon/Expensicons");
var Pressable_1 = require("./Pressable");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
function ReferralProgramCTA(_a) {
    var referralContentType = _a.referralContentType, style = _a.style, onDismiss = _a.onDismiss;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var _b = (0, useDismissedReferralBanners_1.default)({ referralContentType: referralContentType }), isDismissed = _b.isDismissed, setAsDismissed = _b.setAsDismissed;
    var handleDismissCallToAction = function () {
        setAsDismissed();
        onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
    };
    var shouldShowBanner = referralContentType && !isDismissed;
    (0, react_1.useEffect)(function () {
        if (shouldShowBanner) {
            return;
        }
        onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
    }, [onDismiss, shouldShowBanner]);
    if (!shouldShowBanner) {
        return null;
    }
    return (<Pressable_1.PressableWithoutFeedback onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.REFERRAL_DETAILS_MODAL.getRoute(referralContentType, Navigation_1.default.getActiveRouteWithoutParams()));
        }} style={[styles.br2, styles.highlightBG, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, { gap: 10, padding: 10 }, styles.pl5, style]} isNested accessibilityLabel="referral" role={(0, utils_1.getButtonRole)(true)}>
            <Text_1.default>
                {translate("referralProgram.".concat(referralContentType, ".buttonText1"))}
                <Text_1.default color={theme.success} style={styles.textStrong}>
                    {translate("referralProgram.".concat(referralContentType, ".buttonText2"))}
                </Text_1.default>
            </Text_1.default>
            <Tooltip_1.default text={translate('common.close')}>
                <Pressable_1.PressableWithoutFeedback onPress={handleDismissCallToAction} onMouseDown={function (e) {
            e.preventDefault();
        }} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                    <Icon_1.default src={Expensicons_1.Close} height={20} width={20} fill={theme.icon}/>
                </Pressable_1.PressableWithoutFeedback>
            </Tooltip_1.default>
        </Pressable_1.PressableWithoutFeedback>);
}
exports.default = ReferralProgramCTA;
