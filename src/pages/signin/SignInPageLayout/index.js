"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var home_fade_gradient_svg_1 = require("@assets/images/home-fade-gradient.svg");
var ImageSVG_1 = require("@components/ImageSVG");
var ScrollView_1 = require("@components/ScrollView");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var DomUtils_1 = require("@libs/DomUtils");
var getPlatform_1 = require("@libs/getPlatform");
// eslint-disable-next-line no-restricted-imports
var theme_1 = require("@styles/theme");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var BackgroundImage_1 = require("./BackgroundImage");
var Footer_1 = require("./Footer");
var SignInPageContent_1 = require("./SignInPageContent");
var SignInPageHero_1 = require("./SignInPageHero");
var signInPageStyles_1 = require("./signInPageStyles");
function SignInPageLayout(_a, ref) {
    var customHeadline = _a.customHeadline, customHeroBody = _a.customHeroBody, _b = _a.shouldShowWelcomeHeader, shouldShowWelcomeHeader = _b === void 0 ? false : _b, welcomeHeader = _a.welcomeHeader, _c = _a.welcomeText, welcomeText = _c === void 0 ? '' : _c, _d = _a.shouldShowWelcomeText, shouldShowWelcomeText = _d === void 0 ? false : _d, _e = _a.navigateFocus, navigateFocus = _e === void 0 ? function () { } : _e, children = _a.children;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _f = (0, useSafeAreaInsets_1.default)(), topInsets = _f.top, bottomInsets = _f.bottom;
    var scrollViewRef = (0, react_1.useRef)(null);
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var _g = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _g.shouldUseNarrowLayout, isMediumScreenWidth = _g.isMediumScreenWidth, isLargeScreenWidth = _g.isLargeScreenWidth;
    var _h = (0, react_1.useMemo)(function () { return ({
        containerStyles: shouldUseNarrowLayout ? [styles.flex1] : [styles.flex1, styles.signInPageInner],
        contentContainerStyles: [styles.flex1, shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow],
    }); }, [shouldUseNarrowLayout, styles]), containerStyles = _h.containerStyles, contentContainerStyles = _h.contentContainerStyles;
    // To scroll on both mobile and web, we need to set the container height manually
    var containerHeight = windowHeight - topInsets - bottomInsets;
    var scrollPageToTop = function (animated) {
        if (animated === void 0) { animated = false; }
        if (!scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({ y: 0, animated: animated });
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        scrollPageToTop: scrollPageToTop,
    }); });
    var scrollViewStyles = (0, react_1.useMemo)(function () { return (0, signInPageStyles_1.default)(styles); }, [styles]);
    var backgroundImageHeight = Math.max(variables_1.default.signInContentMinHeight, containerHeight);
    /*
    SignInPageLayout always has a dark theme regardless of the app theme. ThemeProvider sets auto-fill input styles globally so different ThemeProviders conflict and auto-fill input styles are incorrectly applied for this component.
    Add a class to `body` when this component stays mounted and remove it when the component dismounts.
    A new styleID is added with dark theme text with more specific css selector using this added cssClass.
    */
    var cssClass = 'sign-in-page-layout';
    DomUtils_1.default.addCSS(DomUtils_1.default.getAutofilledInputStyle(theme_1.default[CONST_1.default.THEME.DARK].text, ".".concat(cssClass)), 'sign-in-autofill-input');
    (0, react_1.useEffect)(function () {
        var isWeb = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB;
        var isDesktop = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.DESKTOP;
        if (!isWeb && !isDesktop) {
            return;
        }
        // add css class to body only for web and desktop
        document.body.classList.add(cssClass);
        return function () {
            document.body.classList.remove(cssClass);
        };
    }, []);
    return (<react_native_1.View style={containerStyles}>
            {!shouldUseNarrowLayout ? (<react_native_1.View style={contentContainerStyles}>
                    <ScrollView_1.default keyboardShouldPersistTaps="handled" style={[styles.signInPageLeftContainerWide, styles.flex1]} contentContainerStyle={[styles.flex1]}>
                        <SignInPageContent_1.default welcomeHeader={welcomeHeader} welcomeText={welcomeText} shouldShowWelcomeText={shouldShowWelcomeText} shouldShowWelcomeHeader={shouldShowWelcomeHeader}>
                            {children}
                        </SignInPageContent_1.default>
                    </ScrollView_1.default>
                    <ScrollView_1.default style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.signInPage)]} contentContainerStyle={[styles.flex1]} ref={scrollViewRef}>
                        <react_native_1.View style={[styles.flex1]}>
                            <react_native_1.View style={styles.signInPageHeroCenter}>
                                <BackgroundImage_1.default isSmallScreen={false} pointerEvents="none" width={variables_1.default.signInHeroBackgroundWidth} transitionDuration={CONST_1.default.BACKGROUND_IMAGE_TRANSITION_DURATION}/>
                            </react_native_1.View>
                            <react_native_1.View>
                                <react_native_1.View style={[styles.t0, styles.l0, styles.h100, styles.pAbsolute, styles.signInPageGradient]}>
                                    <ImageSVG_1.default src={home_fade_gradient_svg_1.default} height="100%" preserveAspectRatio="none"/>
                                </react_native_1.View>
                                <react_native_1.View style={[
                styles.alignSelfCenter,
                StyleUtils.getMaximumWidth(variables_1.default.signInContentMaxWidth),
                isMediumScreenWidth ? styles.ph10 : {},
                isLargeScreenWidth ? styles.ph25 : {},
            ]}>
                                    <SignInPageHero_1.default customHeadline={customHeadline} customHeroBody={customHeroBody}/>
                                    <Footer_1.default navigateFocus={navigateFocus}/>
                                </react_native_1.View>
                            </react_native_1.View>
                        </react_native_1.View>
                    </ScrollView_1.default>
                </react_native_1.View>) : (<ScrollView_1.default contentContainerStyle={scrollViewStyles} keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
                    <react_native_1.View style={[
                styles.flex1,
                styles.flexColumn,
                (0, Browser_1.isMobileSafari)() ? styles.overflowHidden : {},
                StyleUtils.getMinimumHeight(backgroundImageHeight),
                StyleUtils.getSignInBgStyles(theme),
            ]}>
                        <react_native_1.View style={[styles.pAbsolute, styles.w100, StyleUtils.getHeight(backgroundImageHeight), StyleUtils.getBackgroundColorStyle(theme.highlightBG)]}>
                            <BackgroundImage_1.default isSmallScreen pointerEvents="none" width={variables_1.default.signInHeroBackgroundWidthMobile} transitionDuration={CONST_1.default.BACKGROUND_IMAGE_TRANSITION_DURATION}/>
                        </react_native_1.View>
                        <SignInPageContent_1.default welcomeHeader={welcomeHeader} welcomeText={welcomeText} shouldShowWelcomeText={shouldShowWelcomeText} shouldShowWelcomeHeader={shouldShowWelcomeHeader}>
                            {children}
                        </SignInPageContent_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.flex0]}>
                        <Footer_1.default navigateFocus={navigateFocus}/>
                    </react_native_1.View>
                </ScrollView_1.default>)}
        </react_native_1.View>);
}
SignInPageLayout.displayName = 'SignInPageLayout';
exports.default = (0, react_1.forwardRef)(SignInPageLayout);
