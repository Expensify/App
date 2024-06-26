import React, {useMemo} from 'react';
import {View} from 'react-native';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSplashScreen from '@hooks/useSplashScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';

function SignInHeroImage() {
    const styles = useThemeStyles();
    const {isMediumScreenWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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

    const {isSplashHidden} = useSplashScreen();
    // Prevents rendering of the Lottie animation until the splash screen is hidden
    // by returning an empty view of the same size as the animation.
    // See issue: https://github.com/Expensify/App/issues/34696
    if (!isSplashHidden) {
        return <View style={[styles.alignSelfCenter, imageSize]} />;
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
