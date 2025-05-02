import React, {useMemo} from 'react';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import variables from '@styles/variables';

function SignInHeroImage() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const imageSize = useMemo(() => {
        if (shouldUseNarrowLayout) {
            return {
                height: variables.signInHeroImageMobileHeight,
                width: variables.signInHeroImageMobileWidth,
            };
        }

        return {
            height: isMediumScreenWidth ? variables.signInHeroImageTabletHeight : variables.signInHeroImageDesktopHeight,
            width: isMediumScreenWidth ? variables.signInHeroImageTabletWidth : variables.signInHeroImageDesktopWidth,
        };
    }, [shouldUseNarrowLayout, isMediumScreenWidth]);

    return (
        <Lottie
            source={LottieAnimations.Hands}
            loop
            autoPlay
            shouldLoadAfterInteractions={isAnonymousUser()}
            style={[styles.alignSelfCenter, imageSize]}
            webStyle={{...styles.alignSelfCenter, ...imageSize}}
        />
    );
}

SignInHeroImage.displayName = 'SignInHeroImage';

export default SignInHeroImage;
