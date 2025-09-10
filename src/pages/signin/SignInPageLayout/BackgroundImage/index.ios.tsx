import {Image} from 'expo-image';
import React, {useEffect, useState} from 'react';
import type {ImageSourcePropType} from 'react-native';
import {InteractionManager} from 'react-native';
import Reanimated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import MobileBackgroundImage from '@assets/images/home-background--ios.svg';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import CONST from '@src/CONST';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';
import type BackgroundImageProps from './types';

function BackgroundImage({width, transitionDuration}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);
    const isAnonymous = isAnonymousUser();

    const opacity = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));
    // This sets the opacity animation for the background image once it has loaded.
    function setOpacityAnimation() {
        opacity.set(
            withTiming(1, {
                duration: CONST.MICROSECONDS_PER_MS,
                easing: Easing.ease,
            }),
        );
    }

    useEffect(() => {
        if (!isAnonymous) {
            return;
        }

        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const {splashScreenState} = useSplashScreenStateContext();
    // Prevent rendering the background image until the splash screen is hidden.
    // See issue: https://github.com/Expensify/App/issues/34696
    if (splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN || (!isInteractionComplete && isAnonymous)) {
        return;
    }

    return (
        <Reanimated.View style={[styles.signInBackground, StyleUtils.getWidthStyle(width), animatedStyle]}>
            <Image
                source={MobileBackgroundImage as ImageSourcePropType}
                onLoadEnd={() => setOpacityAnimation()}
                style={[styles.signInBackground, StyleUtils.getWidthStyle(width)]}
                transition={transitionDuration}
            />
        </Reanimated.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
