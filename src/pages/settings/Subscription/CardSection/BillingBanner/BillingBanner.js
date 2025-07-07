"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function BillingBanner(_a) {
    var title = _a.title, subtitle = _a.subtitle, icon = _a.icon, brickRoadIndicator = _a.brickRoadIndicator, style = _a.style, titleStyle = _a.titleStyle, subtitleStyle = _a.subtitleStyle, rightIcon = _a.rightIcon, onRightIconPress = _a.onRightIconPress, rightIconAccessibilityLabel = _a.rightIconAccessibilityLabel, rightComponent = _a.rightComponent;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var rightIconComponent = (0, react_1.useMemo)(function () {
        if (rightIcon) {
            return onRightIconPress && rightIconAccessibilityLabel ? (<Pressable_1.PressableWithoutFeedback onPress={onRightIconPress} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={rightIconAccessibilityLabel}>
                    <Icon_1.default src={rightIcon} fill={theme.icon}/>
                </Pressable_1.PressableWithoutFeedback>) : (<Icon_1.default src={rightIcon} fill={theme.icon}/>);
        }
        return (!!brickRoadIndicator && (<Icon_1.default src={Expensicons.DotIndicator} fill={brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}/>));
    }, [brickRoadIndicator, onRightIconPress, rightIcon, rightIconAccessibilityLabel, styles.touchableButtonImage, theme.danger, theme.icon, theme.success]);
    return (<react_native_1.View style={[styles.pv4, styles.ph5, styles.flexRow, styles.flexWrap, styles.gap3, styles.w100, styles.alignItemsCenter, styles.trialBannerBackgroundColor, style]}>
            <Icon_1.default src={icon} width={variables_1.default.menuIconSize} height={variables_1.default.menuIconSize}/>

            <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                {typeof title === 'string' ? <Text_1.default style={[styles.textStrong, titleStyle]}>{title}</Text_1.default> : title}
                {typeof subtitle === 'string' ? <Text_1.default style={subtitleStyle}>{subtitle}</Text_1.default> : subtitle}
            </react_native_1.View>
            {!!rightComponent && rightComponent}
            {rightIconComponent}
        </react_native_1.View>);
}
BillingBanner.displayName = 'BillingBanner';
exports.default = BillingBanner;
