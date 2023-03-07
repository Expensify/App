import {View} from 'react-native';
import React from 'react';
import * as StyleUtils from '../../styles/StyleUtils';

// import themeColors from '../../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import SignInHeroImage from './SignInHeroImage';
import SignInHeroCopy from './SignInHeroCopy';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

// import BuildingsBackgroundImage from '../../../assets/images/home-background--desktop.svg';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageHero = props => (
    <View
        style={[
            StyleUtils.getHeight(props.windowHeight),
            StyleUtils.getBackgroundColorStyle('transparent'),
            {minHeight: 700},
        ]}
    >
        <View style={[
            styles.flex1,
            props.windowWidth <= variables.signInDesktopBreakpoint ? styles.flexColumnReverse : styles.flexRow,
            styles.gap9,
            StyleUtils.getBackgroundColorStyle('transparent'),
            styles.pb20,
            props.isMediumScreenWidth ? {paddingVertical: 90} : {paddingTop: 140},
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
