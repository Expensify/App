import React from 'react';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function SignInHeroImage(props) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    let imageSize;
    if (shouldUseNarrowLayout) {
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
            webStyle={{...styles.alignSelfCenter, ...imageSize}}
        />
    );
}

SignInHeroImage.displayName = 'SignInHeroImage';

export default SignInHeroImage;
