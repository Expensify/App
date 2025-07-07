"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Illustrations = require("@components/Icon/Illustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var BillingBanner_1 = require("./BillingBanner");
function SubscriptionBillingBanner(_a) {
    var title = _a.title, subtitle = _a.subtitle, rightIcon = _a.rightIcon, icon = _a.icon, _b = _a.isError, isError = _b === void 0 ? false : _b, onRightIconPress = _a.onRightIconPress, rightIconAccessibilityLabel = _a.rightIconAccessibilityLabel;
    var styles = (0, useThemeStyles_1.default)();
    var iconAsset = (icon !== null && icon !== void 0 ? icon : isError) ? Illustrations.CreditCardEyes : Illustrations.CheckmarkCircle;
    return (<BillingBanner_1.default title={title} subtitle={subtitle} icon={iconAsset} brickRoadIndicator={isError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO} subtitleStyle={styles.textSupporting} style={styles.hoveredComponentBG} rightIcon={rightIcon} onRightIconPress={onRightIconPress} rightIconAccessibilityLabel={rightIconAccessibilityLabel}/>);
}
SubscriptionBillingBanner.displayName = 'SubscriptionBillingBanner';
exports.default = SubscriptionBillingBanner;
