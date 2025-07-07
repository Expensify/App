"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors */
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThrottledButtonState_1 = require("@hooks/useThrottledButtonState");
var getButtonState_1 = require("@libs/getButtonState");
var variables_1 = require("@styles/variables");
var PressableWithoutFeedback_1 = require("./PressableWithoutFeedback");
function PressableWithDelayToggle(_a, ref) {
    var _b = _a.iconChecked, iconChecked = _b === void 0 ? Expensicons.Checkmark : _b, _c = _a.inline, inline = _c === void 0 ? true : _c, onPress = _a.onPress, text = _a.text, textChecked = _a.textChecked, tooltipText = _a.tooltipText, tooltipTextChecked = _a.tooltipTextChecked, pressableStyle = _a.styles, textStyles = _a.textStyles, iconStyles = _a.iconStyles, icon = _a.icon, accessibilityRole = _a.accessibilityRole;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _d = (0, useThrottledButtonState_1.default)(), isActive = _d[0], temporarilyDisableInteractions = _d[1];
    var updatePressState = function () {
        if (!isActive) {
            return;
        }
        temporarilyDisableInteractions();
        onPress === null || onPress === void 0 ? void 0 : onPress();
    };
    // Due to limitations in RN regarding the vertical text alignment of non-Text elements,
    // for elements that are supposed to be inline, we need to use a Text element instead
    // of a Pressable
    var PressableView = inline ? Text_1.default : PressableWithoutFeedback_1.default;
    var tooltipTexts = !isActive ? tooltipTextChecked : tooltipText;
    var labelText = (<Text_1.default suppressHighlighting style={textStyles}>
            {!isActive && textChecked ? textChecked : text}
            &nbsp;
        </Text_1.default>);
    return (<PressableView 
    // Using `ref as any` due to variable component (Text or View) based on 'inline' prop; TypeScript workaround.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    ref={ref} onPress={updatePressState} accessibilityLabel={tooltipTexts} suppressHighlighting={inline ? true : undefined} accessibilityRole={accessibilityRole}>
            <>
                {inline && labelText}
                <Tooltip_1.default text={tooltipTexts} shouldRender>
                    <PressableWithoutFeedback_1.default tabIndex={-1} accessible={false} onPress={updatePressState} style={[styles.flexRow, pressableStyle, !isActive && styles.cursorDefault]}>
                        {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<>
                                {!inline && labelText}
                                {!!icon && (<Icon_1.default src={!isActive ? iconChecked : icon} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed, !isActive))} additionalStyles={iconStyles} width={variables_1.default.iconSizeSmall} height={variables_1.default.iconSizeSmall} inline={inline}/>)}
                            </>);
        }}
                    </PressableWithoutFeedback_1.default>
                </Tooltip_1.default>
            </>
        </PressableView>);
}
PressableWithDelayToggle.displayName = 'PressableWithDelayToggle';
exports.default = (0, react_1.forwardRef)(PressableWithDelayToggle);
