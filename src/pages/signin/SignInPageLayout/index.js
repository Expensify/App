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

    const containerStyles = [];
    const contentContainerStyles = [styles.flex1];

    const isLongMediumScreenWidth = props.isMediumScreenWidth && props.windowHeight >= variables.minHeightToShowGraphics;

    if (props.isSmallScreenWidth) {
        containerStyles.push(styles.flex1);
    } else if (isLongMediumScreenWidth) {
        containerStyles.push(styles.dFlex, styles.signInPageInner, styles.flexColumnReverse, styles.justifyContentBetween);
    } else {
        containerStyles.push(styles.flex1, styles.signInPageInner);
        contentContainerStyles.push(styles.flexRow);
    }

    return (
        <View style={containerStyles}>
            {isLongMediumScreenWidth && graphicLayout}
            <View style={contentContainerStyles}>
                {content}
                {!props.isSmallScreenWidth && !isLongMediumScreenWidth && graphicLayout}
            </View>
        </View>
    );
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
