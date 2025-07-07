"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Pressable_1 = require("@components/Pressable");
var RenderHTML_1 = require("@components/RenderHTML");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var BillingBanner_1 = require("./BillingBanner");
function EarlyDiscountBanner(_a) {
    var isSubscriptionPage = _a.isSubscriptionPage, onboardingHelpDropdownButton = _a.onboardingHelpDropdownButton, onDismissedDiscountBanner = _a.onDismissedDiscountBanner, hasActiveScheduledCall = _a.hasActiveScheduledCall;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var firstDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var lastDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var initialDiscountInfo = (0, SubscriptionUtils_1.getEarlyDiscountInfo)();
    var _b = (0, react_1.useState)(initialDiscountInfo), discountInfo = _b[0], setDiscountInfo = _b[1];
    var _c = (0, react_1.useState)(false), isDismissed = _c[0], setIsDismissed = _c[1];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    (0, react_1.useEffect)(function () {
        var intervalID = setInterval(function () {
            setDiscountInfo((0, SubscriptionUtils_1.getEarlyDiscountInfo)());
        }, 1000);
        return function () { return clearInterval(intervalID); };
    }, [firstDayFreeTrial]);
    var dismissButton = (0, react_1.useMemo)(function () {
        return (discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.discountType) === 25 && (<Tooltip_1.default text={translate('common.close')}>
                    <Pressable_1.PressableWithFeedback onPress={function () {
                setIsDismissed(true);
                onDismissedDiscountBanner === null || onDismissedDiscountBanner === void 0 ? void 0 : onDismissedDiscountBanner();
            }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                        <Icon_1.default src={Expensicons.Close} fill={theme.icon}/>
                    </Pressable_1.PressableWithFeedback>
                </Tooltip_1.default>);
    }, [theme.icon, translate, onDismissedDiscountBanner, discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.discountType]);
    var rightComponent = (0, react_1.useMemo)(function () {
        var smallScreenStyle = shouldUseNarrowLayout ? [styles.flex0, styles.flexBasis100, styles.justifyContentCenter] : [];
        return (<react_native_1.View style={[styles.flexRow, styles.gap2, smallScreenStyle, styles.alignItemsCenter]}>
                {onboardingHelpDropdownButton}
                <Button_1.default success={!hasActiveScheduledCall} style={shouldUseNarrowLayout ? [styles.earlyDiscountButton, styles.flexGrow2] : styles.mr2} text={translate('subscription.billingBanner.earlyDiscount.claimOffer')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.getRoute(Navigation_1.default.getActiveRoute())); }}/>
                {!shouldUseNarrowLayout && dismissButton}
            </react_native_1.View>);
    }, [
        shouldUseNarrowLayout,
        hasActiveScheduledCall,
        styles.flex0,
        styles.flexBasis100,
        styles.justifyContentCenter,
        styles.flexRow,
        styles.gap2,
        styles.alignItemsCenter,
        styles.earlyDiscountButton,
        styles.flexGrow2,
        styles.mr2,
        onboardingHelpDropdownButton,
        translate,
        dismissButton,
    ]);
    if (!firstDayFreeTrial || !lastDayFreeTrial || !discountInfo) {
        return null;
    }
    if (isDismissed && !isSubscriptionPage) {
        return null;
    }
    var title = isSubscriptionPage ? (<RenderHTML_1.default html={translate('subscription.billingBanner.earlyDiscount.subscriptionPageTitle', {
            discountType: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.discountType,
        })}/>) : (<react_native_1.View style={[styles.justifyContentBetween, styles.flexRow]}>
            <RenderHTML_1.default html={translate('subscription.billingBanner.earlyDiscount.onboardingChatTitle', {
            discountType: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.discountType,
        })}/>
            {shouldUseNarrowLayout && dismissButton}
        </react_native_1.View>);
    return (<BillingBanner_1.default title={title} style={!isSubscriptionPage && [styles.hoveredComponentBG, styles.borderBottom]} subtitle={translate('subscription.billingBanner.earlyDiscount.subtitle', {
            days: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.days,
            hours: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.hours,
            minutes: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.minutes,
            seconds: discountInfo === null || discountInfo === void 0 ? void 0 : discountInfo.seconds,
        })} subtitleStyle={[styles.mt1, styles.mutedNormalTextLabel, isSubscriptionPage && StyleUtils.getTextColorStyle(theme.trialTimer)]} icon={Illustrations.TreasureChest} rightComponent={!isSubscriptionPage && rightComponent}/>);
}
EarlyDiscountBanner.displayName = 'EarlyDiscountBanner';
exports.default = EarlyDiscountBanner;
