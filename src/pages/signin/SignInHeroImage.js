import {View} from 'react-native';
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Illustrations from '../../components/Icon/Illustrations';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const SignInHeroImage = (props) => {
    let imageSize;
    if (props.isSmallScreenWidth) {
        imageSize = {
            height: variables.signInHeroImageMobileHeight,
            width: variables.signInHeroImageMobileWidth,
        };
    } else if (props.isMediumScreenWidth) {
        imageSize = {
            height: variables.signInHeroImageTabletHeight,
            width: variables.signInHeroImageTabletWidth,
        };
    } else {
        imageSize = {
            height: variables.signInHeroImageDesktopHeight,
            width: variables.signInHeroImageDesktopWidth,
        };
    }

    return (
        <View style={[styles.alignSelfCenter, imageSize]}>
            <Illustrations.Hands
                width="100%"
                height="100%"
            />
        </View>
    );
};

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
