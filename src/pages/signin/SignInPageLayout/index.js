import _ from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import SignInPageContent from './SignInPageContent';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import SVGImage from '../../../components/SVGImage';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import * as Link from '../../../libs/actions/Link';
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

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const SignInPageLayout = (props) => {
    const content = (
        <SignInPageContent
            welcomeText={props.welcomeText}
            shouldShowWelcomeText={props.shouldShowWelcomeText}
        >
            {props.children}
        </SignInPageContent>
    );

    const hasRedirect = !_.isEmpty(backgroundStyle.redirectUri);

    const graphicLayout = (
        <Pressable
            style={[
                styles.flex1,
                StyleUtils.getBackgroundColorStyle(backgroundStyle.backgroundColor),
            ]}
            onPress={() => {
                Link.openExternalLink(backgroundStyle.redirectUri);
            }}
            disabled={!hasRedirect}
        >
            <SVGImage
                width="100%"
                height="100%"
                src={backgroundStyle.backgroundImageUri}
                resizeMode="contain"
            />
        </Pressable>
    );

    if (props.isSmallScreenWidth) {
        return content;
    }

    if (props.isMediumScreenWidth && props.windowHeight >= variables.minHeightToShowGraphics) {
        return (
            <View style={[styles.dFlex, styles.signInPageInner, styles.flexColumnReverse, styles.justifyContentBetween]}>
                {graphicLayout}
                <View style={styles.flex1}>
                    {content}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.signInPageInner]}>
            <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
                {content}
                {graphicLayout}
            </View>
        </View>
    );
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
