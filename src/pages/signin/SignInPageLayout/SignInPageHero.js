"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
var SignInHeroCopy_1 = require("./SignInHeroCopy");
var SignInHeroImage_1 = require("./SignInHeroImage");
function SignInPageHero(_a) {
    var customHeadline = _a.customHeadline, customHeroBody = _a.customHeroBody;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _b = (0, useWindowDimensions_1.default)(), windowWidth = _b.windowWidth, windowHeight = _b.windowHeight;
    return (<react_native_1.View style={[
            StyleUtils.getHeight(windowHeight < variables_1.default.signInContentMinHeight ? variables_1.default.signInContentMinHeight : windowHeight),
            StyleUtils.getMinimumHeight(variables_1.default.signInContentMinHeight),
            windowWidth <= variables_1.default.tabletResponsiveWidthBreakpoint ? styles.flexColumn : styles.flexColumn,
            styles.pt20,
            StyleUtils.getMaximumWidth(variables_1.default.signInHeroContextMaxWidth),
            styles.alignSelfCenter,
        ]}>
            <react_native_1.View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
                <SignInHeroImage_1.default />
                <SignInHeroCopy_1.default customHeadline={customHeadline} customHeroBody={customHeroBody}/>
            </react_native_1.View>
        </react_native_1.View>);
}
SignInPageHero.displayName = 'SignInPageHero';
exports.default = SignInPageHero;
