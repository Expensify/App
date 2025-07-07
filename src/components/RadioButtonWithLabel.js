"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormHelpMessage_1 = require("./FormHelpMessage");
var Pressables = require("./Pressable");
var RadioButton_1 = require("./RadioButton");
var Text_1 = require("./Text");
var PressableWithFeedback = Pressables.PressableWithFeedback;
function RadioButtonWithLabel(_a) {
    var labelElement = _a.labelElement, style = _a.style, _b = _a.label, label = _b === void 0 ? '' : _b, _c = _a.hasError, hasError = _c === void 0 ? false : _c, _d = _a.errorText, errorText = _d === void 0 ? '' : _d, isChecked = _a.isChecked, onPress = _a.onPress, wrapperStyle = _a.wrapperStyle, shouldBlendOpacity = _a.shouldBlendOpacity;
    var styles = (0, useThemeStyles_1.default)();
    var defaultStyles = [styles.flexRow, styles.alignItemsCenter];
    if (!label && !labelElement) {
        throw new Error('Must provide at least label or labelComponent prop');
    }
    return (<>
            <react_native_1.View style={[defaultStyles, style]}>
                <RadioButton_1.default isChecked={isChecked} onPress={onPress} accessibilityLabel={label} hasError={hasError}/>
                <PressableWithFeedback tabIndex={-1} accessible={false} onPress={onPress} style={[styles.flexRow, styles.flexWrap, styles.flexShrink1, styles.alignItemsCenter]} wrapperStyle={[styles.flex1, styles.ml3, styles.pr2, wrapperStyle]} 
    // disable hover style when disabled
    hoverDimmingValue={0.8} pressDimmingValue={0.5} shouldBlendOpacity={shouldBlendOpacity}>
                    {!!label && <Text_1.default style={[styles.ml1]}>{label}</Text_1.default>}
                    {!!labelElement && labelElement}
                </PressableWithFeedback>
            </react_native_1.View>
            <FormHelpMessage_1.default message={errorText}/>
        </>);
}
RadioButtonWithLabel.displayName = 'RadioButtonWithLabel';
exports.default = RadioButtonWithLabel;
