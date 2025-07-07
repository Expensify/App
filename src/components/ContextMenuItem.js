"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThrottledButtonState_1 = require("@hooks/useThrottledButtonState");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var getButtonState_1 = require("@libs/getButtonState");
var BaseMiniContextMenuItem_1 = require("./BaseMiniContextMenuItem");
var FocusableMenuItem_1 = require("./FocusableMenuItem");
var Icon_1 = require("./Icon");
function ContextMenuItem(_a, ref) {
    var onPress = _a.onPress, successIcon = _a.successIcon, _b = _a.successText, successText = _b === void 0 ? '' : _b, icon = _a.icon, text = _a.text, _c = _a.isMini, isMini = _c === void 0 ? false : _c, _d = _a.description, description = _d === void 0 ? '' : _d, _e = _a.isAnonymousAction, isAnonymousAction = _e === void 0 ? false : _e, _f = _a.isFocused, isFocused = _f === void 0 ? false : _f, _g = _a.shouldLimitWidth, shouldLimitWidth = _g === void 0 ? true : _g, wrapperStyle = _a.wrapperStyle, _h = _a.shouldPreventDefaultFocusOnPress, shouldPreventDefaultFocusOnPress = _h === void 0 ? true : _h, _j = _a.buttonRef, buttonRef = _j === void 0 ? { current: null } : _j, _k = _a.onFocus, onFocus = _k === void 0 ? function () { } : _k, _l = _a.onBlur, onBlur = _l === void 0 ? function () { } : _l, _m = _a.disabled, disabled = _m === void 0 ? false : _m, _o = _a.shouldShowLoadingSpinnerIcon, shouldShowLoadingSpinnerIcon = _o === void 0 ? false : _o;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var _p = (0, useThrottledButtonState_1.default)(), isThrottledButtonActive = _p[0], setThrottledButtonInactive = _p[1];
    var triggerPressAndUpdateSuccess = function (event) {
        if (!isThrottledButtonActive) {
            return;
        }
        onPress(event);
        // We only set the success state when we have icon or text to represent the success state
        // We may want to replace this check by checking the Result from OnPress Callback in future.
        if (!!successIcon || successText) {
            setThrottledButtonInactive();
        }
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({ triggerPressAndUpdateSuccess: triggerPressAndUpdateSuccess }); });
    var itemIcon = !isThrottledButtonActive && successIcon ? successIcon : icon;
    var itemText = !isThrottledButtonActive && successText ? successText : text;
    return isMini ? (<BaseMiniContextMenuItem_1.default ref={buttonRef} tooltipText={itemText} onPress={triggerPressAndUpdateSuccess} isDelayButtonStateComplete={!isThrottledButtonActive} shouldPreventDefaultFocusOnPress={shouldPreventDefaultFocusOnPress}>
            {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<Icon_1.default small src={itemIcon} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed, !isThrottledButtonActive))}/>);
        }}
        </BaseMiniContextMenuItem_1.default>) : (<FocusableMenuItem_1.default title={itemText} icon={itemIcon} onPress={triggerPressAndUpdateSuccess} wrapperStyle={[styles.pr8, wrapperStyle]} success={!isThrottledButtonActive} description={description} descriptionTextStyle={styles.breakWord} style={shouldLimitWidth && StyleUtils.getContextMenuItemStyles(windowWidth)} isAnonymousAction={isAnonymousAction} focused={isFocused} interactive={isThrottledButtonActive} onFocus={onFocus} onBlur={onBlur} disabled={disabled} shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}/>);
}
ContextMenuItem.displayName = 'ContextMenuItem';
exports.default = (0, react_1.forwardRef)(ContextMenuItem);
