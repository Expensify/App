import React, {useMemo} from 'react';
import {View} from 'react-native';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function SignInHeroImage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
        <View
            accessible
            role={CONST.ROLE.IMG}
            accessibilityLabel={translate('common.expensifyLogo')}
            tabIndex={0}
        >
            <Lottie
                source={LottieAnimations.Hands}
                loop
                autoPlay
                shouldLoadAfterInteractions={isAnonymousUser()}
                style={[styles.alignSelfCenter, imageSize]}
                webStyle={{...styles.alignSelfCenter, ...imageSize}}
            />
        </View>
    );
}

export default SignInHeroImage;
