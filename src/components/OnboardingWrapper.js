"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FocusTrapForScreen_1 = require("./FocusTrap/FocusTrapForScreen");
function OnboardingWrapper(_a) {
    var children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return (<FocusTrapForScreen_1.default>
            <react_native_1.View style={styles.h100}>{children}</react_native_1.View>
        </FocusTrapForScreen_1.default>);
}
OnboardingWrapper.displayName = 'OnboardingWrapper';
exports.default = OnboardingWrapper;
