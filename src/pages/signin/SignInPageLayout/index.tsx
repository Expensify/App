import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import {View} from 'react-native';
import SignInGradient from '@assets/images/home-fade-gradient.svg';
import ImageSVG from '@components/ImageSVG';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BackgroundImage from './BackgroundImage';
import Footer from './Footer';
import SignInPageContent from './SignInPageContent';
import SignInPageHero from './SignInPageHero';
import scrollViewContentContainerStyles from './signInPageStyles';
import type {SignInPageLayoutProps, SignInPageLayoutRef} from './types';

function SignInPageLayout(
    {
        customHeadline,
        customHeroBody,
        shouldShowWelcomeHeader = false,
        welcomeHeader,
        welcomeText = '',
        shouldShowWelcomeText = false,
        navigateFocus = () => {},
        children,
    }: SignInPageLayoutProps,
    ref: ForwardedRef<SignInPageLayoutRef>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {preferredLocale} = useLocalize();
    const {top: topInsets, bottom: bottomInsets} = useSafeAreaInsets();
    const scrollViewRef = useRef<RNScrollView>(null);
    const prevPreferredLocale = usePrevious(preferredLocale);
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

    useEffect(() => {
        if (prevPreferredLocale !== preferredLocale) {
            return;
        }

        scrollPageToTop();
    }, [welcomeHeader, welcomeText, prevPreferredLocale, preferredLocale]);

    const scrollViewStyles = useMemo(() => scrollViewContentContainerStyles(styles), [styles]);

    const backgroundImageHeight = Math.max(variables.signInContentMinHeight, containerHeight);

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
                                    pointerEvents="none"
                                    width={variables.signInHeroBackgroundWidth}
                                    transitionDuration={CONST.BACKGROUND_IMAGE_TRANSITION_DURATION}
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
                    <View
                        style={[
                            styles.flex1,
                            styles.flexColumn,
                            Browser.isMobileSafari() ? styles.overflowHidden : {},
                            StyleUtils.getMinimumHeight(backgroundImageHeight),
                            StyleUtils.getSignInBgStyles(theme),
                        ]}
                    >
                        <View style={[styles.pAbsolute, styles.w100, StyleUtils.getHeight(backgroundImageHeight), StyleUtils.getBackgroundColorStyle(theme.highlightBG)]}>
                            <BackgroundImage
                                isSmallScreen
                                pointerEvents="none"
                                width={variables.signInHeroBackgroundWidthMobile}
                                transitionDuration={CONST.BACKGROUND_IMAGE_TRANSITION_DURATION}
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

SignInPageLayout.displayName = 'SignInPageLayout';

export default forwardRef(SignInPageLayout);
