import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import SignInPageContent from './SignInPageContent';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import SVGImage from '../../../components/SVGImage';
import styles from '../../../styles/styles';
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

    if (props.isSmallScreenWidth) {
        return content;
    }

    return (
        <View style={[styles.flex1, styles.signInPageInner]}>
            <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
                {content}
                <View style={[
                    styles.flexGrow1,
                    StyleUtils.getBackgroundColorStyle(backgroundStyle.backgroundColor),
                    props.isMediumScreenWidth && styles.alignItemsCenter,
                ]}
                >
                    <SVGImage
                        width="100%"
                        height="100%"
                        src={backgroundStyle.backgroundImageUri}
                        resizeMode={props.isMediumScreenWidth ? 'contain' : 'cover'}
                    />
                </View>
            </View>
        </View>
    );
};

SignInPageLayout.propTypes = propTypes;
SignInPageLayout.displayName = 'SignInPageLayout';

export default withWindowDimensions(SignInPageLayout);
