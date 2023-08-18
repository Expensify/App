import React, {useRef, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import SignInPageContent from './SignInPageContent';
import Footer from './Footer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import SignInPageHero from '../SignInPageHero';
import * as StyleUtils from '../../../styles/StyleUtils';
import scrollViewContentContainerStyles from './signInPageStyles';
import themeColors from '../../../styles/themes/default';
import BackgroundImage from './BackgroundImage';
import SignInGradient from '../../../../assets/images/home-fade-gradient.svg';
import variables from '../../../styles/variables';
import usePrevious from '../../../hooks/usePrevious';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (for example, sign in) */
    welcomeText: PropTypes.string.isRequired,

    /** Welcome header to show in the header of the form, changes depending
     * on form type (for example, sign in) and small vs large screens */
    welcomeHeader: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    /** Whether to show welcome header on a particular page */
    shouldShowWelcomeHeader: PropTypes.bool.isRequired,

    /** Override the green headline copy */
    customHeadline: PropTypes.string,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    customHeadline: '',
};

function SignInPageLayout(props) {
    const scrollViewRef = useRef();
    const prevPreferredLocale = usePrevious(props.preferredLocale);
    let containerStyles = [styles.flex1, styles.signInPageInner];
    let contentContainerStyles = [styles.flex1, styles.flexRow];

    // To scroll on both mobile and web, we need to set the container height manually
    const containerHeight = props.windowHeight - props.insets.top - props.insets.bottom;

    if (props.isSmallScreenWidth) {
        containerStyles = [styles.flex1];
        contentContainerStyles = [styles.flex1, styles.flexColumn];
    }

    const scrollPageToTop = (animated = false) => {
        if (!scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: 0, animated});
    };

    useEffect(() => {
        if (prevPreferredLocale !== props.preferredLocale) {
            return;
        }

        scrollPageToTop();
    }, [props.welcomeHeader, props.welcomeText, prevPreferredLocale, props.preferredLocale]);

    return (
        <View style={containerStyles}>
            {!props.isSmallScreenWidth ? (
                <View style={contentContainerStyles}>
                    <SignInPageContent
                        welcomeHeader={props.welcomeHeader}
                        welcomeText={props.welcomeText}
                        shouldShowWelcomeText={props.shouldShowWelcomeText}
                        shouldShowWelcomeHeader={props.shouldShowWelcomeHeader}
                    >
                        {props.children}
                    </SignInPageContent>
                    <ScrollView
                        style={[styles.flex1, StyleUtils.getBackgroundColorStyle(themeColors.signInPage)]}
                        contentContainerStyle={[styles.flex1]}
                        ref={scrollViewRef}
                    >
                        <View style={[styles.flex1]}>
                            <View style={styles.signInPageHeroCenter}>
                                <BackgroundImage
                                    isSmallScreen={false}
                                    pointerEvents="none"
                                    width={variables.signInHeroBackgroundWidth}
                                />
                            </View>
                            <View>
                                <View style={[styles.t0, styles.l0, styles.h100, styles.pAbsolute, styles.signInPageGradient]}>
                                    <SignInGradient
                                        height="100%"
                                        preserveAspectRatio="none"
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.alignSelfCenter,
                                        StyleUtils.getMaximumWidth(variables.signInContentMaxWidth),
                                        props.isMediumScreenWidth ? styles.ph10 : {},
                                        props.isLargeScreenWidth ? styles.ph25 : {},
                                    ]}
                                >
                                    <SignInPageHero customHeadline={props.customHeadline} />
                                    <Footer scrollPageToTop={scrollPageToTop} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={scrollViewContentContainerStyles}
                    keyboardShouldPersistTaps="handled"
                    ref={scrollViewRef}
                >
                    <View style={[styles.flex1, styles.flexColumn, StyleUtils.getMinimumHeight(Math.max(variables.signInContentMinHeight, containerHeight))]}>
                        <BackgroundImage
                            isSmallScreen
                            pointerEvents="none"
                            width={variables.signInHeroBackgroundWidthMobile}
                        />
                        <SignInPageContent
                            welcomeHeader={props.welcomeHeader}
                            welcomeText={props.welcomeText}
                            shouldShowWelcomeText={props.shouldShowWelcomeText}
                            shouldShowWelcomeHeader={props.shouldShowWelcomeHeader}
                        >
                            {props.children}
                        </SignInPageContent>
                    </View>
                    <View style={[styles.flex0]}>
                        <Footer scrollPageToTop={scrollPageToTop} />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';
SignInPageLayout.defaultProps = defaultProps;

export default compose(withWindowDimensions, withSafeAreaInsets, withLocalize)(SignInPageLayout);
