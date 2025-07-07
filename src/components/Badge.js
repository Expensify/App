"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var Text_1 = require("./Text");
function Badge(_a) {
    var _b = _a.success, success = _b === void 0 ? false : _b, _c = _a.error, error = _c === void 0 ? false : _c, _d = _a.pressable, pressable = _d === void 0 ? false : _d, text = _a.text, _e = _a.environment, environment = _e === void 0 ? CONST_1.default.ENVIRONMENT.DEV : _e, badgeStyles = _a.badgeStyles, textStyles = _a.textStyles, _f = _a.onPress, onPress = _f === void 0 ? function () { } : _f, icon = _a.icon, _g = _a.iconStyles, iconStyles = _g === void 0 ? [] : _g, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var Wrapper = pressable ? PressableWithoutFeedback_1.default : react_native_1.View;
    var isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedback.deleted) : false;
    var iconColor = StyleUtils.getIconColorStyle(success, error);
    var wrapperStyles = (0, react_1.useCallback)(function (_a) {
        var pressed = _a.pressed;
        return [
            styles.defaultBadge,
            styles.alignSelfCenter,
            styles.ml2,
            StyleUtils.getBadgeColorStyle(success, error, pressed, environment === CONST_1.default.ENVIRONMENT.ADHOC),
            badgeStyles,
        ];
    }, [styles.defaultBadge, styles.alignSelfCenter, styles.ml2, StyleUtils, success, error, environment, badgeStyles]);
    return (<Wrapper style={pressable ? wrapperStyles : wrapperStyles({ focused: false, hovered: false, isDisabled: false, isScreenReaderActive: false, pressed: false })} onPress={onPress} role={pressable ? CONST_1.default.ROLE.BUTTON : CONST_1.default.ROLE.PRESENTATION} accessibilityLabel={pressable ? text : undefined} aria-label={!pressable ? text : undefined} accessible={false}>
            {!!icon && (<react_native_1.View style={[styles.mr2, iconStyles]}>
                    <Icon_1.default width={variables_1.default.iconSizeExtraSmall} height={variables_1.default.iconSizeExtraSmall} src={icon} fill={iconColor}/>
                </react_native_1.View>)}
            <Text_1.default style={[styles.badgeText, styles.textStrong, textStyles, isDeleted ? styles.offlineFeedback.deleted : {}]} numberOfLines={1}>
                {text}
            </Text_1.default>
        </Wrapper>);
}
Badge.displayName = 'Badge';
exports.default = Badge;
