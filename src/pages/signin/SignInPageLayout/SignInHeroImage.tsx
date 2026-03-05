import React, {useMemo} from 'react';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import {isAnonymousUser} from '@libs/actions/Session';
import variables from '@styles/variables';

function SignInHeroImage() {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
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

    if (isReduceMotionEnabled) {
        return (
            <ImageSVG
                src={illustrations.Hands}
                style={[styles.alignSelfCenter, imageSize]}
            />
        );
    }

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

export default SignInHeroImage;
