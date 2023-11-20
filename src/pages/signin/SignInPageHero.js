import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import SignInHeroCopy from './SignInHeroCopy';
import SignInHeroImage from './SignInHeroImage';

const propTypes = {
    /** Override the green headline copy */
    customHeadline: PropTypes.string,

    /** Override the smaller hero body copy below the headline */
    customHeroBody: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    customHeadline: '',
    customHeroBody: '',
};

function SignInPageHero(props) {
    const styles = useThemeStyles();
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
                <SignInHeroCopy
                    customHeadline={props.customHeadline}
                    customHeroBody={props.customHeroBody}
                />
            </View>
        </View>
    );
}

SignInPageHero.displayName = 'SignInPageHero';
SignInPageHero.propTypes = propTypes;
SignInPageHero.defaultProps = defaultProps;

export default withWindowDimensions(SignInPageHero);
