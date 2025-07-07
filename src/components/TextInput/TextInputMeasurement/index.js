"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
function TextInputMeasurement(_a) {
    var value = _a.value, placeholder = _a.placeholder, contentWidth = _a.contentWidth, autoGrowHeight = _a.autoGrowHeight, maxAutoGrowHeight = _a.maxAutoGrowHeight, width = _a.width, inputStyle = _a.inputStyle, inputPaddingLeft = _a.inputPaddingLeft, autoGrow = _a.autoGrow, isAutoGrowHeightMarkdown = _a.isAutoGrowHeightMarkdown, onSetTextInputWidth = _a.onSetTextInputWidth, onSetTextInputHeight = _a.onSetTextInputHeight, isPrefixCharacterPaddingCalculated = _a.isPrefixCharacterPaddingCalculated;
    var styles = (0, useThemeStyles_1.default)();
    return (<>
            {!!contentWidth && isPrefixCharacterPaddingCalculated && (<react_native_1.View style={[inputStyle, styles.hiddenElementOutsideOfWindow, styles.visibilityHidden, styles.wAuto, inputPaddingLeft]} onLayout={function (e) {
                if (e.nativeEvent.layout.width === 0 && e.nativeEvent.layout.height === 0) {
                    return;
                }
                onSetTextInputWidth(e.nativeEvent.layout.width);
                onSetTextInputHeight(e.nativeEvent.layout.height);
            }}>
                    <Text_1.default style={[
                inputStyle,
                autoGrowHeight && styles.autoGrowHeightHiddenInput(width !== null && width !== void 0 ? width : 0, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : undefined),
                { width: contentWidth },
            ]}>
                        {/* \u200B added to solve the issue of not expanding the text input enough when the value ends with '\n' (https://github.com/Expensify/App/issues/21271) */}
                        {value ? "".concat(value).concat(value.endsWith('\n') ? '\u200B' : '') : placeholder}
                    </Text_1.default>
                </react_native_1.View>)}
            {/*
             Text input component doesn't support auto grow by default.
             We're using a hidden text input to achieve that.
             This text view is used to calculate width or height of the input value given textStyle in this component.
             This Text component is intentionally positioned out of the screen.
         */}
            {(!!autoGrow || !!autoGrowHeight) && !isAutoGrowHeightMarkdown && (
        // Add +2 to width on Safari browsers so that text is not cut off due to the cursor or when changing the value
        // Reference: https://github.com/Expensify/App/issues/8158, https://github.com/Expensify/App/issues/26628
        // For mobile Chrome, ensure proper display of the text selection handle (blue bubble down).
        // Reference: https://github.com/Expensify/App/issues/34921
        <Text_1.default style={[
                inputStyle,
                autoGrowHeight && styles.autoGrowHeightHiddenInput(width !== null && width !== void 0 ? width : 0, typeof maxAutoGrowHeight === 'number' ? maxAutoGrowHeight : undefined),
                styles.hiddenElementOutsideOfWindow,
                styles.visibilityHidden,
            ]} onLayout={function (e) {
                if (e.nativeEvent.layout.width === 0 && e.nativeEvent.layout.height === 0) {
                    return;
                }
                var additionalWidth = 0;
                if ((0, Browser_1.isMobileSafari)() || (0, Browser_1.isSafari)() || (0, Browser_1.isMobileChrome)()) {
                    additionalWidth = 2;
                }
                onSetTextInputWidth(e.nativeEvent.layout.width + additionalWidth);
                onSetTextInputHeight(e.nativeEvent.layout.height);
            }}>
                    {/* \u200B added to solve the issue of not expanding the text input enough when the value ends with '\n' (https://github.com/Expensify/App/issues/21271) */}
                    {value ? "".concat(value).concat(value.endsWith('\n') ? '\u200B' : '') : placeholder}
                </Text_1.default>)}
        </>);
}
TextInputMeasurement.displayName = 'TextInputMeasurement';
exports.default = TextInputMeasurement;
