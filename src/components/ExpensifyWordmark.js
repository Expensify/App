"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_logo__adhoc_svg_1 = require("@assets/images/expensify-logo--adhoc.svg");
var expensify_logo__dev_svg_1 = require("@assets/images/expensify-logo--dev.svg");
var expensify_logo__staging_svg_1 = require("@assets/images/expensify-logo--staging.svg");
var expensify_wordmark_svg_1 = require("@assets/images/expensify-wordmark.svg");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ImageSVG_1 = require("./ImageSVG");
var logoComponents = (_a = {},
    _a[CONST_1.default.ENVIRONMENT.DEV] = expensify_logo__dev_svg_1.default,
    _a[CONST_1.default.ENVIRONMENT.STAGING] = expensify_logo__staging_svg_1.default,
    _a[CONST_1.default.ENVIRONMENT.PRODUCTION] = expensify_wordmark_svg_1.default,
    _a[CONST_1.default.ENVIRONMENT.ADHOC] = expensify_logo__adhoc_svg_1.default,
    _a);
function ExpensifyWordmark(_a) {
    var style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var environment = (0, useEnvironment_1.default)().environment;
    // PascalCase is required for React components, so capitalize the const here
    var LogoComponent = logoComponents[environment];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<react_native_1.View style={[
            StyleUtils.getSignInWordmarkWidthStyle(shouldUseNarrowLayout, environment),
            StyleUtils.getHeight(shouldUseNarrowLayout ? variables_1.default.signInLogoHeightSmallScreen : variables_1.default.signInLogoHeight),
            shouldUseNarrowLayout && (environment === CONST_1.default.ENVIRONMENT.DEV || environment === CONST_1.default.ENVIRONMENT.STAGING) ? styles.ml3 : {},
            style,
        ]}>
            <ImageSVG_1.default contentFit="contain" src={LogoComponent}/>
        </react_native_1.View>);
}
ExpensifyWordmark.displayName = 'ExpensifyWordmark';
exports.default = ExpensifyWordmark;
