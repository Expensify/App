"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DomUtils_1 = require("@libs/DomUtils");
var getButtonState_1 = require("@libs/getButtonState");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var PopoverAnchorTooltip_1 = require("./Tooltip/PopoverAnchorTooltip");
/**
 * Component that renders a mini context menu item with a
 * pressable. Also renders a tooltip when hovering the item.
 */
function BaseMiniContextMenuItem(_a, ref) {
    var tooltipText = _a.tooltipText, onPress = _a.onPress, children = _a.children, _b = _a.isDelayButtonStateComplete, isDelayButtonStateComplete = _b === void 0 ? true : _b, _c = _a.shouldPreventDefaultFocusOnPress, shouldPreventDefaultFocusOnPress = _c === void 0 ? true : _c;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<PopoverAnchorTooltip_1.default text={tooltipText} shouldRender>
            <PressableWithoutFeedback_1.default ref={ref} onPress={onPress} onMouseDown={function (event) {
            if (!ReportActionComposeFocusManager_1.default.isFocused() && !ReportActionComposeFocusManager_1.default.isEditFocused()) {
                var activeElement = DomUtils_1.default.getActiveElement();
                if (activeElement instanceof HTMLElement) {
                    activeElement === null || activeElement === void 0 ? void 0 : activeElement.blur();
                }
                return;
            }
            // Allow text input blur on right click
            if (!event || event.button === 2) {
                return;
            }
            // Prevent text input blur on left click
            if (shouldPreventDefaultFocusOnPress) {
                event.preventDefault();
            }
        }} accessibilityLabel={tooltipText} role={CONST_1.default.ROLE.BUTTON} style={function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return [
                styles.reportActionContextMenuMiniButton,
                StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(hovered, pressed, isDelayButtonStateComplete), true),
                isDelayButtonStateComplete && styles.cursorDefault,
            ];
        }}>
                {function (pressableState) { return (<react_native_1.View style={[StyleUtils.getWidthAndHeightStyle(variables_1.default.iconSizeNormal), styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {typeof children === 'function' ? children(pressableState) : children}
                    </react_native_1.View>); }}
            </PressableWithoutFeedback_1.default>
        </PopoverAnchorTooltip_1.default>);
}
BaseMiniContextMenuItem.displayName = 'BaseMiniContextMenuItem';
exports.default = react_1.default.forwardRef(BaseMiniContextMenuItem);
