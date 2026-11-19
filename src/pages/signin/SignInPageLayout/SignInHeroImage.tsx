import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import {useSession} from '@components/OnyxListItemProvider';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {isAnonymousUser} from '@libs/actions/Session';

import variables from '@styles/variables';

import React from 'react';

function SignInHeroImage() {
    const styles = useThemeStyles();
    const session = useSession();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Hands']);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    let imageSize;
    if (shouldUseNarrowLayout) {
        imageSize = {
            height: variables.signInHeroImageMobileHeight,
            width: variables.signInHeroImageMobileWidth,
        };
    } else {
        imageSize = {
            height: isMediumScreenWidth ? variables.signInHeroImageTabletHeight : variables.signInHeroImageDesktopHeight,
            width: isMediumScreenWidth ? variables.signInHeroImageTabletWidth : variables.signInHeroImageDesktopWidth,
        };
    }

    if (isReduceMotionEnabled) {
        return (
            <ImageSVG
                src={illustrations.Hands}
                style={{...styles.alignSelfCenter, ...imageSize}}
            />
        );
    }

    return (
        <Lottie
            source={LottieAnimations.Hands}
            loop
            autoPlay
            shouldLoadAfterInteractions={isAnonymousUser(session)}
            style={[styles.alignSelfCenter, imageSize]}
            webStyle={{...styles.alignSelfCenter, ...imageSize}}
        />
    );
}

export default SignInHeroImage;
