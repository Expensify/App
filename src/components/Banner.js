"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var Hoverable_1 = require("./Hoverable");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var RenderHTML_1 = require("./RenderHTML");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
function Banner(_a) {
    var text = _a.text, content = _a.content, _b = _a.icon, icon = _b === void 0 ? Expensicons.Exclamation : _b, onClose = _a.onClose, onPress = _a.onPress, onButtonPress = _a.onButtonPress, containerStyles = _a.containerStyles, textStyles = _a.textStyles, _c = _a.shouldRenderHTML, shouldRenderHTML = _c === void 0 ? false : _c, _d = _a.shouldShowIcon, shouldShowIcon = _d === void 0 ? false : _d, _e = _a.shouldShowCloseButton, shouldShowCloseButton = _e === void 0 ? false : _e, _f = _a.shouldShowButton, shouldShowButton = _f === void 0 ? false : _f;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Hoverable_1.default>
            {function (isHovered) {
            var isClickable = onClose && onPress;
            var shouldHighlight = isClickable && isHovered;
            return (<react_native_1.View style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.p5,
                    styles.borderRadiusNormal,
                    shouldHighlight ? styles.activeComponentBG : styles.hoveredComponentBG,
                    styles.breakAll,
                    containerStyles,
                ]}>
                        <react_native_1.View style={[styles.flexRow, styles.flex1, styles.mw100, styles.alignItemsCenter]}>
                            {shouldShowIcon && !!icon && (<react_native_1.View style={[styles.mr3]}>
                                    <Icon_1.default src={icon} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(shouldHighlight))}/>
                                </react_native_1.View>)}
                            {content && content}

                            {text &&
                    (shouldRenderHTML ? (<RenderHTML_1.default html={text}/>) : (<Text_1.default style={[styles.flex1, styles.flexWrap, textStyles]} onPress={onPress} suppressHighlighting>
                                        {text}
                                    </Text_1.default>))}
                        </react_native_1.View>
                        {shouldShowButton && (<Button_1.default success style={[styles.pr3]} text={translate('common.chatNow')} onPress={onButtonPress}/>)}
                        {shouldShowCloseButton && !!onClose && (<Tooltip_1.default text={translate('common.close')}>
                                <PressableWithFeedback_1.default onPress={onClose} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                                    <Icon_1.default src={Expensicons.Close} fill={theme.icon}/>
                                </PressableWithFeedback_1.default>
                            </Tooltip_1.default>)}
                    </react_native_1.View>);
        }}
        </Hoverable_1.default>);
}
Banner.displayName = 'Banner';
exports.default = (0, react_1.memo)(Banner);
