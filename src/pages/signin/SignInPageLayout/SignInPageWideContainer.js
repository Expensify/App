import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import SVGImage from '../../../components/SVGImage';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    /** The children to show inside the Container */
    children: PropTypes.node.isRequired,

    ...windowDimensionsPropTypes,
};

const backgroundStyle = StyleUtils.getLoginPagePromoStyle();

const SignInPageWideContainer = props => (
    <View style={[styles.flex1, styles.signInPageInner]}>
        <View style={[styles.flex1, styles.flexRow, styles.flexGrow1]}>
            {props.children}
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
                />
            </View>
        </View>
    </View>
);

SignInPageWideContainer.propTypes = propTypes;
SignInPageWideContainer.displayName = 'SignInPageWideContainer';

export default withWindowDimensions(SignInPageWideContainer);
