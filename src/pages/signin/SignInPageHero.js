import {View} from 'react-native';
import React from 'react';
import * as StyleUtils from '../../styles/StyleUtils';

// import themeColors from '../../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import SignInHeroImage from './SignInHeroImage';
import SignInHeroCopy from './SignInHeroCopy';
import styles from '../../styles/styles';

// import BuildingsBackgroundImage from '../../../assets/images/home-background--desktop.svg';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageHero = props => (
    <View
        style={[
            StyleUtils.getHeight(props.windowHeight),
            StyleUtils.getBackgroundColorStyle('pink'),
        ]}
    >
        <View style={[
            {display: 'flex'},
            styles.flex1,
            !props.isLargeScreenWidth ? styles.flexColumnReverse : styles.flexRow,
            {gap: 40},
            StyleUtils.getBackgroundColorStyle('red'),
        ]}
        >
            <SignInHeroCopy />
            <SignInHeroImage />
        </View>
    </View>
);

SignInPageHero.displayName = 'SignInPageHero';
SignInPageHero.propTypes = propTypes;

export default withWindowDimensions(SignInPageHero);
