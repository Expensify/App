import React from 'react';
import Lottie from 'lottie-react-native';
import * as LottieAnimations from '../../components/LottieAnimations';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

const propTypes = {
    ...windowDimensionsPropTypes,
};

function SignInHeroImage(props) {
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
        <Lottie
            source={LottieAnimations.Hands}
            loop
            autoPlay
            style={[styles.alignSelfCenter, imageSize]}
        />
    );
}

SignInHeroImage.displayName = 'SignInHeroImage';
SignInHeroImage.propTypes = propTypes;

export default withWindowDimensions(SignInHeroImage);
