import {View} from 'react-native';
import React from 'react';
import * as StyleUtils from '../../styles/StyleUtils';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import SignInHeroImage from './SignInHeroImage';
import SignInHeroCopy from './SignInHeroCopy';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

// import SignInHeroBackgroundImage from '../../../assets/images/home-background--desktop.svg';

// import BuildingsBackgroundImage from '../../../assets/images/home-background--desktop.svg';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInPageHero = props => (
    <View
        style={[
            StyleUtils.getHeight(props.windowHeight),
            StyleUtils.getBackgroundColorStyle(''),
            {minHeight: 700},
        ]}
    >
        {/* <SignInHeroBackgroundImage
            pointerEvents="none"
            height="100%"
            style={StyleUtils.getReportWelcomeBackgroundImageStyle(props.isSmallScreenWidth)}
        /> */}
        <View style={[
            styles.flex1,
            props.windowWidth <= variables.signInDesktopBreakpoint ? styles.flexColumnReverse : styles.flexRow,
            styles.gap9,
            StyleUtils.getBackgroundColorStyle(''),
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
