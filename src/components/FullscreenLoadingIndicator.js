"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function FullScreenLoadingIndicator(_a) {
    var style = _a.style, _b = _a.iconSize, iconSize = _b === void 0 ? 'large' : _b, _c = _a.testID, testID = _c === void 0 ? '' : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <react_native_1.ActivityIndicator color={theme.spinner} size={iconSize} testID={testID}/>
        </react_native_1.View>);
}
FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';
exports.default = FullScreenLoadingIndicator;
