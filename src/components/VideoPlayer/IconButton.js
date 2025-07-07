"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Tooltip_1 = require("@components/Tooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function IconButton(_a) {
    var src = _a.src, _b = _a.fill, fill = _b === void 0 ? 'white' : _b, onPress = _a.onPress, style = _a.style, hoverStyle = _a.hoverStyle, _c = _a.tooltipText, tooltipText = _c === void 0 ? '' : _c, _d = _a.small, small = _d === void 0 ? false : _d, _e = _a.shouldForceRenderingTooltipBelow, shouldForceRenderingTooltipBelow = _e === void 0 ? false : _e;
    var styles = (0, useThemeStyles_1.default)();
    return (<Tooltip_1.default text={tooltipText} shouldForceRenderingBelow={shouldForceRenderingTooltipBelow}>
            <PressableWithFeedback_1.default accessibilityLabel={tooltipText} onPress={onPress} style={[styles.videoIconButton, style]} hoverStyle={[styles.videoIconButtonHovered, hoverStyle]} role={CONST_1.default.ROLE.BUTTON}>
                <Icon_1.default src={src} fill={fill} small={small}/>
            </PressableWithFeedback_1.default>
        </Tooltip_1.default>);
}
IconButton.displayName = 'IconButton';
exports.default = IconButton;
