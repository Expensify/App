import React, {useMemo} from 'react';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import type {SignInPageLayoutProps} from './types';

type SignInHeroImageProps = Pick<SignInPageLayoutProps, 'shouldShowSmallScreen'>;

function SignInHeroImage({shouldShowSmallScreen = false}: SignInHeroImageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const imageSize = useMemo(() => {
        if (isSmallScreenWidth || shouldShowSmallScreen) {
            return {
                height: variables.signInHeroImageMobileHeight,
                width: variables.signInHeroImageMobileWidth,
            };
        }

        return {
            height: isMediumScreenWidth ? variables.signInHeroImageTabletHeight : variables.signInHeroImageDesktopHeight,
            width: isMediumScreenWidth ? variables.signInHeroImageTabletWidth : variables.signInHeroImageDesktopWidth,
        };
    }, [shouldShowSmallScreen, isMediumScreenWidth, isSmallScreenWidth]);

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
