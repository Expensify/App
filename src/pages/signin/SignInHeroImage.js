import React from 'react';
import Lottie from '@components/Lottie';
import * as LottieAnimations from '@components/LottieAnimations';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import variables from '@styles/variables';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    ...windowDimensionsPropTypes,
};

function SignInHeroImage(props) {
    const styles = useThemeStyles();
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
