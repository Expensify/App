import React from 'react';
import {View, ScrollView} from 'react-native';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import SignInPageContent from './SignInPageContent';
import Footer from './Footer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import SignInPageHero from '../SignInPageHero';
import * as StyleUtils from '../../../styles/StyleUtils';
import scrollViewContentContainerStyles from './signInPageStyles';

import themeColors from '../../../styles/themes/default';

// import GradientBG from '../../../../assets/images/home-fade-gradient.svg';

// import EmptyStateBackgroundImage from '../../../../assets/images/empty-state_background-fade.png';
import SignInHeroBackgroundImage from '../../../../assets/images/home-background--desktop.svg';
import SignInHeroBackgroundImageMobile from '../../../../assets/images/home-background--mobile.svg';
import variables from '../../../styles/variables';

const propTypes = {
    /** The children to show inside the layout */
    children: PropTypes.node.isRequired,

    /** Welcome text to show in the header of the form, changes depending
     * on form type (set password, sign in, etc.) */
    welcomeText: PropTypes.string.isRequired,

    /** Whether to show welcome text on a particular page */
    shouldShowWelcomeText: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const SignInPageLayout = (props) => {
    let containerStyles = [styles.flex1, styles.signInPageInner];
    let contentContainerStyles = [styles.flex1, styles.flexRow];

    // To scroll on both mobile and web, we need to set the container height manually
    const containerHeight = props.windowHeight - props.insets.top - props.insets.bottom;

    if (props.isSmallScreenWidth) {
        containerStyles = [styles.flex1];
        contentContainerStyles = [styles.flex1, styles.flexColumn];
    }

    return (
        <View style={containerStyles}>
            {!props.isSmallScreenWidth
                ? (
                    <View style={contentContainerStyles}>
                        <SignInPageContent
                            welcomeText={props.welcomeText}
                            shouldShowWelcomeText={props.shouldShowWelcomeText}
                        >
                            {props.children}
                        </SignInPageContent>
                        <ScrollView
                            style={[styles.flex1, {backgroundColor: themeColors.signInPage}]}
                            contentContainerStyle={[styles.flex1]}
                        >
                            {/* <View style={[styles.signInPageGradient, {left: variables.sideBarWidth, bottom: 0}]} /> */}
                            {/* <View style={styles.signInPageGradient} /> */}
                            {/* <GradientBG
                                preserveAspectRatio="xMinYMin slice"
                                style={{
                                    height: '100%',
                                    position: 'absolute',
                                    preserveAspectRatio: 'xMinYMin slice',
                                    left: 0,
                                    top: containerHeight,
                                }}
                            /> */}
                            <View style={[styles.flex1, styles.alignItemsCenter]}>
                                <SignInHeroBackgroundImage
                                    pointerEvents="none"
                                    height="100%"
                                    style={{
                                        height: '100%',
                                        width: 'auto',
                                        position: 'absolute',
                                    }}
                                />
                                {/* <View style={[styles.signInPageGradient]} /> */}
                                {/* <View style={[styles.signInPageGradient, {position: 'relative'}]} /> */}
                                {/* <GradientBG
                                    height="100%"
                                    preserveAspectRatio="xMinYMin slice"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                    }}
                                /> */}
                                <View style={[{maxWidth: variables.signInHeroContentMaxWidth}, {backgroundColor: 'transparent'}, props.isMediumScreenWidth ? {paddingHorizontal: 40} : {},
                                    props.isLargeScreenWidth ? {paddingHorizontal: 100} : {}]}
                                >
                                    <View style={[{backgroundColor: ''}]}>
                                        {/* <View style={[styles.signInPageGradient, {position: 'relative'}]} /> */}
                                        <View style={[styles.signInPageGradient, {left: props.isMediumScreenWidth ? -40 : -100}]} />
                                        <SignInPageHero />
                                        <Footer />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={scrollViewContentContainerStyles}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={[styles.flex1, styles.flexColumn, StyleUtils.getMinimumHeight(Math.max(variables.signInContentMinHeight, containerHeight))]}>
                            <SignInHeroBackgroundImageMobile
                                pointerEvents="none"
                                height="100%"
                                width={props.windowWidth * 2}
                                style={{
                                    position: 'absolute',
                                    alignSelf: 'center',
                                    bottom: '-35%',
                                }}
                            />
                            <SignInPageContent
                                welcomeText={props.welcomeText}
                                shouldShowWelcomeText={props.shouldShowWelcomeText}
                            >
                                {props.children}
                            </SignInPageContent>
                        </View>
                        <View style={[styles.flex0]}>
                            <Footer />
                        </View>
                    </ScrollView>
                )}
        </View>
    );
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default compose(
    withWindowDimensions,
    withSafeAreaInsets,
)(SignInPageLayout);
