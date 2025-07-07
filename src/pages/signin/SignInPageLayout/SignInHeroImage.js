"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Lottie_1 = require("@components/Lottie");
var LottieAnimations_1 = require("@components/LottieAnimations");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@libs/actions/Session");
var variables_1 = require("@styles/variables");
function SignInHeroImage() {
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _a.shouldUseNarrowLayout, isMediumScreenWidth = _a.isMediumScreenWidth;
    var imageSize = (0, react_1.useMemo)(function () {
        if (shouldUseNarrowLayout) {
            return {
                height: variables_1.default.signInHeroImageMobileHeight,
                width: variables_1.default.signInHeroImageMobileWidth,
            };
        }
        return {
            height: isMediumScreenWidth ? variables_1.default.signInHeroImageTabletHeight : variables_1.default.signInHeroImageDesktopHeight,
            width: isMediumScreenWidth ? variables_1.default.signInHeroImageTabletWidth : variables_1.default.signInHeroImageDesktopWidth,
        };
    }, [shouldUseNarrowLayout, isMediumScreenWidth]);
    return (<Lottie_1.default source={LottieAnimations_1.default.Hands} loop autoPlay shouldLoadAfterInteractions={(0, Session_1.isAnonymousUser)()} style={[styles.alignSelfCenter, imageSize]} webStyle={__assign(__assign({}, styles.alignSelfCenter), imageSize)}/>);
}
SignInHeroImage.displayName = 'SignInHeroImage';
exports.default = SignInHeroImage;
