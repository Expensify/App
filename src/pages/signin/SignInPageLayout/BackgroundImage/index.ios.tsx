import {Image} from 'expo-image';
import React, {useMemo} from 'react';
import type {ImageSourcePropType} from 'react-native';
import Reanimated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile-new.svg';
import useSplashScreen from '@hooks/useSplashScreen';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type BackgroundImageProps from './types';

function BackgroundImage({width, transitionDuration, isSmallScreen = false}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const src = useMemo(() => (isSmallScreen ? MobileBackgroundImage : DesktopBackgroundImage), [isSmallScreen]);

    const opacity = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({opacity: opacity.value}));
    // This sets the opacity animation for the background image once it has loaded.
    function setOpacityAnimation() {
        // eslint-disable-next-line react-compiler/react-compiler
        opacity.value = withTiming(1, {
            duration: CONST.MICROSECONDS_PER_MS,
            easing: Easing.ease,
        });
    }

    const {isSplashHidden} = useSplashScreen();
    // Prevent rendering the background image until the splash screen is hidden.
    // See issue: https://github.com/Expensify/App/issues/34696
    if (!isSplashHidden) {
        return;
    }

    return (
        <Reanimated.View style={[styles.signInBackground, StyleUtils.getWidthStyle(width), animatedStyle]}>
            <Image
                source={src as ImageSourcePropType}
                onLoadEnd={() => setOpacityAnimation()}
                style={[styles.signInBackground, StyleUtils.getWidthStyle(width)]}
                transition={transitionDuration}
            />
        </Reanimated.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
