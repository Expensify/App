import {Image} from 'expo-image';
import React, {useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import MobileBackgroundImage from '@assets/images/home-background--mobile.svg';
import SignInGradient from '@assets/images/home-fade-gradient--mobile.svg';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import CONST from '@src/CONST';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';

function BackgroundImage() {
    const styles = useThemeStyles();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);
    const isAnonymous = isAnonymousUser();

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
        <>
            <Image
                source={MobileBackgroundImage as ImageSourcePropType}
                pointerEvents="none"
                style={styles.signInBackgroundNative}
                transition={CONST.BACKGROUND_IMAGE_TRANSITION_DURATION}
            />
            <View style={styles.signInPageGradientTopMobile}>
                <ImageSVG
                    src={SignInGradient}
                    height="100%"
                />
            </View>
        </>
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
