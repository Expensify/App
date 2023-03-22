
import {View} from 'react-native';
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Illustrations from '../../components/Icon/Illustrations';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInHeroImage = props => (
    <View style={[{backgroundColor: 'transparent'}, styles.alignSelfCenter, styles.flex1, props.isSmallScreenWidth
        ? {
            width: props.windowHeight > variables.signInContentMinHeight ? props.windowWidth : 387,
            height: props.windowHeight > variables.signInContentMinHeight ? props.windowWidth : 387,
        } : {width: 387}]}
    >
        {props.isSmallScreenWidth ? (
            <Illustrations.HandsMobile
                width="100%"
                height="100%"
            />
        ) : (
            <Illustrations.HandsDesktop
                width="100%"
                height="100%"
            />
        )}
    </View>
);

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
