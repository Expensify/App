"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ExpensifyWordmark_1 = require("@components/ExpensifyWordmark");
var FormElement_1 = require("@components/FormElement");
var OfflineIndicator_1 = require("@components/OfflineIndicator");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var SignInHeroImage_1 = require("./SignInHeroImage");
function SignInPageContent(_a) {
    var shouldShowWelcomeHeader = _a.shouldShowWelcomeHeader, welcomeHeader = _a.welcomeHeader, welcomeText = _a.welcomeText, shouldShowWelcomeText = _a.shouldShowWelcomeText, children = _a.children;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={[styles.flex1, styles.signInPageLeftContainer]}>
            <react_native_1.View style={[styles.flex1, styles.alignSelfCenter, styles.signInPageWelcomeFormContainer]}>
                {/* This empty view creates margin on the top of the sign in form which will shrink and grow depending on if the keyboard is open or not */}
                <react_native_1.View style={[styles.flexGrow1, shouldUseNarrowLayout ? styles.signInPageContentTopSpacerSmallScreens : styles.signInPageContentTopSpacer]}/>
                <react_native_1.View style={[styles.flexGrow2, styles.mb8]}>
                    <FormElement_1.default style={[styles.alignSelfStretch]}>
                        <react_native_1.View style={[shouldUseNarrowLayout ? styles.mb8 : styles.mb15, shouldUseNarrowLayout ? styles.alignItemsCenter : styles.alignSelfStart]}>
                            <ExpensifyWordmark_1.default />
                        </react_native_1.View>
                        <react_native_1.View style={[styles.signInPageWelcomeTextContainer]}>
                            {shouldShowWelcomeHeader && welcomeHeader ? (<Text_1.default style={[
                styles.loginHeroHeader,
                StyleUtils.getLineHeightStyle(variables_1.default.lineHeightSignInHeroXSmall),
                StyleUtils.getFontSizeStyle(variables_1.default.fontSizeSignInHeroXSmall),
                !welcomeText ? styles.mb5 : {},
                !shouldUseNarrowLayout ? styles.textAlignLeft : {},
                styles.mb5,
            ]}>
                                    {welcomeHeader}
                                </Text_1.default>) : null}
                            {shouldShowWelcomeText && welcomeText ? (<Text_1.default style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>{welcomeText}</Text_1.default>) : null}
                        </react_native_1.View>
                        {children}
                    </FormElement_1.default>
                    <react_native_1.View style={[styles.mb8, styles.signInPageWelcomeTextContainer, styles.alignSelfCenter]}>
                        <OfflineIndicator_1.default style={[styles.m0, styles.pl0, styles.alignItemsStart]}/>
                    </react_native_1.View>
                    {shouldUseNarrowLayout ? (<react_native_1.View style={[styles.mt8]}>
                            <SignInHeroImage_1.default />
                        </react_native_1.View>) : null}
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
SignInPageContent.displayName = 'SignInPageContent';
exports.default = SignInPageContent;
