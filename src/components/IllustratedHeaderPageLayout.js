"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var HeaderPageLayout_1 = require("./HeaderPageLayout");
var Lottie_1 = require("./Lottie");
function IllustratedHeaderPageLayout(_a) {
    var backgroundColor = _a.backgroundColor, children = _a.children, illustration = _a.illustration, testID = _a.testID, overlayContent = _a.overlayContent, rest = __rest(_a, ["backgroundColor", "children", "illustration", "testID", "overlayContent"]);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var shouldLimitHeight = !rest.shouldShowBackButton;
    return (<HeaderPageLayout_1.default backgroundColor={backgroundColor !== null && backgroundColor !== void 0 ? backgroundColor : theme.appBG} headerContent={<>
                    <Lottie_1.default source={illustration} style={styles.w100} webStyle={shouldLimitHeight ? styles.h100 : styles.w100} autoPlay loop/>
                    {overlayContent === null || overlayContent === void 0 ? void 0 : overlayContent()}
                </>} testID={testID} headerContainerStyles={[styles.justifyContentCenter, styles.w100, shouldLimitHeight && styles.centralPaneAnimation]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {children}
        </HeaderPageLayout_1.default>);
}
IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';
exports.default = IllustratedHeaderPageLayout;
