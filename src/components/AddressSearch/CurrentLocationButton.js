"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var colors_1 = require("@styles/theme/colors");
function CurrentLocationButton(_a) {
    var onPress = _a.onPress, _b = _a.isDisabled, isDisabled = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<PressableWithFeedback_1.default style={[styles.flexRow, styles.pv4, styles.ph3, isDisabled && styles.buttonOpacityDisabled]} hoverStyle={StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(true), true)} onPress={function () { return onPress === null || onPress === void 0 ? void 0 : onPress(); }} accessibilityLabel={translate('location.useCurrent')} disabled={isDisabled} onMouseDown={function (e) { return e.preventDefault(); }} onTouchStart={function (e) { return e.preventDefault(); }}>
            <Icon_1.default src={Expensicons.Location} fill={colors_1.default.green}/>
            <Text_1.default style={[styles.textLabel, styles.mh2, isDisabled && styles.userSelectNone]}>{translate('location.useCurrent')}</Text_1.default>
        </PressableWithFeedback_1.default>);
}
CurrentLocationButton.displayName = 'CurrentLocationButton';
exports.default = CurrentLocationButton;
