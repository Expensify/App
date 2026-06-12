import React, {useEffect, useImperativeHandle, useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {View} from 'react-native';
import SignInGradient from '@assets/images/home-fade-gradient.svg';
import ImageSVG from '@components/ImageSVG';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobileSafari} from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import getPlatform from '@libs/getPlatform';
// eslint-disable-next-line no-restricted-imports
import themes from '@styles/theme';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BackgroundImage from './BackgroundImage';
import Footer from './Footer';
import SignInPageContent from './SignInPageContent';
import SignInPageHero from './SignInPageHero';
import scrollViewContentContainerStyles from './signInPageStyles';
import type {SignInPageLayoutProps} from './types';

function SignInPageLayout({
    customHeadline,
    customHeroBody,
    shouldShowWelcomeHeader = false,
    welcomeHeader,
    welcomeText = '',
    shouldShowWelcomeText = false,
    navigateFocus = () => {},
    children,
    ref,
}: SignInPageLayoutProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {top: topInsets, bottom: bottomInsets} = useSafeAreaInsets();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout, isMediumScreenWidth, isLargeScreenWidth} = useResponsiveLayout();

    const {containerStyles, contentContainerStyles} = useMemo(
        () => ({
            containerStyles: shouldUseNarrowLayout ? [styles.flex1] : [styles.flex1, styles.signInPageInner],
            contentContainerStyles: [styles.flex1, shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow],
        }),
        [shouldUseNarrowLayout, styles],
    );

    // To scroll on both mobile and web, we need to set the container height manually
    const containerHeight = windowHeight - topInsets - bottomInsets;

    const scrollPageToTop = (animated = false) => {
        if (!scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: 0, animated});
    };

    useImperativeHandle(ref, () => ({
        scrollPageToTop,
    }));

    const scrollViewStyles = useMemo(() => scrollViewContentContainerStyles(styles), [styles]);

    const backgroundImageHeight = Math.max(variables.signInContentMinHeight, containerHeight);

    /*
    SignInPageLayout always has a dark theme regardless of the app theme. ThemeProvider sets auto-fill input styles globally so different ThemeProviders conflict and auto-fill input styles are incorrectly applied for this component.
    Add a class to `body` when this component stays mounted and remove it when the component dismounts.
    A new styleID is added with dark theme text with more specific css selector using this added cssClass.
    */
    const cssClass = 'sign-in-page-layout';
    DomUtils.addCSS(DomUtils.getAutofilledInputStyle(themes[CONST.THEME.DARK].text, `.${cssClass}`), 'sign-in-autofill-input');

    useEffect(() => {
        const isWeb = getPlatform() === CONST.PLATFORM.WEB;
        if (!isWeb) {
            return;
        }
        // add css class to body only for web
        document.body.classList.add(cssClass);
        return () => {
            document.body.classList.remove(cssClass);
        };
    }, []);

    return (
        <View style={containerStyles}>
            {!shouldUseNarrowLayout ? (
                <View style={contentContainerStyles}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        style={[styles.signInPageLeftContainerWide, styles.flex1]}
                        contentContainerStyle={[styles.flex1]}
                    >
                        <SignInPageContent
                            welcomeHeader={welcomeHeader}
                            welcomeText={welcomeText}
                            shouldShowWelcomeText={shouldShowWelcomeText}
                            shouldShowWelcomeHeader={shouldShowWelcomeHeader}
                        >
                            {children}
                        </SignInPageContent>
                    </ScrollView>
                    <ScrollView
                        style={[styles.flex1, StyleUtils.getBackgroundColorStyle(theme.signInPage)]}
                        contentContainerStyle={[styles.flex1]}
                        ref={scrollViewRef}
                    >
                        <View style={[styles.flex1]}>
                            <View style={styles.signInPageHeroCenter}>
                                <BackgroundImage
                                    isSmallScreen={false}
                                    width={variables.signInHeroBackgroundWidth}
                                />
                            </View>
                            <View>
                                <View style={[styles.t0, styles.l0, styles.h100, styles.pAbsolute, styles.signInPageGradient]}>
                                    <ImageSVG
                                        src={SignInGradient}
                                        height="100%"
                                        preserveAspectRatio="none"
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.alignSelfCenter,
                                        StyleUtils.getMaximumWidth(variables.signInContentMaxWidth),
                                        isMediumScreenWidth ? styles.ph10 : {},
                                        isLargeScreenWidth ? styles.ph25 : {},
                                    ]}
                                >
                                    <SignInPageHero
                                        customHeadline={customHeadline}
                                        customHeroBody={customHeroBody}
                                    />
                                    <Footer navigateFocus={navigateFocus} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={scrollViewStyles}
                    keyboardShouldPersistTaps="handled"
                    ref={scrollViewRef}
                >
                    <View style={[styles.flex1, styles.flexColumn, isMobileSafari() ? styles.overflowHidden : {}, StyleUtils.getMinimumHeight(backgroundImageHeight)]}>
                        <View style={[styles.pAbsolute, styles.b0, styles.w100, StyleUtils.getHeight(backgroundImageHeight), StyleUtils.getBackgroundColorStyle(theme.highlightBG)]}>
                            <BackgroundImage
                                isSmallScreen
                                width={variables.signInHeroBackgroundWidthMobile}
                            />
                        </View>
                        <SignInPageContent
                            welcomeHeader={welcomeHeader}
                            welcomeText={welcomeText}
                            shouldShowWelcomeText={shouldShowWelcomeText}
                            shouldShowWelcomeHeader={shouldShowWelcomeHeader}
                        >
                            {children}
                        </SignInPageContent>
                    </View>
                    <View style={[styles.flex0]}>
                        <Footer navigateFocus={navigateFocus} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

export default SignInPageLayout;
