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

// import EmptyStateBackgroundImage from '../../../../assets/images/empty-state_background-fade.png';
import SignInHeroBackgroundImage from '../../../../assets/images/home-background--desktop.svg';

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
                            style={[styles.flex1]}
                            contentContainerStyle={[styles.flex1]}
                        >
                            <View style={[{backgroundColor: 'forestgreen'}, styles.alignItemsCenter]}>
                                <SignInHeroBackgroundImage
                                    pointerEvents="none"
                                    height="100%"
                                    style={StyleUtils.getReportWelcomeBackgroundImageStyle(props.isSmallScreenWidth)}
                                />
                                <View style={[{maxWidth: 1360}, {backgroundColor: 'transparent'}, {paddingHorizontal: 40}]}>
                                    <View style={[{backgroundColor: 'transparent'}]}>
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
                        <View style={[styles.flex1, StyleUtils.getMinimumHeight(containerHeight)]}>
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
