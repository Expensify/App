import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import * as StyleUtils from '../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import SignInHeroImage from './SignInHeroImage';
import SignInHeroCopy from './SignInHeroCopy';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    /** Override the green headline copy */
    customHeadline: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    customHeadline: '',
};

function SignInPageHero(props) {
    return (
        <View
            style={[
                StyleUtils.getHeight(props.windowHeight < variables.signInContentMinHeight ? variables.signInContentMinHeight : props.windowHeight),
                StyleUtils.getMinimumHeight(variables.signInContentMinHeight),
                props.windowWidth <= variables.tabletResponsiveWidthBreakpoint ? styles.flexColumn : styles.flexColumn,
                styles.pt20,
                StyleUtils.getMaximumWidth(variables.signInHeroContextMaxWidth),
                styles.alignSelfCenter,
            ]}
        >
            <View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
                <SignInHeroImage />
                <SignInHeroCopy customHeadline={props.customHeadline} />
            </View>
        </View>
    );
}

SignInPageHero.displayName = 'SignInPageHero';
SignInPageHero.propTypes = propTypes;
SignInPageHero.defaultProps = defaultProps;

export default withWindowDimensions(SignInPageHero);
