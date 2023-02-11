import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import SignInPageContent from './SignInPageContent';
import Footer from './Footer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import SignInPageGraphics from './SignInPageGraphics';
import * as StyleUtils from '../../../styles/StyleUtils';

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
    let containerStyles = [styles.flex1];

    // , styles.signInPageInner];
    let contentContainerStyles = [styles.flex1, styles.flexRow];

    if (props.isSmallScreenWidth) {
        containerStyles = [];
        contentContainerStyles = [styles.flex1, styles.flexColumn];
    }

    return (
        <View style={containerStyles}>
            {!props.isSmallScreenWidth ? (
                <View style={contentContainerStyles}>
                    <SignInPageContent
                        welcomeText={props.welcomeText}
                        shouldShowWelcomeText={props.shouldShowWelcomeText}
                    >
                        {props.children}
                    </SignInPageContent>
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={[styles.flexGrow1, styles.flexColumn]}
                    >
                        <SignInPageGraphics />
                        <Footer />
                    </ScrollView>
                </View>
            )
                : (
                    <ScrollView

                        // To scroll on both mobile and web, we need to set the container height manually
                        style={StyleUtils.getHeight(1 + props.windowHeight)}
                        contentContainerStyle={[styles.flexGrow1]}
                    >
                        <SignInPageContent
                            welcomeText={props.welcomeText}
                            shouldShowWelcomeText={props.shouldShowWelcomeText}
                        >
                            {props.children}
                        </SignInPageContent>
                        <Footer />
                    </ScrollView>
                )}
        </View>
    );
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
