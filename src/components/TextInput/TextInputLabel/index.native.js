"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TextInputLabel(_a) {
    var label = _a.label, labelScale = _a.labelScale, labelTranslateY = _a.labelTranslateY;
    var styles = (0, useThemeStyles_1.default)();
    var animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return styles.textInputLabelTransformation(labelTranslateY, labelScale); });
    var animatedStyleForText = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return styles.textInputLabelTransformation(labelTranslateY, labelScale, true); });
    return (<react_native_reanimated_1.default.View style={[styles.textInputLabelContainer, animatedStyle]}>
            <react_native_reanimated_1.default.Text allowFontScaling={false} style={[styles.textInputLabel, animatedStyleForText]}>
                {label}
            </react_native_reanimated_1.default.Text>
        </react_native_reanimated_1.default.View>);
}
TextInputLabel.displayName = 'TextInputLabel';
exports.default = TextInputLabel;
